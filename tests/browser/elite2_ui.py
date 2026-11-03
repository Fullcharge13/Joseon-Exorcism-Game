"""막별 새 엘리트 화면 시험(v19.4, Playwright, PC 1280×720·휴대폰 390×844)
사용: python3 tests/browser/elite2_ui.py [게임.html]   캡처 → tests/browser/out/elite2/ · 모음 그림 → docs/img/elite2_v194.png
 ① 요괴 도감(새 다섯 종이 보이게) 넘침 0 ② 1~5막 중간 보스 뒤 새 엘리트가 나와 몇 초 움직임(행동 포함) — 화면 오류 0, 다듬기 오류 0
 ③ 다섯 종 × 세 장(걷기·걷기·행동) × 다듬기 끔/켬 모음 그림"""
import sys, pathlib, base64
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parents[2]
game = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / 'index.html')
OUT = ROOT / 'tests' / 'browser' / 'out' / 'elite2'; OUT.mkdir(parents=True, exist_ok=True)
NEW = ['gaekgwi', 'juktong', 'beomnam', 'gomnaru', 'gildal']
fails = []; errs = []
OVER = "()=>{const o=[];for(const e of document.querySelectorAll('body *')){const r=e.getBoundingClientRect();if(r.width&&e.offsetParent!==null&&(r.right>innerWidth+1||r.left<-1))o.push(e.tagName+'.'+e.className);}return o.slice(0,5);}"
SHEET = """(ids)=>{const S=7,cw=14*S,ch=18*S,c=document.createElement('canvas');c.width=cw*6+40;c.height=(ch+26)*ids.length+10;const x=c.getContext('2d');x.fillStyle='#15111a';x.fillRect(0,0,c.width,c.height);x.imageSmoothingEnabled=false;
 x.font='14px sans-serif';const saved=meta.set.refine;
 ids.forEach((id,r)=>{x.fillStyle='#efe6d2';x.fillText(EN[id].n,6,r*(ch+26)+16);
  ['off','on'].forEach((m,mi)=>{meta.set.refine=m;ESPR2[id].forEach((v,i)=>{const im=v.n;x.drawImage(im,(mi*3+i)*cw+20+mi*20,r*(ch+26)+22,im.width*S,im.height*S);});});});
 meta.set.refine=saved;return c.toDataURL('image/png');}"""
with sync_playwright() as p:
    br = p.chromium.launch()
    for vname, vopt in (('pc', dict(viewport={'width': 1280, 'height': 720})), ('phone', dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2))):
        ctx = br.new_context(**vopt); ctx.add_init_script("window.requestAnimationFrame=()=>0;"); ctx.route('**/fonts.g*/**', lambda r: r.abort())
        pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); pg.goto('file://' + str(pathlib.Path(game).resolve())); pg.wait_for_timeout(400)
        pg.evaluate("(ids)=>{for(const id of ids)meta.seen[id]={s:1,k:1};saveMeta();openCodex('title');codexTab='dogam';renderCodex();}", NEW); pg.wait_for_timeout(300)
        h = pg.evaluate("()=>document.querySelector('#codexBody').innerText")
        for id_n in ('객귀', '죽통 나그네', '범이 된 남편', '곰나루 암곰', '길달'):
            if id_n not in h: fails.append(f'{vname} ① 도감에 「{id_n}」 없음')
        if '63' not in pg.evaluate("()=>document.querySelector('#codexSum').innerText"): fails.append(f'{vname} ① 도감 수 63 아님')
        pg.screenshot(path=str(OUT / f'{vname}_codex.png'), full_page=True)
        o = pg.evaluate(OVER)
        if o: fails.append(f'{vname} ① 넘침 {o}')
        for st, id_ in enumerate(NEW):
            r = pg.evaluate("""(o)=>{show(null);newGame('seonbi',null,0,'normal');G.queue.length=0;show(null);G.stage=o.st;G.midDone=true;G.mid=null;G.P.hp=G.P.maxHp=1e9;spawnElite();
              const e=G.enemies.find(x=>x.elite);e.x=G.P.x+50;e.y=G.P.y;let t=window.__t||300000,acts=new Set();   /* frame()은 앞 시각보다 커야 시간이 흐름 — 판마다 이어 씀 */for(let i=0;i<60*9;i++){G.P.hp=G.P.maxHp;G.P.xp=0;G.queue.length=0;if(modal)show(null);G.eliteT=999;frame(t+=16);if(e.eact)acts.add(e.eact);if(G.P.clingT>0)acts.add('clung');}window.__t=t;
              return {kind:e.kind,acts:[...acts],kids:(e.kids||[]).length,toast:document.querySelector('#toast').innerText,ref:REFINE_ERR.length};}""", {'st': st})
            pg.screenshot(path=str(OUT / f'{vname}_{st+1}_{id_}.png'))
            if id_ == 'gaekgwi' and 'clung' not in r['acts']: fails.append(f'{vname} ② 객귀가 실제로 들러붙지 않음 {r}')
            if r['kind'] != id_: fails.append(f'{vname} ② {st+1}막 엘리트 {r["kind"]}')
            if not r['acts'] and not (id_ == 'gomnaru' and r['kids'] == 2): fails.append(f'{vname} ② {id_} 9초 동안 행동 없음(암곰은 새끼 둘) {r}')
            if r['ref']: fails.append(f'{vname} ② 다듬기 오류 {r["ref"]}')
        if vname == 'pc':
            url = pg.evaluate(SHEET, NEW)
            (ROOT / 'docs' / 'img' / 'elite2_v194.png').write_bytes(base64.b64decode(url.split(',', 1)[1]))
        ctx.close()
    br.close()
if errs: fails.append('화면 오류 ' + '; '.join(errs[:3]))
if fails: print(f'FAIL elite2_ui ({len(fails)})\n  ' + '\n  '.join(fails)); sys.exit(1)
print('PASS elite2_ui (도감 63 · 1~5막 새 엘리트 출현·행동 · 다듬기 오류 0 · PC·휴대폰 · 넘침 0 · 화면 오류 0 · 모음 그림 docs/img/elite2_v194.png)')
