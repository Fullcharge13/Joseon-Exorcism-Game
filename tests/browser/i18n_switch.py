"""판 도중 언어 바꾸기 (v18.1 검토 지적 회귀 시험, Playwright)
사용: python3 tests/browser/i18n_switch.py [게임.html]
한국어로 판을 시작해 조금 진행 → 일시정지 → 설정에서 中文 → 돌아가기: 일시정지 화면·상단(HUD)에 한글 0
→ 다시 설정에서 한국어 → 돌아가기: 간체에만 쓰는 낱말(坚持时间·等级·击杀 등)과 간체 막 이름이 남지 않음.
본편과 설화 출정 두 가지, 휴대폰·PC 두 크기."""
import sys, re, pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parents[2]
game = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / 'index.html')
HAN = re.compile(r'[가-힣]')
ZHW = ['坚持', '等级', '击杀', '铜钱', '灵兽', '未拥有', '难度', '普通', '第1幕', '汉阳', '书生']
GRAB = "()=>['#pause','#hud'].map(s=>{const e=document.querySelector(s);return e&&!e.hidden?e.innerText:'';}).join('\\n')"
START = {'normal': "newGame('seonbi','gilil',0,'normal');", 'tale': "taleStart('woochi');"}
fails = []
with sync_playwright() as p:
    br = p.chromium.launch()
    for vname, vopt in [('phone', dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)), ('pc', dict(viewport={'width': 1280, 'height': 800}))]:
        for mode, js in START.items():
            ctx = br.new_context(**vopt); ctx.add_init_script("Object.defineProperty(navigator,'language',{get:()=>'ko-KR'})"); ctx.route('**/fonts.g*/**', lambda r: r.abort())
            pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto('file://' + str(pathlib.Path(game).resolve())); pg.wait_for_timeout(400)
            pg.evaluate("()=>{" + js + "G.P.hp=G.P.maxHp=1e7;for(let i=0;i<60&&modal;i++){if(modal==='scene')sceneNext();else show(null);}for(let i=0;i<120;i++)frame(100000+i*16);}")
            tag = f'{vname} {mode}'
            pg.evaluate("()=>{if(modal)show(null);openPause();openSettings('pause');}")
            pg.select_option('#setLang', 'zh'); pg.wait_for_timeout(150); pg.click('#setBack'); pg.wait_for_timeout(150)
            t = pg.evaluate(GRAB); h = [l for l in t.split('\n') if HAN.search(l)]
            if not t.strip(): fails.append(f'{tag}: 일시정지 화면이 비어 있음')
            if h: fails.append(f'{tag} 간체로 바꾼 뒤 한글: ' + ' / '.join(x[:40] for x in h[:4]))
            pg.evaluate("()=>{show(null);for(let i=0;i<3;i++)frame(200000+i*16);openPause();openSettings('pause');}")
            pg.select_option('#setLang', 'ko'); pg.wait_for_timeout(150); pg.click('#setBack'); pg.wait_for_timeout(150)
            t = pg.evaluate(GRAB); z = [w for w in ZHW if w in t]
            if z: fails.append(f'{tag} 한국어로 되돌린 뒤 간체 낱말: ' + ', '.join(z))
            if errs: fails.append(f'{tag} 페이지 오류: {errs[:2]}')
            ctx.close()
    br.close()
if fails: print(f'FAIL i18n_switch ({len(fails)})\n  ' + '\n  '.join(fails)); sys.exit(1)
print('PASS i18n_switch (판 도중 한국어↔간체 · 본편·설화 · 휴대폰·PC)')
