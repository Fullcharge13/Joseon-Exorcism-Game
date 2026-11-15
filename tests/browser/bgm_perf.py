"""배경음 성능 (v21.0, Playwright) — vfx_perf와 같은 장면(휴대폰 390×844·DPR3·CPU 4배 느림·요괴 280마리)에서
한 프레임 시간(200프레임 중앙값)을 배경음 켬(막 곡 재생 중)·끔으로 번갈아 네 번 재어 가장 작은 값끼리: 켬 − 끔 ≤ 1ms
사용: python3 tests/browser/bgm_perf.py"""
import sys, pathlib, statistics, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from vfx_scene import INIT, SCENE
ROOT = pathlib.Path(__file__).resolve().parents[2]
TIME = """(k)=>{let t=window.__t;const xs=[];for(let i=0;i<k;i++){G.P.hp=1e9;G.P.xp=0;G.queue.length=0;if(modal)show(null);const a=performance.now();frame(t+=16);xs.push(performance.now()-a);}window.__t=t;return xs;}"""
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=str(ROOT)))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{srv.server_address[1]}/index.html'
fails = []

def med(on):
    with sync_playwright() as p:
        br = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        ctx = br.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True, service_workers='block')
        ctx.add_init_script(INIT); ctx.route('**/fonts.g*/**', lambda r: r.abort()); pg = ctx.new_page()
        pg.goto(URL); pg.wait_for_timeout(400)
        pg.evaluate(f"()=>{{initAudio();meta.set.bgm={60 if on else 0};}}")
        cdp = ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
        pg.evaluate(SCENE, {'st': 8, 'v': 'on', 'n': 280, 'perf': 'high', 'warm': 30})
        playing = None
        for _ in range(40):   # 곡을 받아 재생이 시작될 때까지 프레임을 돌림(가짜 시각이라 0.25초마다 확인)
            pg.evaluate(TIME, 16); pg.wait_for_timeout(100)
            playing = pg.evaluate('()=>bgmState().playing')
            if (playing is not None) == on: break
        xs = pg.evaluate(TIME, 200); br.close()
    return round(statistics.median(xs), 2), playing

R = {'on': [], 'off': []}; plays = set()
for _ in range(4):
    for k in ('off', 'on'):
        m, pl = med(k == 'on'); R[k].append(m)
        if k == 'on': plays.add(pl)
srv.shutdown()
on, off = min(R['on']), min(R['off'])
if plays != {'s09'}: fails.append(f'켬일 때 9막 곡이 재생 중이어야 함 {plays}')
if on - off > 1: fails.append(f'켬 − 끔 {on - off:.2f}ms > 1ms (켬 {on} · 끔 {off})')
print(f'한 프레임(중앙값, 네 번 중 최소): 배경음 켬 {on}ms · 끔 {off}ms · 차이 {on - off:+.2f}ms · 켬 {R["on"]} 끔 {R["off"]}')
if fails:
    print('FAIL bgm_perf\n  ' + '\n  '.join(fails)); sys.exit(1)
print('PASS bgm_perf')
