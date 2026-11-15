"""배경음 재생 시험 (실제 브라우저, v21.0) — 저장소를 작은 웹 서버로 열어 audio/bgm/*.mp3를 실제로 받음
사용: python3 tests/browser/bgm_play.py
 소리는 들을 수 없으므로 재생 상태(bgmState: 지금 곡·목표 크기·실제 크기·받아 둔 곡)를 읽어 봄. 휴대폰(390×844 터치)·PC
 1) 첫 터치 전: 재생 안 함(아이폰 규칙) · 터치 뒤 3초 안에 본부 곡(hub)이 커짐
 2) 판 시작 → 막 곡 s01 · 보스가 나오면 3.5초 안에 b01(1초 기다림 + 2초 겹침) · 보스를 잡으면 다시 s01
 3) 정지 창 → 목표 크기가 반 · 닫으면 다시 그대로
 4) 설정 「배경음」 칸이 있고 0으로 하면 꺼짐 · 설정 화면 옆 넘침 0
 5) 처음부터 배경음 0이면 음악 파일을 받지 않음 · 터치 전엔 받아만 둠(본부 곡) · 새 곡은 목표보다 크게 시작하지 않음 · 음소거면 막이 바뀌어도 0 · 목록을 못 받으면 물러섬
 6) 음악 파일을 막은 상태(오프라인 흉내): 오류 창·화면 오류 없음 · 오류 기록에 「배경음 못 받음」 한 번
 7) sw.js가 음원을 판 번호와 따로(jtm-bgm) 두고, 없으면 게임 화면 대신 404
"""
import sys, pathlib, threading, functools, http.server, socketserver, time
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
fails = []
def ok(c, m):
    if not c: fails.append(m)
sw = (ROOT / 'sw.js').read_text(encoding='utf-8')
ok('jtm-bgm' in sw and '404' in sw, 'sw.js: 음원은 jtm-bgm에 · 없으면 404')

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=str(ROOT)))
port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{port}/index.html'
ST = '()=>typeof bgmState==="function"?bgmState():null'

def wait(pg, cond, sec):
    t0 = time.time()
    while time.time() - t0 < sec:
        s = pg.evaluate(ST)
        if s and cond(s): return s
        pg.wait_for_timeout(150)
    return pg.evaluate(ST)

