"""분위기 층이 잘 보여야 할 것을 가리지 않는지(v18.2, Playwright)
사용: python3 tests/browser/vfx_read.py [게임.html]
제1·5·9·10막 × 휴대폰·PC에서 같은 장면을 분위기 효과 끔/켬으로 그리고, 요괴 탄·경고 장판·피해 숫자 자리(가까이·화면 가장자리)의
가장 밝은 점이 끈 때의 85% 이상인지 본다. 페이지 오류 0."""
import sys, pathlib
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from vfx_scene import INIT, SCENE, PROBE, LUMA
ROOT = pathlib.Path(__file__).resolve().parents[2]
game = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / 'index.html')
fails, worst, n = [], 1.0, 0
with sync_playwright() as p:
    br = p.chromium.launch()
    for vname, vopt in [('phone', dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2)), ('pc', dict(viewport={'width': 1280, 'height': 720}))]:
        ctx = br.new_context(**vopt); ctx.add_init_script(INIT); ctx.route('**/fonts.g*/**', lambda r: r.abort())
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + str(pathlib.Path(game).resolve())); pg.wait_for_timeout(400)
        for st in (0, 4, 8, 9):
            res = {}
            for v in ('off', 'on'):
                pg.evaluate(SCENE, {'st': st, 'v': v, 'n': 40})
                q = pg.evaluate(PROBE, {}); res[v] = pg.evaluate(LUMA, q)
            for (kind, a), (_, b) in zip(res['off'], res['on']):
                n += 1; r = b / a if a > 0 else 1
                worst = min(worst, r)
                if r < 0.85: fails.append(f'{vname} {st+1}막 {kind}: 끔 {a:.0f} → 켬 {b:.0f} ({r:.0%})')
        if errs: fails.append(f'{vname} 페이지 오류: {errs[:2]}')
        ctx.close()
    br.close()
if fails: print(f'FAIL vfx_read ({len(fails)}/{n})\n  ' + '\n  '.join(fails[:30])); sys.exit(1)
print(f'PASS vfx_read ({n}곳 · 가장 어두워진 곳도 끈 때의 {worst:.0%})')
