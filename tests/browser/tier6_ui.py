"""6차 전직 화면 시험(v19.0, Playwright, PC 1280×720·휴대폰 390×844)
사용: python3 tests/browser/tier6_ui.py [게임.html]   캡처 → tests/browser/out/tier6/
 ① 선비 학문 5차 Lv 60 전직 창: 제목 「성현에서 다산 정약용(으)로」, 기술 「거중기」, 인물 소개 한 줄, 수련 셋
 ② 고르면 상태창 줄기에 6단계(… → 성현 → 다산 정약용)
 ③ 1차 갈래 고르기 카드의 줄기 끝에 6차 인물
 ④ 도움말 「직업과 전직」: 6차 인물·소개·고증 출처(v19.1부터 12갈래 모두, 「곧」 없음)
 모든 화면 가로 넘침 0 · 화면 오류 0"""
import sys, pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parents[2]
game = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / 'index.html')
OUT = ROOT / 'tests' / 'browser' / 'out' / 'tier6'; OUT.mkdir(parents=True, exist_ok=True)
fails = []; errs = []
OVER = "()=>{const o=[];for(const e of document.querySelectorAll('body *')){const r=e.getBoundingClientRect();if(r.width&&e.offsetParent!==null&&(r.right>innerWidth+1||r.left<-1))o.push(e.tagName+'.'+e.className);}return o.slice(0,5);}"
T5 = "()=>{show(null);newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);const P=G.P;P.hp=P.maxHp=1e9;P.branch=0;P.tier=5;P.lvl=60;G.queue.length=0;openAdv();return {eye:$('#advEye').textContent,title:$('#advTitle').textContent,txt:$('#advCards').innerText,picks:advPick.length};}"
with sync_playwright() as p:
    br = p.chromium.launch()
    for vname, vopt in (('pc', dict(viewport={'width': 1280, 'height': 720})), ('phone', dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2))):
        ctx = br.new_context(**vopt); ctx.add_init_script("window.requestAnimationFrame=()=>0;"); ctx.route('**/fonts.g*/**', lambda r: r.abort())
        pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); pg.goto('file://' + str(pathlib.Path(game).resolve())); pg.wait_for_timeout(400)
        a = pg.evaluate(T5); pg.wait_for_timeout(300); pg.screenshot(path=str(OUT / f'{vname}_adv6.png'))
        if '6차' not in a['eye'] or '60' not in a['eye']: fails.append(f'{vname} ① 눈썹 글 {a["eye"]}')
        if '다산 정약용' not in a['title'] or '성현' not in a['title']: fails.append(f'{vname} ① 제목 {a["title"]}')
        if '거중기' not in a['txt'] or '실학자' not in a['txt'] or a['picks'] != 3: fails.append(f'{vname} ① 기술·소개·수련 셋 ({a["picks"]}) {a["txt"][:120]}')
        o = pg.evaluate(OVER)
        if o: fails.append(f'{vname} ① 넘침 {o}')
        pg.evaluate("()=>{advPick[0]();openStatus();}"); pg.wait_for_timeout(300); pg.screenshot(path=str(OUT / f'{vname}_status6.png'))
        st = pg.evaluate("()=>$('#stHead').innerText")
        if '성현 → 다산 정약용' not in st: fails.append(f'{vname} ② 상태창 줄기 {st[:160]}')
        pg.evaluate("()=>{show(null);newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);G.P.lvl=10;openAdv();}"); pg.wait_for_timeout(300); pg.screenshot(path=str(OUT / f'{vname}_adv1.png'))
        t1 = pg.evaluate("()=>$('#advCards').innerText")
        if '다산 정약용' not in t1 or '어사 박문수' not in t1: fails.append(f'{vname} ③ 갈래 줄기 끝 6차 {t1[:200]}')
        pg.evaluate("()=>{show(null);openHelp('title');helpTab='class';renderHelp();}"); pg.wait_for_timeout(300); pg.screenshot(path=str(OUT / f'{vname}_help.png'), full_page=True)
        hp = pg.evaluate("()=>document.querySelector('#overlay')?document.querySelector('#overlay').innerText:document.body.innerText")
        for w in ('다산 정약용', '수원 화성을 설계하고', '한국민족문화대백과사전', '홍의장군 곽재우', '의기 논개', '도반수 백달원', '토정 이지함'):
            if w not in hp: fails.append(f'{vname} ④ 도움말에 「{w}」 없음')
        if 'Lv 60 6차 · 곧' in hp: fails.append(f'{vname} ④ v19.1: 「곧」이 남음')
        o = pg.evaluate(OVER)
        if o: fails.append(f'{vname} ④ 넘침 {o}')
        ctx.close()
    br.close()
if errs: fails.append('화면 오류 ' + '; '.join(errs[:3]))
if fails: print(f'FAIL tier6_ui ({len(fails)})\n  ' + '\n  '.join(fails)); sys.exit(1)
print('PASS tier6_ui (6차 전직 창 · 상태창 · 갈래 줄기 · 도움말 · PC·휴대폰 · 넘침 0 · 화면 오류 0)')
