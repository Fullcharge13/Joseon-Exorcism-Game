"""흉괘 준비 화면 (v21.2, 실제 브라우저)
사용: python3 tests/browser/hyung_prep.py [게임.html] [캡처 폴더]
 - 제10막을 깨기 전: 흉괘 버튼 0 · 「제10막을 한 번 깨면」 안내
 - 깬 뒤: 흉괘 버튼 7 · 세 장 고르면 나머지 잠김 · 머리글 「흉괘 3/3 · 엽전 +52%」
 - 출정 → G.hyung 세 장 · 엽전 배율 · 귀문관살이면 화면 가장자리가 어두움(모서리 밝기 < 가운데)
 - 설화 출정 모드에서는 흉괘 묶음이 숨음
 - 휴대폰·PC 가로 넘침 0 · 페이지 오류 0
"""
import sys, pathlib
from playwright.sync_api import sync_playwright
game = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'index.html').resolve()
out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else '/tmp/hyung_prep'); out.mkdir(parents=True, exist_ok=True)
fails = []
def ok(c, m):
    if not c: fails.append(m)
OPEN = "(c)=>{meta.stats.clears=c;saveMeta();selChar='seonbi';prep.mode='normal';prep.cards=[];prep.hyung=[];openPrep();}"
LUM = """()=>{const c=document.querySelector('canvas');const x=c.getContext('2d');const w=c.width,h=c.height;
 const px=(a,b)=>{const d=x.getImageData(a,b,1,1).data;return d[0]+d[1]+d[2];};
 return {mid:px(w>>1,h>>1),corner:(px(4,4)+px(w-5,4)+px(4,h-5)+px(w-5,h-5))/4};}"""
with sync_playwright() as p:
    br = p.chromium.launch()
    for mob in (True, False):
        tag = 'phone' if mob else 'pc'
        ctx = br.new_context(viewport={'width': 390, 'height': 844} if mob else {'width': 1280, 'height': 800}, is_mobile=mob, has_touch=mob)
        ctx.route('**/fonts.g*/**', lambda r: r.abort()); pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + str(game)); pg.wait_for_timeout(500)
        pg.evaluate(OPEN, 0); pg.wait_for_timeout(150)
        n, desc = pg.evaluate("()=>[document.querySelectorAll('#hyungList button').length,document.getElementById('hyungDesc').textContent]")
        ok(n == 0 and '제10막' in desc, f"{tag}: 깨기 전 버튼 {n} · 안내 「{desc}」")
        pg.evaluate(OPEN, 1); pg.wait_for_timeout(150)
        n = pg.evaluate("()=>document.querySelectorAll('#hyungList button').length")
        ok(n == 7, f"{tag}: 깬 뒤 흉괘 버튼 {n}")
        for id in ('gongmang', 'yangin', 'gwimun'):
            pg.click(f'#hyung-{id}'); pg.wait_for_timeout(80)
        head, dis = pg.evaluate("()=>[document.getElementById('hyungHead').textContent,[...document.querySelectorAll('#hyungList button')].filter(b=>b.disabled).length]")
        ok('3/3' in head and '+52%' in head and dis == 4, f"{tag}: 머리글 「{head}」 · 잠긴 버튼 {dis}")
        ov = pg.evaluate("()=>document.documentElement.scrollWidth-innerWidth")
        ok(ov <= 0, f"{tag}: 준비 화면 가로 넘침 {ov}px")
        pg.evaluate("()=>document.getElementById('panHyung').scrollIntoView()"); pg.wait_for_timeout(100)
        pg.screenshot(path=str(out / f'hyung_prep_{tag}.png'))
        pg.evaluate("()=>{prep.mode='tale';renderPrep();}"); pg.wait_for_timeout(100)
        ok(pg.evaluate("()=>document.getElementById('panHyung').hidden"), f"{tag}: 설화 출정에서 흉괘 숨김")
        pg.evaluate("()=>{prep.mode='normal';renderPrep();}"); pg.wait_for_timeout(100)
        pg.click('#goBtn'); pg.wait_for_timeout(600)
        hy, coin = pg.evaluate("()=>[G.hyung.join(),G.mods.coin]")
        ok(hy == 'gongmang,yangin,gwimun' and abs(coin - 1.15 ** 3) < 1e-6, f"{tag}: 출정 흉괘 {hy} · 엽전 {coin}")
        pg.evaluate("()=>{G.queue.length=0;show(null);}")
        for _ in range(20):
            pg.evaluate("()=>frame(performance.now())"); pg.wait_for_timeout(30)
        L = pg.evaluate(LUM)
        ok(L['corner'] < L['mid'], f"{tag}: 귀문관살 가장자리 어둠 {L}")
        pg.screenshot(path=str(out / f'hyung_gwimun_{tag}.png'))
        ok(not errs, f"{tag}: 페이지 오류 {errs[:2]}")
        ctx.close()
    br.close()
if fails:
    print('FAIL hyung_prep\n  ' + '\n  '.join(fails)); sys.exit(1)
print('PASS hyung_prep (잠김·열림 · 세 장 · 엽전 +% · 출정 · 귀문관살 어둠 · 설화 숨김 · 휴대폰·PC)')
