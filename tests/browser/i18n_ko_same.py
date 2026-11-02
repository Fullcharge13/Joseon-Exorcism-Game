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
LANGLN = re.compile(r'(한국어|中文|언어 · Language|분위기 효과|그림 다듬기|켬|약하게|끔)(\s*(한국어|中文|켬|약하게|끔))*\s*')   # v18.1 언어 단추·설정 줄, v18.2 설정 「분위기 효과」(켬·약하게·끔), v18.6 「그림 다듬기」(켬·끔)는 옛 판에 없는 것이 맞음
VER0 = lambda x, k='': '\n'.join(l for l in drop6(TASKN.sub('이룬 과업 N', re.sub(r'v\d+(\.\d+)+', 'vX', x.replace(NEWTXT.get(k, '\0'), '')))).split('\n') if not (k in NEWROW and LANGLN.fullmatch(l))) if isinstance(x, str) else [VER0(y, k) for y in x] if isinstance(x, list) else x   # 판 번호는 다르게 보이는 것이 맞음
NEWROW = ('title', 'settings')   # 새 줄을 거르는 화면은 언어 단추·설정이 있는 두 곳뿐(다른 화면의 회귀를 가리지 않게)
# v19.0 6차 전직: 6차 인물·기술·과업이 새로 붙는 줄은 옛 판에 없는 것이 맞음(그 글이 든 줄만 거름, 다른 줄의 회귀는 그대로 잡음)
T6 = re.compile(r'6차|Lv 60|다산 정약용|어사 박문수|구암 허준|신의 백광현|충무공 이순신|홍의장군 곽재우|거중기|봉고파직|백 첩 탕약|대침 발근|울돌목 회오리|홍의 의병|한국민족문화대백과사전|실학자|암행어사 박문수|동의보감|마의에서|울돌목에서|홍의장군')
TASKN = re.compile(r'이룬 과업 \d+ / \d+|과업 \d+/\d+')   # 과업 수는 6차 과업만큼 늘어나는 것이 맞음
T6SUF = re.compile(r' → (다산 정약용|어사 박문수|구암 허준|신의 백광현|충무공 이순신|홍의장군 곽재우)(\([^)]*\))?')
def drop6(x):
    # 줄기 끝 「→ 6차 인물」은 떼고, 6차 글이 든 줄과 그 바로 뒤의 빈 줄·「엽전 300」(과업 보상 줄)은 거른다
    out, skip = [], False
    x = x.replace('레벨 10·20·30·40·50·60에 전직한다. 60의 6차는 선비·의원·장수부터.', '레벨 10·20·30·40·50에 전직한다.')   # v19.0 「처음이라면」 전직 레벨 줄
    for l in T6SUF.sub('', x).split('\n'):
        if T6.search(l): skip = True; continue
        if skip and l.strip() in ('', '엽전 300', '0/6'): continue
        skip = False; out.append(l)
    return '\n'.join(out)
NEWTXT = {'help_weapon': '\n\n단계: 죽패 → 생우피방패 → 장방패 → 원방패 → 등패'}   # v18.5 도감 무기 줄에 방패 단계가 새로 붙는 것이 맞음(그 화면·그 글만)
fails = []; total = 0
for rich in (False, True):
    a, b = run(old, rich), run(new, rich); tag = '넉넉한 저장' if rich else '처음 저장'
    for k in a:
        if k == '_pageerrors': continue
        total += 1
        for f in ('screens', 'overlay', 'hud', 'toast', 'canvas', 'err'):
            if VER0(a[k][f], k) != VER0(b[k][f], k):
                x = VER0(a[k][f], k); y = VER0(b[k][f], k); x = x if isinstance(x, str) else '\n'.join(map(str, x)); y = y if isinstance(y, str) else '\n'.join(map(str, y))   # 거른 뒤의 차이를 보여 줌
                d = [l for l in difflib.unified_diff(x.split('\n'), y.split('\n'), lineterm='', n=0) if l[:1] in '+-' and l[:3] not in ('+++', '---')][:6]
                fails.append(f'{tag} {k} {f}: ' + ' | '.join(d))
    if a['_pageerrors'] != b['_pageerrors']: fails.append(f'{tag}: 페이지 오류가 다름 옛 {a["_pageerrors"][:2]} 새 {b["_pageerrors"][:2]}')
    if rich: json.dump(b, open(ROOT / 'tests' / 'browser' / 'out' / 'i18n_ko_snap.json', 'w', encoding='utf8') if (ROOT / 'tests/browser/out').exists() else open('/dev/null', 'w'), ensure_ascii=False, indent=0)
if fails: print(f'FAIL i18n_ko_same ({len(fails)}/{total})\n  ' + '\n  '.join(fails[:25])); sys.exit(1)
print(f'PASS i18n_ko_same ({total}개 화면이 옛 판과 같음)')
