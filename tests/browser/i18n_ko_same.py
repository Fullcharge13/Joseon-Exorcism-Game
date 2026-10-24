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
import sys as _s; _s.path.insert(0, str(pathlib.Path(__file__).parent))
from i18n_scen import INIT, RICH, SNAP, SCEN, G0
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
LANGLN = re.compile(r'(한국어|中文|언어 · Language)(\s*(한국어|中文))*\s*')   # v18.1에 새로 생긴 언어 단추·설정 줄은 옛 판에 없는 것이 맞음
VER = lambda x: '\n'.join(l for l in re.sub(r'v\d+\.\d+', 'vX', x).split('\n') if not LANGLN.fullmatch(l)) if isinstance(x, str) else [VER(y) for y in x] if isinstance(x, list) else x   # 판 번호는 다르게 보이는 것이 맞음
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
