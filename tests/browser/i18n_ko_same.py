"""한국어 화면 글이 옛 판과 같은지 (v18.0 다국어 공사 회귀 시험, Playwright)
사용: python3 tests/browser/i18n_ko_same.py [옛.html] [새.html]
  옛 판을 안 주면 git의 v17.5(0db64b0) index.html을 꺼내 쓴다.
같은 씨앗·같은 시각으로 화면 50여 개를 열어 화면 글(innerText)과 캔버스에 쓴 글(fillText)을 모아 비교한다.
처음 저장(잠김 많음)과 넉넉한 저장(모두 열림) 두 번 돈다."""
import sys, json, pathlib, subprocess, tempfile, difflib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parents[2]
old = sys.argv[1] if len(sys.argv) > 1 else None
new = sys.argv[2] if len(sys.argv) > 2 else str(ROOT / 'index.html')
if not old:
    tmp = pathlib.Path(tempfile.mkdtemp()) / 'v175.html'
    tmp.write_text(subprocess.run(['git', '-C', str(ROOT), 'show', '0db64b0:index.html'], capture_output=True, text=True, check=True).stdout, encoding='utf8'); old = str(tmp)
INIT = """(()=>{const T=1792800000000;const D=Date;class FD extends D{constructor(...a){super(...(a.length?a:[T]));}static now(){return T;}}window.Date=FD;window.requestAnimationFrame=()=>0;   /* 저절로 도는 장면을 멈춰 시계·HUD가 시험마다 같게 */
 let s=1;window.__seed=n=>{s=n;};Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};
 window.__txt=[];const wrap=p=>{const f=p.fillText;p.fillText=function(x,...r){window.__txt.push(String(x));return f.call(this,x,...r);};};wrap(CanvasRenderingContext2D.prototype);})();"""
RICH = """()=>{meta.coins=5000;meta.unl=[...new Set([...(meta.unl||[]),...Object.keys(CHARS).map(c=>'char:'+c),...Object.keys(WD).filter(i=>WD[i].lock).map(i=>'w:'+i)])];
 meta.done=TASKS.filter((t,i)=>i%2===0).map(t=>t.id);meta.anom={};for(const a of ANOM.slice(0,6))meta.anom[a.id]=1;meta.hub.runs=12;meta.stats.dkIn=2;meta.hub.mak=3;
 for(const id in NPCS)meta.hub.aff[id]=2;meta.tale=meta.tale||{};meta.tale.frag={woochi:3,jiha:3,bari:1};meta.curseMax=3;saveMeta();}"""
SNAP = """(name)=>{const vis=[...document.querySelectorAll('.screen')].filter(s=>!s.hidden).map(s=>s.id);
 const pick=sel=>{const e=document.querySelector(sel);return e&&!e.hidden?e.innerText:'';};
 return {screens:vis,overlay:pick('#overlay'),hud:pick('#hud'),toast:pick('#toast')+pick('#task'),canvas:window.__txt.slice(0,80)};}"""
