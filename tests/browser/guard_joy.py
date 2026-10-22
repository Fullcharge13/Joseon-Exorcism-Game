"""입력 보호와 이동 조이스틱 시험 (실제 브라우저, v17.2)
사용: python3 tests/browser/guard_joy.py [게임.html]
 1) 레벨업 창 두 개가 이어 뜰 때, 고르고 0.25초 만에 같은 자리를 또 누르면 둘째 카드는 골라지지 않는다(PC 클릭·휴대폰 탭)
 2) 휴대폰: 이동을 누른 채 다른 손가락으로 카드를 고르면, 창이 닫힌 뒤에도 누르고 있던 손가락으로 계속 움직인다
 3) 휴대폰: 이동 중에 다른 손가락이 화면을 눌러도 이동 손가락을 빼앗지 않는다
"""
import sys, pathlib, json
from playwright.sync_api import sync_playwright
game = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'index.html').resolve()
fails = []
def ok(c, m):
    if not c: fails.append(m)
def tp(x, y, i): return {'x': x, 'y': y, 'id': i, 'radiusX': 5, 'radiusY': 5, 'force': 1}
with sync_playwright() as p:
    br = p.chromium.launch()
    def page(mob):
        ctx = br.new_context(viewport={'width': 390, 'height': 844} if mob else {'width': 1280, 'height': 800}, is_mobile=mob, has_touch=mob)
        ctx.route('**/fonts.g*/**', lambda r: r.abort()); pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.goto('file://' + str(game)); pg.wait_for_timeout(400); return ctx, pg, errs
    for mob in (False, True):
        ctx, pg, errs = page(mob)
        pg.evaluate("()=>{newGame('seonbi','gilil',0,'normal');G.queue.length=0;window.__n=0;const a=applyOpt;applyOpt=function(o){window.__n++;return a(o);};G.queue.push('lvl');openLevel();}")
        pg.wait_for_timeout(700)
        b = pg.locator('#luCards button').first.bounding_box(); x, y = b['x'] + b['width']/2, b['y'] + b['height']/2
        tap = pg.touchscreen.tap if mob else pg.mouse.click
        tap(x, y); pg.wait_for_timeout(250); tap(x, y); pg.wait_for_timeout(300)
        st = pg.evaluate("()=>({n:window.__n,modal})")
        ok(st['n'] == 1 and st['modal'] == 'levelup', f"{'휴대폰' if mob else 'PC'}: 0.25초 만의 두 번째 누름은 무시해야 함 ({st})")
        ok(not errs, f"오류 {errs}"); ctx.close()
    ctx, pg, errs = page(True); cdp = ctx.new_cdp_session(pg); T = lambda typ, pts: cdp.send('Input.dispatchTouchEvent', {'type': typ, 'touchPoints': pts})
    pg.evaluate("()=>{newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);G.P.hp=G.P.maxHp=1e7;}")
    T('touchStart', [tp(200, 700, 1)]); T('touchMove', [tp(260, 700, 1)]); pg.wait_for_timeout(300)
    pg.evaluate("()=>{openLevel();}"); pg.wait_for_timeout(700)
    b = pg.locator('#luCards button').first.bounding_box(); x2, y2 = b['x'] + b['width']/2, b['y'] + b['height']/2
    T('touchStart', [tp(260, 700, 1), tp(x2, y2, 2)]); pg.wait_for_timeout(60); T('touchEnd', [tp(x2, y2, 2)]); pg.wait_for_timeout(200)
    x1 = pg.evaluate("()=>G.P.x"); T('touchMove', [tp(262, 700, 1)]); pg.wait_for_timeout(500); dx = pg.evaluate("()=>G.P.x") - x1
    ok(pg.evaluate("()=>modal") is None and dx > 10, f"창이 닫힌 뒤 누르고 있던 손가락으로 계속 움직여야 함 (0.5초 이동 {dx:.1f})")
    # 3) 다른 손가락이 눌러도 이동 손가락 유지
    T('touchStart', [tp(262, 700, 1), tp(100, 300, 3)]); pg.wait_for_timeout(50)
    jid = pg.evaluate("()=>joy&&joy.id")
    T('touchEnd', [tp(100, 300, 3)]); pg.wait_for_timeout(50)
    still = pg.evaluate("()=>!!joy")
    ok(still, f"다른 손가락을 떼도 이동은 이어져야 함 (joy {still}, id {jid})")
    T('touchEnd', [tp(262, 700, 1)]); pg.wait_for_timeout(100)
    ok(pg.evaluate("()=>joy===null"), "이동 손가락을 떼면 멈춰야 함")
    ok(not errs, f"오류 {errs}"); ctx.close(); br.close()
print('\n'.join('FAIL ' + f for f in fails) if fails else 'PASS guard_joy')
sys.exit(1 if fails else 0)
