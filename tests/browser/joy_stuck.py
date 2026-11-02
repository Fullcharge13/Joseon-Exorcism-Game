"""이동 손가락이 「눌린 채」 남는 버그 시험 (실제 브라우저·휴대폰 터치, v18.6.3)
사용: python3 tests/browser/joy_stuck.py [게임.html]
사용자 화면 녹화(2026-11-02): 움직이다 상태창을 열고 닫은 뒤 손을 떼도 퇴마사가 저절로 움직이고 이동 원이 남음.
 A) 이동 손가락을 누른 채 다른 손가락으로 「상태」 → 상태창이 열린 동안 이동 손가락을 뗌 → 「계속」 → 멈춰 있어야 함
 B) 손을 뗀 알림이 오지 않아 이동이 남은 경우(휴대폰 제어 센터·알림·앱 전환 등): 새로 화면을 누르면 그 손가락이 이동을 맡고, 떼면 멈춤
 C) 화면이 가려지거나(앱 전환) 창이 초점을 잃으면 이동이 풀림
 D) 예전 약속 그대로: 이동 중 다른 손가락이 눌러도 이동 손가락을 빼앗지 않음(guard_joy 3과 같음)"""
import sys, pathlib
from playwright.sync_api import sync_playwright
game = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'index.html').resolve()
fails = []
def ok(c, m):
    if not c: fails.append(m)
def tp(x, y, i): return {'x': x, 'y': y, 'id': i, 'radiusX': 5, 'radiusY': 5, 'force': 1}
with sync_playwright() as p:
    br = p.chromium.launch()
    ctx = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True); ctx.route('**/fonts.g*/**', lambda r: r.abort())
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.goto('file://' + str(game)); pg.wait_for_timeout(400)
    cdp = ctx.new_cdp_session(pg); T = lambda typ, pts: cdp.send('Input.dispatchTouchEvent', {'type': typ, 'touchPoints': pts})
    start = "()=>{newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);G.P.hp=G.P.maxHp=1e7;G.enemies.length=0;}"
    moved = lambda ms: (lambda x0: (pg.wait_for_timeout(ms), pg.evaluate("()=>Math.hypot(G.P.x-window.__x0,G.P.y-window.__y0)"))[1])(pg.evaluate("()=>{window.__x0=G.P.x;window.__y0=G.P.y;}"))
    # A
    pg.evaluate(start); T('touchStart', [tp(200, 650, 1)]); T('touchMove', [tp(260, 650, 1)]); pg.wait_for_timeout(300)
    pg.evaluate("()=>openStatus()"); pg.wait_for_timeout(400)   # 다른 손가락으로 「상태」를 누른 것과 같음(여러 손가락 탭은 이 브라우저에서 click이 안 생겨 직접 엶)
    ok(pg.evaluate("()=>modal") == 'status', f"A: 상태창이 열려야 함 (modal {pg.evaluate('()=>modal')})")
    T('touchEnd', [tp(260, 650, 1)]); pg.wait_for_timeout(200)
    pg.evaluate("()=>{const c=document.getElementById('statClose');c&&c.click();}"); pg.wait_for_timeout(700)
    d = moved(600); ok(pg.evaluate("()=>joy===null") and d < 2, f"A: 상태창에서 손을 떼고 닫으면 멈춰야 함 (joy {pg.evaluate('()=>JSON.stringify(joy)')}, 0.6초 이동 {d:.1f})")
    # B
    pg.evaluate(start); pg.evaluate("()=>{joy={id:777,ox:100,oy:600,x:180,y:600,active:true};}")   # 떼었다는 알림을 놓친 이동
    d = moved(400); ok(d > 5, f"B 준비: 놓친 이동이 남아 저절로 움직임 ({d:.1f})")
    T('touchStart', [tp(300, 500, 4)]); pg.wait_for_timeout(50); jid = pg.evaluate("()=>joy&&joy.id")
    ok(jid is not None and jid != 777, f"B: 새로 누른 손가락이 이동을 맡아야 함 (joy.id {jid})")
    T('touchEnd', [tp(300, 500, 4)]); pg.wait_for_timeout(100)
    d = moved(500); ok(pg.evaluate("()=>joy===null") and d < 2, f"B: 떼면 멈춰야 함 (joy {pg.evaluate('()=>JSON.stringify(joy)')}, 이동 {d:.1f})")
    # C
    for ev, js in (('창 초점 잃음', "window.dispatchEvent(new Event('blur'))"), ('화면 가려짐', "Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange'));delete document.visibilityState")):
        pg.evaluate(start); T('touchStart', [tp(200, 650, 5)]); T('touchMove', [tp(260, 650, 5)]); pg.wait_for_timeout(100)
        pg.evaluate("()=>{" + js + "}"); pg.wait_for_timeout(50)
        ok(pg.evaluate("()=>joy===null"), f"C: {ev} → 이동이 풀려야 함 (joy {pg.evaluate('()=>JSON.stringify(joy)')})")
        T('touchEnd', [tp(260, 650, 5)]); pg.wait_for_timeout(50)
    # D
    pg.evaluate(start); T('touchStart', [tp(200, 650, 6)]); T('touchMove', [tp(260, 650, 6)]); pg.wait_for_timeout(100)
    T('touchStart', [tp(260, 650, 6), tp(100, 300, 7)]); pg.wait_for_timeout(50); j1 = pg.evaluate("()=>joy&&joy.id"); T('touchEnd', [tp(100, 300, 7)]); pg.wait_for_timeout(50)
    j2 = pg.evaluate("()=>joy&&joy.id"); ok(j1 == j2 and j2 is not None, f"D: 이동 중 다른 손가락이 이동을 빼앗지 않음 ({j1} → {j2})")
    T('touchEnd', [tp(260, 650, 6)]); pg.wait_for_timeout(50); ok(pg.evaluate("()=>joy===null"), "D: 이동 손가락을 떼면 멈춤")
    ok(not errs, f"오류 {errs}"); br.close()
print('\n'.join('FAIL ' + f for f in fails) if fails else 'PASS joy_stuck (상태창 중 손 뗌 · 놓친 이동 되찾기 · 초점·가려짐 · 다른 손가락)')
sys.exit(1 if fails else 0)
