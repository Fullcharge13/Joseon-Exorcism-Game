"""그림 다듬기 성능(v18.6, Playwright): vfx_perf와 같은 장면(휴대폰 390×844·DPR3·CPU 4배 느림·요괴 280·제9막, 분위기 효과 켬·고화질)에서
그림 다듬기 끔/켬을 번갈아 네 번씩 재 가장 작은 값으로 비교. 기준: 켬 − 끔 ≤ 1.5ms(미리 만든 그림을 고르기만 하므로 거의 같아야 함)
시작할 때 다듬기에 드는 시간(같은 CPU 4배 느림)도 적는다.
사용: python3 tests/browser/refine_perf.py [게임.html]"""
import sys, pathlib, statistics, json
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from vfx_scene import INIT, SCENE
ROOT = pathlib.Path(__file__).resolve().parents[2]
game = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / 'index.html')
TIME = """(k)=>{let t=window.__t;const xs=[];for(let i=0;i<k;i++){G.P.hp=1e9;G.P.xp=0;G.queue.length=0;if(modal)show(null);const a=performance.now();frame(t+=16);xs.push(performance.now()-a);}window.__t=t;return xs;}"""
BOOT = """()=>{const L=[...Object.values(ESPR),...Object.values(PSPR),...Object.values(charCache)].filter(s=>s&&s.raw);const t0=performance.now();for(const s of L)refineCanvas(s.raw.n);return [L.length,+(performance.now()-t0).toFixed(1)];}"""
def med(r, boot=False):
    with sync_playwright() as p:
        br = p.chromium.launch(); ctx = br.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True)
        ctx.add_init_script(INIT); ctx.route('**/fonts.g*/**', lambda q: q.abort()); pg = ctx.new_page()
        pg.goto('file://' + str(pathlib.Path(game).resolve())); pg.wait_for_timeout(400)
        cdp = ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
        b = pg.evaluate(BOOT) if boot else None
        pg.evaluate(f"()=>{{meta.set.refine='{r}';}}"); pg.evaluate(SCENE, {'st': 8, 'v': 'on', 'n': 280, 'perf': 'high', 'warm': 30})
        xs = pg.evaluate(TIME, 200); br.close()
    return round(statistics.median(xs), 1), b
R = {'off': [], 'on': []}; boot = None
for i in range(4):
    for r in ('off', 'on'):
        v, b = med(r, boot=(i == 0 and r == 'on')); R[r].append(v); boot = b or boot
m = {k: min(v) for k, v in R.items()}
print(json.dumps(R), '시작 때 다듬기(그림 수, ms):', boot)
if m['on'] - m['off'] > 1.5: print(f"FAIL refine_perf\n  켬−끔 {m['on']-m['off']:.1f}ms > 1.5ms"); sys.exit(1)
print(f"PASS refine_perf (다듬기 끔 {m['off']} → 켬 {m['on']}ms · 시작 때 그림 {boot[0]}장 {boot[1]}ms, CPU 4배 느림)")
