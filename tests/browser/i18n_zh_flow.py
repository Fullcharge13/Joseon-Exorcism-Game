"""간체 화면 순회 (v18.1, Playwright)
사용: python3 tests/browser/i18n_zh_flow.py [게임.html]
기기 언어를 zh-CN으로 두고 화면 50여 개를 휴대폰(390×844, 터치)·PC(1280×800)로 연다. 처음 저장·넉넉한 저장 두 번.
확인: 화면 글·캔버스 글에 한글 0자 · 화면 밖으로 넘치는 요소 0 · 페이지 오류 0 · 장면 실행 오류 0. 캡처는 tests/browser/out/zh/."""
import sys, re, pathlib
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from i18n_scen import INIT, RICH, SNAP, SCEN
ROOT = pathlib.Path(__file__).resolve().parents[2]
game = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / 'index.html')
OUT = ROOT / 'tests' / 'browser' / 'out' / 'zh'; OUT.mkdir(parents=True, exist_ok=True)
HAN = re.compile(r'[가-힣ㄱ-ㅎㅏ-ㅣ]')
ZH = "Object.defineProperty(navigator,'language',{get:()=>'zh-CN'});Object.defineProperty(navigator,'languages',{get:()=>['zh-CN']});"
OVER = """()=>{const W=innerWidth,bad=[];const scr=e=>{for(let p=e.parentElement;p;p=p.parentElement){const o=getComputedStyle(p).overflowX;if(o==='auto'||o==='scroll'||o==='hidden')return true;}return false;};
 for(const root of document.querySelectorAll('.screen:not([hidden]),#hud,#toast'))for(const e of root.querySelectorAll('*')){const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;
  if((r.right>W+1||r.left<-1)&&!scr(e))bad.push((e.id||e.className||e.tagName)+' '+Math.round(r.left)+'~'+Math.round(r.right)+' '+(e.innerText||'').slice(0,20));
  else if(e.children.length===0&&e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflow==='hidden')bad.push('잘림 '+(e.id||e.className||e.tagName)+' '+(e.innerText||'').slice(0,20));}
 if(document.documentElement.scrollWidth>W+1)bad.push('가로 스크롤 '+document.documentElement.scrollWidth);return bad.slice(0,4);}"""
VIEWS = [('phone', dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2)), ('pc', dict(viewport={'width': 1280, 'height': 800}))]
only = set(a for a in sys.argv[2:])
fails, n = [], 0
with sync_playwright() as p:
    br = p.chromium.launch()
    for vname, vopt in VIEWS:
        for rich in (False, True):
            ctx = br.new_context(**vopt); ctx.add_init_script(ZH + INIT); ctx.route('**/fonts.g*/**', lambda r: r.abort())
            pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto('file://' + str(pathlib.Path(game).resolve())); pg.wait_for_timeout(500)
            if rich: pg.evaluate(RICH)
            if pg.evaluate("()=>LANG") != 'zh': fails.append(f'{vname}: 기기 언어 zh-CN인데 LANG이 zh가 아님')
            for i, (name, js) in enumerate(SCEN):
                if only and name not in only: continue
                if i: pg.reload(); pg.wait_for_timeout(300)
                pg.evaluate(f"()=>{{window.__seed({i+7});window.__txt=[];try{{if(typeof G!=='undefined'&&G&&modal)show(null);}}catch(e){{}}try{{{js}}}catch(e){{window.__err=String(e);}}}}")
                if name.startswith('game') or name in ('guide', 'rush', 'tale'): pg.evaluate("()=>{try{for(let i=0;i<4;i++)frame(200000+i*16);}catch(e){window.__err=String(e);}}")
                pg.wait_for_timeout(200); n += 1
                s = pg.evaluate(SNAP, name); err = pg.evaluate("()=>window.__err||''")
                txt = '\n'.join([s['overlay'], s['hud'], s['toast'], pg.evaluate("()=>document.title")] + s['canvas'])
                tag = f"{vname}{'·넉넉' if rich else ''} {name}"
                h = [l for l in txt.split('\n') if HAN.search(l) and l.strip() != '한국어']   # 언어 단추의 「한국어」는 늘 한국어로 둔다
                if h: fails.append(f'{tag} 한글 {len(h)}줄: ' + ' / '.join(x.strip()[:40] for x in h[:3]))
                o = pg.evaluate(OVER)
                if o: fails.append(f'{tag} 넘침: ' + ' / '.join(o))
                if err: fails.append(f'{tag} 장면 오류: {err[:80]}')
                if rich: pg.screenshot(path=str(OUT / f'{vname}_{name}.png'))
            if errs: fails.append(f"{vname}{'·넉넉' if rich else ''} 페이지 오류: {errs[:2]}")
            ctx.close()
    br.close()
if fails: print(f'FAIL i18n_zh_flow ({len(fails)}건 / 화면 {n})\n  ' + '\n  '.join(fails[:60])); sys.exit(1)
print(f'PASS i18n_zh_flow (간체 화면 {n}개 · 휴대폰·PC · 한글 0 · 넘침 0)')