G0 = "newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);G.P.hp=G.P.maxHp=1e7;"
SCEN = [
 ('title', "renderTitle();show('title');"), ('prep', "openPrep();"),
 *[(f'help_{k}', f"openHelp('title');helpTab='{k}';renderHelp();") for k in ['basic','class','pet','weapon','item','rule','foe','tip']],
 ('hub', "openHub();"), *[(f'codex_{k}', f"openCodex('title');codexTab='{k}';renderCodex();") for k in ['task','dogam','anom','tale']],
 ('arch', "openArch('title');"), ('arch_cls', "openArch('title');$('#tabCls').click();"), ('arch_log', "openArch('title');$('#tabLog').click();"),
 ('shop', "renderShop();show('shop');"), ('settings', "openSettings('title');"),
 ('game_hud', G0+"for(let i=0;i<90;i++)frame(100000+i*16);"),
 ('levelup', G0+"openLevel();"), ('chest', G0+"G.weapons[0].lv=5;openChest(2);"), ('tavern', G0+"openTavern();"), ('path', G0+"openPath();"),
 ('bless', G0+"openBless('신령의 축복');"), ('adv', G0+"G.P.lvl=10;openAdv();"), ('pet', G0+"openPet();"), ('pause', G0+"openPause();"),
 ('status', G0+"openStatus();"), ('status_p', G0+"openStatus();$('#tabStP').click();"), ('status_s', G0+"openStatus();$('#tabStS').click();"),
 ('dk', G0+"openDk();"), ('temper', G0+"openTemper(()=>{});"), ('seal', G0+"openSeal();"), ('awk', G0+"G.P.lvl=54;G.P.tier=5;openAwk();"),
 ('ult', G0+"G.P.lvl=74;G.P.tier=5;openUlt();"), ('endless', G0+"openEndless();"),
 ('over_lose', G0+"G.time=300;G.kills=420;endGame(false);"), ('over_win', G0+"G.stage=9;G.time=1500;endGame(true);"),
 ('guide', G0+"const P=G.P;G.shrine={x:P.x-40,y:P.y-20,prog:0,need:3.5};guideSay('shrine',G.shrine,'appear');G.anom={id:'flip',x:P.x+40,y:P.y,prog:0,need:2.5,t:0};guideSay('anom',G.anom,'near');for(let i=0;i<3;i++)frame(100000+i*16);"),
 ('tale', "taleStart('woochi');"), ('rush', "newGame('seonbi','gilil',0,'normal','rush');"),
]
def run(path, rich):
    out = {}
    with sync_playwright() as p:
        br = p.chromium.launch(); ctx = br.new_context(viewport={'width': 1280, 'height': 800}); ctx.add_init_script(INIT)
        ctx.route('**/fonts.g*/**', lambda r: r.abort()); pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + str(pathlib.Path(path).resolve())); pg.wait_for_timeout(500)
        if rich: pg.evaluate(RICH)
        for i, (name, js) in enumerate(SCEN):
            if i: pg.reload(); pg.wait_for_timeout(350)   # 화면마다 새로 열어 앞 화면의 상태가 새지 않게
            pg.evaluate(f"()=>{{window.__seed({i+7});window.__txt=[];try{{if(typeof G!=='undefined'&&G&&modal)show(null);}}catch(e){{}}try{{{js}}}catch(e){{window.__err=String(e);}}}}")
            pg.wait_for_timeout(250)
            snap = pg.evaluate(SNAP, name); snap['err'] = pg.evaluate("()=>{const e=window.__err||'';window.__err='';return e;}")
            out[name] = snap
        out['_pageerrors'] = errs; br.close()
    return out
import re
VER = lambda x: re.sub(r'v\d+\.\d+', 'vX', x) if isinstance(x, str) else [VER(y) for y in x] if isinstance(x, list) else x   # 판 번호는 다르게 보이는 것이 맞음
fails = []; total = 0
for rich in (False, True):
    a, b = run(old, rich), run(new, rich); tag = '넉넉한 저장' if rich else '처음 저장'
    for k in a:
        if k == '_pageerrors': continue
        total += 1
        for f in ('screens', 'overlay', 'hud', 'toast', 'canvas', 'err'):
            if VER(a[k][f]) != VER(b[k][f]):
                x = a[k][f] if isinstance(a[k][f], str) else '\n'.join(map(str, a[k][f])); y = b[k][f] if isinstance(b[k][f], str) else '\n'.join(map(str, b[k][f]))
                d = [l for l in difflib.unified_diff(x.split('\n'), y.split('\n'), lineterm='', n=0) if l[:1] in '+-' and l[:3] not in ('+++', '---')][:6]
                fails.append(f'{tag} {k} {f}: ' + ' | '.join(d))
    if a['_pageerrors'] != b['_pageerrors']: fails.append(f'{tag}: 페이지 오류가 다름 옛 {a["_pageerrors"][:2]} 새 {b["_pageerrors"][:2]}')
    if rich: json.dump(b, open(ROOT / 'tests' / 'browser' / 'out' / 'i18n_ko_snap.json', 'w', encoding='utf8') if (ROOT / 'tests/browser/out').exists() else open('/dev/null', 'w'), ensure_ascii=False, indent=0)
if fails: print(f'FAIL i18n_ko_same ({len(fails)}/{total})\n  ' + '\n  '.join(fails[:25])); sys.exit(1)
print(f'PASS i18n_ko_same ({total}개 화면이 옛 판과 같음)')