with sync_playwright() as p:
    br = p.chromium.launch(args=['--autoplay-policy=user-gesture-required'])
    for mob in (True, False):
        tag = '휴대폰' if mob else 'PC'
        ctx = br.new_context(viewport={'width': 390, 'height': 844} if mob else {'width': 1280, 'height': 800}, is_mobile=mob, has_touch=mob, service_workers='block')
        ctx.route('**/fonts.g*/**', lambda r: r.abort())
        pg = ctx.new_page(); errs = []; reqs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('request', lambda r: '/audio/bgm/' in r.url and reqs.append(r.url))
        pg.goto(URL); pg.wait_for_timeout(1200)
        s = pg.evaluate(ST)
        ok(s is not None, f'{tag}: bgmState 있음')
        if s is None:
            ctx.close(); continue
        ok(not s['playing'], f'{tag}: 첫 터치 전엔 재생 안 함 ({s})')
        ok(any('/hub-' in u for u in reqs), f'{tag}: 터치 전에 본부 곡을 미리 받아 둠 ({reqs[:3]})')
        if mob: pg.touchscreen.tap(195, 700)
        else: pg.mouse.click(640, 700)
        s = wait(pg, lambda s: s['playing'] == 'hub' and s['level'] > 0.05, 4)
        ok(s['playing'] == 'hub' and s['level'] > 0.05, f'{tag}: 터치 뒤 본부 곡 ({s})')
        pg.evaluate("()=>{newGame('seonbi',[],0,'normal');G.queue.length=0;show(null);}")
        # 새 곡은 0에서 커져야 함(처음부터 크게 나오면 안 됨) — 바뀌는 2.5초 동안 자주 재어 목표를 넘는지
        mx = 0; tg = 0
        for _ in range(25):
            q = pg.evaluate(ST)
            if q['playing'] == 's01': mx = max(mx, q['level']); tg = q['target']
            pg.wait_for_timeout(100)
        ok(mx <= tg + 0.01, f'{tag}: 새 곡이 목표({tg})보다 크게 시작하지 않음 (가장 큼 {mx})')
        s = wait(pg, lambda s: s['playing'] == 's01', 4)
        ok(s['playing'] == 's01', f'{tag}: 판 시작 → s01 ({s})')
        pg.evaluate("()=>{G.boss={hp:100,x:0,y:0}}")
        s = wait(pg, lambda s: s['playing'] == 'b01', 3.5)
        ok(s['playing'] == 'b01', f'{tag}: 보스 → 3.5초 안에 b01 ({s})')
        pg.evaluate("()=>{G.boss=null}")
        s = wait(pg, lambda s: s['playing'] == 's01', 3.5)
        ok(s['playing'] == 's01', f'{tag}: 보스 잡음 → s01 ({s})')
        full = s['target']
        pg.evaluate("()=>openPause()")
        s = wait(pg, lambda s: abs(s['target'] - full * 0.5) < 1e-6, 2)
        ok(abs(s['target'] - full * 0.5) < 1e-6, f'{tag}: 정지 창 → 목표 크기 반 ({s["target"]} / {full})')
        pg.evaluate("()=>show(null)")
        s = wait(pg, lambda s: abs(s['target'] - full) < 1e-6, 2)
        ok(abs(s['target'] - full) < 1e-6, f'{tag}: 닫으면 다시 ({s["target"]})')
        # 설정 칸
        pg.evaluate("()=>openPause()"); pg.evaluate("()=>openSettings('pause')"); pg.wait_for_timeout(300)
        ok(pg.locator('#setBgm').count() == 1 and pg.is_visible('#setBgm'), f'{tag}: 설정에 「배경음」 칸')
        ov = pg.evaluate("()=>{const s=document.querySelector('#settings');return [s.scrollWidth,s.clientWidth]}")
        ok(ov[0] <= ov[1] + 1, f'{tag}: 설정 화면 옆 넘침 {ov}')
        pg.evaluate("()=>{const e=document.querySelector('#setBgm');e.value='0';e.dispatchEvent(new Event('input'))}")
        s = wait(pg, lambda s: s['want'] is None and s['level'] < 0.01, 3.5)
        ok(s['want'] is None and s['level'] < 0.01, f'{tag}: 배경음 0 → 꺼짐 ({s})')
        ok(pg.evaluate('()=>meta.set.bgm') == 0, f'{tag}: 배경음 0이 저장됨')
        ok(not errs, f'{tag}: 화면 오류 {errs[:3]}')
        ctx.close()
    # 음소거한 채로 막이 바뀌어도 소리가 나지 않음
    ctx = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, service_workers='block')
    ctx.route('**/fonts.g*/**', lambda r: r.abort())
    pg = ctx.new_page(); pg.goto(URL); pg.wait_for_timeout(800); pg.touchscreen.tap(195, 700)
    wait(pg, lambda s: s['playing'] == 'hub', 4)
    pg.evaluate("()=>{muted=true;newGame('seonbi',[],0,'normal');G.queue.length=0;show(null);}")
    mx = 0; seen = False
    for _ in range(30):   # 본부 곡이 0.3초 동안 줄어드는 것은 빼고, 새 곡(s01)만
        q = pg.evaluate(ST)
        if q['playing'] == 's01': seen = True; mx = max(mx, q['level'])
        pg.wait_for_timeout(100)
    ok(seen and mx <= 0.01, f'음소거: 새 막 곡이 소리 0으로 시작 (가장 큼 {mx}, 재생 {seen})')
    ctx.close()
    # 곡 목록(bgm.json)을 못 받으면 1초에 네 번 다시 묻지 않음(물러섬)
    ctx = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, service_workers='block')
    ctx.route('**/fonts.g*/**', lambda r: r.abort()); ctx.route('**/audio/bgm/bgm.json', lambda r: r.abort())
    pg = ctx.new_page(); jr = []
    pg.on('request', lambda r: r.url.endswith('bgm.json') and jr.append(r.url))
    pg.goto(URL); pg.wait_for_timeout(800); pg.touchscreen.tap(195, 700); pg.wait_for_timeout(4000)
    ok(len(jr) <= 2, f'목록을 못 받으면 물러섬: 4초에 {len(jr)}번(≤2)')
    ctx.close()
    # 처음부터 0이면 받지 않음 · 막힌 음원(오프라인 흉내)
    for case in ('zero', 'blocked'):
        ctx = br.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, service_workers='block')
        ctx.route('**/fonts.g*/**', lambda r: r.abort())
        if case == 'blocked': ctx.route('**/audio/bgm/*.mp3', lambda r: r.abort())
        pg = ctx.new_page(); errs = []; reqs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('request', lambda r: r.url.endswith('.mp3') and reqs.append(r.url))
        if case == 'zero': ctx.add_init_script("try{const k=Object.keys(localStorage).find(k=>/save|meta|jtm/i.test(k));}catch(e){}")
        pg.goto(URL); pg.wait_for_timeout(800)
        if case == 'zero':
            pg.evaluate("()=>{meta.set.bgm=0;saveMeta()}"); reqs.clear(); pg.reload(); pg.wait_for_timeout(800)
        pg.touchscreen.tap(195, 700); pg.wait_for_timeout(600)
        pg.evaluate("()=>{newGame('seonbi',[],0,'normal');G.queue.length=0;show(null);}"); pg.wait_for_timeout(2500)
        if case == 'zero':
            ok(not reqs, f'배경음 0: 음악 파일을 받지 않음 ({reqs[:2]})')
        else:
            n = pg.evaluate("()=>DIAG.log.filter(e=>/배경음 못 받음/.test(e.kind)).length")
            ok(n >= 1 and pg.evaluate('()=>modal') is None, f'막힌 음원: 기록 {n} · 창 없음')
            pg.evaluate("()=>{G.boss={hp:1}}"); pg.wait_for_timeout(2000)
            ms = pg.evaluate("()=>DIAG.log.filter(e=>/배경음 못 받음/.test(e.kind)).map(e=>e.msg.split(':')[0])")
            ok(len(ms) == len(set(ms)) and len(ms) <= 21, f'막힌 음원: 곡마다 한 번만 기록 ({ms})')
        ok(not errs, f'{case}: 화면 오류 {errs[:3]}')
        ctx.close()
    br.close()
srv.shutdown()
if fails:
    print('FAIL bgm_play\n  ' + '\n  '.join(fails)); sys.exit(1)
print('PASS bgm_play (첫 터치 · 본부 · 막 · 보스 · 정지 반 · 설정 0 · 받지 않음 · 막힌 음원 · 휴대폰·PC)')
