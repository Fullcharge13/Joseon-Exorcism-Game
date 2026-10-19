"""고르기 창 누르기 시험
(CDP Input.dispatchTouchEvent: touchEnd 에 적은 손가락이 떨어진다) (실제 브라우저, Playwright)
사용: python3 tests/browser/pick_touch.py [게임.html]
 1) 휴대폰: 한 손가락으로 이동을 누른 채 다른 손가락으로 전직 카드를 탭해도 전직된다. 펫 카드도 같다.
 2) 휴대폰·PC: 한 번 누르면 정확히 한 번만 골라진다(두 번 처리되지 않는다).
 3) 2~5차 전직: 고르는 칸 전체가 눌린다(카드의 대부분이 반응하지 않던 문제).
"""
import sys, json, pathlib
from playwright.sync_api import sync_playwright
game = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
fails = []
def ok(c, m):
    if not c: fails.append(m)
def tp(x, y, i): return {'x': x, 'y': y, 'id': i, 'radiusX': 5, 'radiusY': 5, 'force': 1}
COUNT = """()=>{window.__n=0;const a=applyOpt;applyOpt=function(o){window.__n++;return a(o);};
 const g=grantTier;grantTier=function(...x){window.__g=(window.__g||0)+1;return g(...x);};
 const p=pickPet;pickPet=function(...x){window.__p=(window.__p||0)+1;return p(...x);};}"""
