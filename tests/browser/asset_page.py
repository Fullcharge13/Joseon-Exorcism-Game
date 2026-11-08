"""에셋 도감 페이지 시험 (실제 브라우저, v20.8)
사용: python3 tests/browser/asset_page.py
 휴대폰(390×844)·PC(1280×800)에서 docs/assets/index.html을 열어
 1) 칸 수 = assets.js 목록 수, 머리말에 「n장」
 2) 종류 고르기 → 그 종류 개수만 · 찾기 「도깨비」 → 이름·id·종류 이름·쓰이는 곳에 도깨비가 든 것만
 3) 다듬기 켬 → 다듬기 그림이 있는 칸은 @r.png
 4) 칸을 누르면 크게 보기: 이름·크기·종류 · 닫기
 5) 주소 #kind=enemy&q=도깨비 로 열면 같은 화면(고르기·찾기 칸도 그 값)
 6) 깨진 그림 0(naturalWidth) · 옆 넘침 0 · 화면 오류 0 · 처음 그리기 1.5초 안
 7) 게임의 sw.js는 docs/assets/를 오프라인 캐시에 넣지 않음(글에 그 조건)
"""
import sys, pathlib, json, re, time
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
PAGE = ROOT / 'docs' / 'assets' / 'index.html'
fails = []
def ok(c, m):
    if not c: fails.append(m)
ok(PAGE.exists(), '도감 페이지가 있음')
data = json.loads((ROOT / 'docs' / 'assets' / 'assets.json').read_text(encoding='utf-8'))
N = len(data['assets'])
n_enemy = sum(1 for a in data['assets'] if a['kind'] == 'enemy')
KN = {k['kind']: k['name'] for k in data['kinds']}
# 찾기는 이름·id·종류 이름·쓰이는 곳에서
dok = [a for a in data['assets'] if '도깨비' in (a['name'] + ' ' + a['id'] + ' ' + KN.get(a['kind'], '') + ' ' + a.get('used', '')).lower()]
dok_enemy = [a for a in dok if a['kind'] == 'enemy']
sw = (ROOT / 'sw.js').read_text(encoding='utf-8')
ok('docs/assets/' in sw, 'sw.js가 docs/assets/를 따로 다룸')
if PAGE.exists():
    with sync_playwright() as p:
        br = p.chromium.launch()
        for mob in (True, False):
            tag = '휴대폰' if mob else 'PC'
            ctx = br.new_context(viewport={'width': 390, 'height': 844} if mob else {'width': 1280, 'height': 800}, is_mobile=mob, has_touch=mob)
            ctx.route('**/fonts.g*/**', lambda r: r.abort())
            pg = ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            t0 = time.time(); pg.goto(PAGE.as_uri()); pg.wait_for_selector('.card'); t1 = time.time() - t0
            ok(t1 < 1.5, f'{tag}: 처음 그리기 {t1:.2f}초')
            cards = lambda: pg.locator('.card:not([hidden])').count()
            ok(cards() == N, f'{tag}: 칸 수 {cards()} = 목록 {N}')
            ok(f'{N}' in pg.inner_text('#count'), f'{tag}: 머리말 장수 ({pg.inner_text("#count")})')
            pg.select_option('#kind', 'enemy'); pg.wait_for_timeout(100)
            ok(cards() == n_enemy, f'{tag}: 요괴만 {cards()} = {n_enemy}')
            pg.fill('#q', '도깨비'); pg.wait_for_timeout(200)
            ok(cards() == len(dok_enemy), f'{tag}: 요괴 중 도깨비 {cards()} = {len(dok_enemy)}')
            pg.select_option('#kind', ''); pg.wait_for_timeout(100)
            ok(cards() == len(dok), f'{tag}: 전체 중 도깨비 {cards()} = {len(dok)}')
            ok(re.search(r'kind=&q=|q=', pg.evaluate('location.hash')) is not None, f'{tag}: 주소에 상태 ({pg.evaluate("location.hash")})')
            pg.fill('#q', ''); pg.wait_for_timeout(150)
            # 다듬기 켬
            pg.check('#refine'); pg.wait_for_timeout(150)
            r_src = pg.evaluate("()=>[...document.querySelectorAll('.card img')].filter(i=>i.dataset.r).every(i=>/@r\\.png$/.test(i.getAttribute('src')))")
            ok(r_src, f'{tag}: 다듬기 켬이면 @r 그림')
            pg.uncheck('#refine'); pg.wait_for_timeout(100)
            # 크게 보기
            first = pg.locator('.card').first
            nm = first.get_attribute('data-name')
            first.click(); pg.wait_for_timeout(150)
            ok(pg.is_visible('#detail') and nm in pg.inner_text('#detail'), f'{tag}: 크게 보기에 이름 {nm}')
            ok(re.search(r'\d+×\d+', pg.inner_text('#detail')) is not None, f'{tag}: 크게 보기에 크기')
            pg.click('#detailClose'); pg.wait_for_timeout(100)
            ok(not pg.is_visible('#detail'), f'{tag}: 닫기')
            # 깨진 그림: 모든 그림을 불러오게 끝까지 내림
            pg.evaluate('document.querySelectorAll(".card img").forEach(i=>i.loading="eager")'); pg.wait_for_timeout(1500)
            broken = pg.evaluate("()=>[...document.querySelectorAll('.card img')].filter(i=>!(i.complete&&i.naturalWidth>0)).map(i=>i.getAttribute('src')).slice(0,5)")
            ok(not broken, f'{tag}: 깨진 그림 {broken}')
            ov = pg.evaluate('[document.documentElement.scrollWidth, innerWidth]')
            ok(ov[0] <= ov[1] + 1, f'{tag}: 옆 넘침 {ov}')
            # 주소로 열기
            pg.goto(PAGE.as_uri() + '#kind=enemy&q=' + '도깨비'); pg.wait_for_timeout(400)
            ok(cards() == len(dok_enemy) and pg.input_value('#q') == '도깨비' and pg.input_value('#kind') == 'enemy', f'{tag}: 주소로 같은 화면 ({cards()})')
            ok(not errs, f'{tag}: 화면 오류 {errs[:3]}')
            ctx.close()
        br.close()
if fails:
    print('FAIL asset_page\n  ' + '\n  '.join(fails)); sys.exit(1)
print(f'PASS asset_page ({N}장 · 고르기·찾기·다듬기·크게 보기·주소 · 휴대폰·PC)')
