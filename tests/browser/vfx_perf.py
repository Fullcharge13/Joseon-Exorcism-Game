"""분위기 층 성능(v18.2, Playwright)
사용: python3 tests/browser/vfx_perf.py [게임.html]
휴대폰 390×844·DPR3·CPU 4배 느림·요괴 280마리·200프레임 × 4번의 한 프레임 시간(중앙값):
 고화질: 켬 ≤ 33ms 그리고 켬 − 끔 ≤ 8ms · 절약 모드: 켬 − 끔 ≤ 2ms
이 작업 환경의 브라우저는 그래픽 카드 없이 그리므로 실제 기기보다 무겁게 나온다(기준이 넉넉하지 않은 쪽)."""
import sys, pathlib, statistics, json
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from vfx_scene import INIT, SCENE
ROOT = pathlib.Path(__file__).resolve().parents[2]
game = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / 'index.html')
TIME = """(k)=>{let t=window.__t;const xs=[];for(let i=0;i<k;i++){G.P.hp=1e9;G.P.xp=0;G.queue.length=0;if(modal)show(null);const a=performance.now();frame(t+=16);xs.push(performance.now()-a);}window.__t=t;return xs;}"""
def med(perf, v, st=8):
    with sync_playwright() as p:
        br = p.chromium.launch(); ctx = br.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)
        ctx.add_init_script(INIT); ctx.route('**/fonts.g*/**', lambda r: r.abort()); pg = ctx.new_page()
        pg.goto('file://' + str(pathlib.Path(game).resolve())); pg.wait_for_timeout(400)
        cdp = ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
        pg.evaluate(SCENE, {'st': st, 'v': v, 'n': 280, 'perf': perf, 'warm': 30})
        xs = pg.evaluate(TIME, 200); br.close()
    return round(statistics.median(xs), 1)
R = {f'{p}_{v}': [] for p in ('high', 'low') for v in ('off', 'on')}
for _ in range(4):   # 끔·켬을 번갈아 네 번씩 재서 가장 작은 값(이 환경은 같은 장면도 ±5ms 흔들린다)
    for perf in ('high', 'low'):
        for v in ('off', 'on'):
            R[f'{perf}_{v}'].append(med(perf, v))
m = {k: min(v) for k, v in R.items()}
fails = []
if m['high_on'] > 33: fails.append(f"고화질 켬 {m['high_on']}ms > 33ms")
if m['high_on'] - m['high_off'] > 8: fails.append(f"고화질 켬−끔 {m['high_on']-m['high_off']:.1f}ms > 8ms")
if m['low_on'] - m['low_off'] > 2: fails.append(f"절약 켬−끔 {m['low_on']-m['low_off']:.1f}ms > 2ms")
print(json.dumps(R))
if fails: print('FAIL vfx_perf\n  ' + '\n  '.join(fails)); sys.exit(1)
print(f"PASS vfx_perf (고화질 끔 {m['high_off']} → 켬 {m['high_on']}ms · 절약 끔 {m['low_off']} → 켬 {m['low_on']}ms, 제9막·요괴 280·CPU 4배 느림)")