with sync_playwright() as p:
    br = p.chromium.launch()
    def page(mob):
        ctx = br.new_context(viewport={'width': 390, 'height': 844} if mob else {'width': 1280, 'height': 800},
                             device_scale_factor=2 if mob else 1, is_mobile=mob, has_touch=mob)
        ctx.route('**/fonts.g*/**', lambda r: r.abort()); pg = ctx.new_page()
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + str(pathlib.Path(game).resolve())); pg.wait_for_timeout(400)
        return ctx, pg, errs
    # 1) 휴대폰: 이동 손가락을 누른 채 탭
    ctx, pg, errs = page(True); cdp = ctx.new_cdp_session(pg)
    T = lambda typ, pts: cdp.send('Input.dispatchTouchEvent', {'type': typ, 'touchPoints': pts})
    pg.evaluate("()=>{newGame('seonbi','gilil',0,'normal');}"); pg.wait_for_timeout(200)
    pg.evaluate(COUNT)
    T('touchStart', [tp(200, 700, 1)]); T('touchMove', [tp(230, 690, 1)]); pg.wait_for_timeout(150)
    pg.evaluate("()=>{G.P.lvl=10;openAdv();}"); pg.wait_for_timeout(700)
    b = pg.locator('#advCards button').first.bounding_box()
    x2, y2 = b['x'] + b['width'] / 2, b['y'] + 60
    T('touchStart', [tp(230, 690, 1), tp(x2, y2, 2)]); pg.wait_for_timeout(60); T('touchEnd', [tp(x2, y2, 2)])  # 두 번째 손가락만 뗌(이동 손가락은 계속 누름)
    pg.wait_for_timeout(250)
    st = pg.evaluate("()=>({modal,tier:G.P.tier,g:window.__g||0})")
    ok(st['tier'] == 1 and st['g'] == 1, f"이동을 누른 채 전직 카드 탭 → 1차 전직 1번이어야 함 ({st})")
    ok(st['modal'] == 'petpick', f"전직 뒤 펫 창이 떠야 함 ({st})")
    pg.wait_for_timeout(700)
    if st['modal'] == 'petpick':
        b = pg.locator('#petCards button').nth(1).bounding_box()
        x2, y2 = b['x'] + b['width'] / 2, b['y'] + 60
        T('touchStart', [tp(230, 690, 1), tp(x2, y2, 2)]); pg.wait_for_timeout(60); T('touchEnd', [tp(x2, y2, 2)])
        pg.wait_for_timeout(250)
        st = pg.evaluate("()=>({modal,pet:G.pet&&G.pet.type,p:window.__p||0})")
        ok(st['pet'] == 'bear' and st['p'] == 1 and st['modal'] is None, f"이동을 누른 채 펫 카드 탭 → 반달곰 1번 ({st})")
    T('touchEnd', [tp(230, 690, 1)])
    ok(not errs, f"휴대폰 오류: {errs}")
    ctx.close()
    # 2) 한 번 누르면 한 번만: 레벨업 카드 (휴대폰 탭, PC 클릭)
    for mob in (True, False):
        ctx, pg, errs = page(mob)
        pg.evaluate("()=>{newGame('seonbi','gilil',0,'normal');}"); pg.evaluate(COUNT)
        pg.evaluate("()=>{G.queue.length=0;openLevel();}"); pg.wait_for_timeout(700)
        b = pg.locator('#luCards button').first.bounding_box(); x, y = b['x'] + b['width'] / 2, b['y'] + b['height'] / 2
        if mob: pg.touchscreen.tap(x, y)
        else: pg.mouse.click(x, y)
        pg.wait_for_timeout(300)
        st = pg.evaluate("()=>({modal,n:window.__n})")
        ok(st['n'] == 1 and st['modal'] is None, f"{'휴대폰' if mob else 'PC'}: 레벨업 카드를 한 번 누르면 한 번만 골라져야 함 ({st})")
        # 전직 → 펫: 같은 자리를 바로 눌러도 펫이 저절로 골라지면 안 됨
        pg.evaluate("()=>{G.P.lvl=10;openAdv();}"); pg.wait_for_timeout(700)
        b = pg.locator('#advCards button').first.bounding_box(); x, y = b['x'] + b['width'] / 2, b['y'] + 60
        if mob: pg.touchscreen.tap(x, y)
        else: pg.mouse.click(x, y)
        pg.wait_for_timeout(120)
        st = pg.evaluate("()=>({modal,tier:G.P.tier,g:window.__g||0,p:window.__p||0})")
        ok(st['g'] == 1 and st['p'] == 0 and st['modal'] == 'petpick', f"{'휴대폰' if mob else 'PC'}: 전직 한 번, 펫은 아직 안 골라져야 함 ({st})")
        ok(not errs, f"오류: {errs}")
        ctx.close()
    # 3) 2~5차: 고르는 칸 전체가 눌림, 누르면 전직
    for mob in (True, False):
        ctx, pg, errs = page(mob)
        pg.evaluate("()=>{newGame('seonbi','gilil',0,'normal');G.P.lvl=10;openAdv();grantTier(0);pickPet('tiger');G.P.lvl=20;openAdv();}")
        pg.wait_for_timeout(700)
        n = pg.locator('#advCards .advpick').count()
        ok(n == 3, f"2차 전직: 고르는 칸이 셋이어야 함 (지금 {n})")
        if n:
            pct = pg.evaluate("""()=>[...document.querySelectorAll('#advCards .advpick')].map(c=>{const r=c.getBoundingClientRect();let h=0,k=0;
              for(let i=1;i<10;i++)for(let j=1;j<10;j++){const x=r.left+r.width*i/10,y=r.top+r.height*j/10;if(y<0||y>innerHeight)continue;k++;const e=document.elementFromPoint(x,y);if(e&&c.contains(e))h++;}return k?Math.round(h/k*100):-1;})""")
            ok(all(v == 100 for v in pct), f"2차 전직: 고르는 칸 전체가 눌려야 함 ({pct}%)")
            # 안내판(점선)을 누르면 전직되지 않고 고르는 칸을 가리킨다
            ib = pg.locator('#advCards .advinfo').bounding_box()
            (pg.touchscreen.tap if mob else pg.mouse.click)(ib['x'] + ib['width'] / 2, ib['y'] + 40); pg.wait_for_timeout(600)
            st = pg.evaluate("()=>({modal,tier:G.P.tier,nudge:document.querySelector('#advCards .advpicks').classList.contains('nudge')})")
            ok(st['modal'] == 'adv' and st['tier'] == 1 and st['nudge'], f"안내판을 누르면 전직되지 않고 고르는 칸을 가리켜야 함 ({st})")
            c = pg.locator('#advCards .advpick').nth(1); c.scroll_into_view_if_needed(); b = c.bounding_box()
            x, y = b['x'] + b['width'] * 0.2, b['y'] + b['height'] * 0.3
            if mob: pg.touchscreen.tap(x, y)
            else: pg.mouse.click(x, y)
            pg.wait_for_timeout(250)
            st = pg.evaluate("()=>({modal,tier:G.P.tier})")
            ok(st['tier'] == 2 and st['modal'] is None, f"{'휴대폰' if mob else 'PC'}: 2차 고르는 칸의 가장자리를 눌러도 전직돼야 함 ({st})")
        ok(not errs, f"오류: {errs}")
        ctx.close()
    br.close()
print('FAIL | ' + ' | '.join(fails) if fails else 'PASS pick_touch')
sys.exit(1 if fails else 0)
