"""그림 다듬기 회귀 시험(v18.6, Playwright)
사용: python3 tests/browser/refine_same.py [옛.html] [새.html]   (옛 판을 안 주면 git의 v18.5 122dcfe)
1) 그림 다듬기 「끔」이면 화면이 옛 판과 한 점도 다르지 않다(10막 같은 장면, PC·휴대폰)
2) 「켬」이면 퇴마사·요괴를 그리는 자리의 아래 가운데(발 자리)가 「끔」과 같고, 그림 둘레가 정확히 1칸×배율 넓다
3) 화면 오류 0. 켬·끔 캡처를 tests/browser/out/refine/ 에 남긴다(10막 × PC·휴대폰)"""
import sys, pathlib, subprocess, tempfile
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from vfx_scene import INIT, SCENE
ROOT = pathlib.Path(__file__).resolve().parents[2]
old = sys.argv[1] if len(sys.argv) > 1 else None
new = sys.argv[2] if len(sys.argv) > 2 else str(ROOT / 'index.html')
if not old:
    tmp = pathlib.Path(tempfile.mkdtemp()) / 'v185.html'
    tmp.write_text(subprocess.run(['git', '-C', str(ROOT), 'show', '122dcfe:index.html'], capture_output=True, text=True, check=True).stdout, encoding='utf8'); old = str(tmp)
OUT = ROOT / 'tests' / 'browser' / 'out' / 'refine'; OUT.mkdir(parents=True, exist_ok=True)
HIDE = "()=>{document.querySelectorAll('#toast,#task,.taskpop,#taskPops,#ach').forEach(e=>e.style.visibility='hidden');}"   # 과업 달성 알림은 CSS 애니메이션 시각에 따라 흔들려 숨김
# 퇴마사·요괴 그림을 그리는 drawImage 호출을 모아 (원래 크기, 그린 자리)를 돌려준다
FEET = """(o)=>{meta.set.refine=o.r;const seen=new Map(),add=s=>{if(s&&s.raw){for(const k of ['n','f','h','hf']){seen.set(s.raw[k],s);seen.set(s.ref[k],s);}}};
 add(charSpr(playerLook()));for(const id in ESPR)add(ESPR[id]);const out=[];const dI=b.drawImage;
 b.drawImage=function(img,...a){const s=seen.get(img);if(s&&a.length===4)out.push([Math.round((a[0]+a[2]/2)*4)/4,Math.round((a[1]+a[3])*4)/4,a[2],a[3],s.w,s.hgt,s.ref.n===img||s.ref.f===img||s.ref.h===img||s.ref.hf===img]);return dI.call(this,img,...a);};
 try{render();}finally{b.drawImage=dI;}return out;}"""
# v20.3.1: 새 판(v20.1~)도 옛 판과 같은 난수 차례가 되게 — ① 주소 ?seed= 로 판을 시작할 때 씨앗을 뽑지 않게(옛 판은 무시)
# ② 게임은 불러올 때의 Math.random을 「원래 것」으로 기억하고 그때만 씨앗 난수를 쓰므로, 불러온 뒤 감싸 시험 난수를 따르게
SAME_RNG = "()=>{const f=Math.random;Math.random=()=>f();}"
fails = []; errs = []
# 판 시작(의뢰 고르기 등)도 같은 난수가 되게 처음부터 씨앗을 고정(HUD 글이 판마다 달라 비교가 흔들리지 않게)
SEED = "let __s=3;Math.random=()=>{__s=(__s*16807)%2147483647;return (__s-1)/2147483646;};"
def shots(path, refine):
    res = {}
    with sync_playwright() as p:
        br = p.chromium.launch()
        for vname, vopt in (('pc', dict(viewport={'width': 1280, 'height': 720})), ('phone', dict(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2))):
            ctx = br.new_context(**vopt); ctx.add_init_script(INIT + SEED); ctx.route('**/fonts.g*/**', lambda r: r.abort())
            pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); pg.goto('file://' + str(pathlib.Path(path).resolve()) + '?seed=1'); pg.wait_for_timeout(400)
            pg.evaluate(SAME_RNG)
            pg.evaluate("()=>{if(typeof EN!=='undefined'&&EN.songaksi)delete EN.songaksi.ai;}")   # v19.7 손각시가 쏘게 되어 장면 속 자리·탄이 달라짐 → 그림 비교만 하도록 옛 행동으로(옛 판에는 원래 없음)
            for st in range(10):
                pg.evaluate(f"()=>{{meta.set.refine='{refine}';}}"); pg.evaluate(SCENE, {'st': st, 'v': 'on', 'n': 40, 'warm': 40}); pg.evaluate(HIDE)
                f = OUT / f'{pathlib.Path(path).stem}_{refine}_{vname}_{st+1:02d}.png'; pg.screenshot(path=str(f)); res[(vname, st)] = f
            ctx.close()
        br.close()
    return res
a = shots(old, 'off'); b2 = shots(new, 'off')
for k in a:
    x, y = Image.open(a[k]).convert('RGB'), Image.open(b2[k]).convert('RGB')
    d = ImageChops.difference(x, y).getbbox()
    if d: fails.append(f'끔 {k[0]} {k[1]+1}막: v18.5와 다름 {d}')
c = shots(new, 'on')
# 발 자리: 같은 장면에서 켬·끔으로 render 한 번씩
with sync_playwright() as p:
    br = p.chromium.launch(); ctx = br.new_context(viewport={'width': 1280, 'height': 720}); ctx.add_init_script(INIT); ctx.route('**/fonts.g*/**', lambda r: r.abort())
    pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); pg.goto('file://' + str(pathlib.Path(new).resolve())); pg.wait_for_timeout(400)
    # 검토 지적(중요): 실제로 테두리가 칠해졌는지(여백 줄에 불투명 칸이 있음) · 다듬기 오류 0 · 뒤집힌 그림은 뒤집은 뒤 다듬음(아래·오른쪽이 어두움)
    chk = pg.evaluate("""()=>{meta.set.refine='on';const HERO=charSpr(CHARS.seonbi.look),L=[HERO,...Object.values(ESPR),...Object.values(PSPR)];let ring0=0,flipBad=0,lined=0;
     const px=c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data;
     for(const s of L){const c=s.ref.n,d=px(c),W=c.width,H=c.height,r=px(s.raw.n),w0=s.raw.n.width;let edgeLit=0,outl=0;
      /* 테두리 칸 = 다듬은 그림에서 불투명인데 원래 그림(1칸 옮긴 자리)에서는 빈칸 · 짙지 않은 가장자리 칸이 있는 그림은 테두리가 1칸 이상 있어야 함 */
      const A=(x,y)=>x>=0&&y>=0&&x<w0&&y<s.raw.n.height&&r[(y*w0+x)*4+3]>0,lum=(x,y)=>{const i=(y*w0+x)*4;return 0.2126*r[i]+0.7152*r[i+1]+0.0722*r[i+2];};
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(d[(y*W+x)*4+3]&&!A(x-1,y-1))outl++;}
      for(let y=0;y<s.raw.n.height;y++)for(let x=0;x<w0;x++)if(A(x,y)&&lum(x,y)>=60&&(!A(x-1,y)||!A(x+1,y)||!A(x,y-1)||!A(x,y+1)))edgeLit++;
      if(outl)ring0++;else if(!edgeLit)lined++;   /* v19.5: 가장자리가 모두 짙은 테두리(k)로 그려진 새 엘리트는 규칙대로 테두리를 더하지 않음 */   /* 여기서는 테두리가 있는 그림 수(규칙의 세부는 단위 refine_rule이 본다) */
      const e=refineCanvas(s.raw.f),a=px(s.ref.f),q=px(e);if(a.length!==q.length||a.some((v,i)=>v!==q[i]))flipBad++;}
     return {n:L.length,ring0,lined,flipBad,err:REFINE_ERR.slice(0,3),dark:L.filter(s=>{const r=px(s.raw.n);let t=0,k=0;for(let i=0;i<r.length;i+=4)if(r[i+3]){t++;if(0.2126*r[i]+0.7152*r[i+1]+0.0722*r[i+2]<60)k++;}return k>t*0.8;}).length};}""")
    # 실제 브라우저에서 다듬기가 돌았는지: v18.6.1부터 검은 요괴도 밝은 테두리를 받으므로 거의 모든 그림에 테두리 칸이 있어야 함(1칸 골목·갇힌 틈만 닿은 경우 두 장까지 허용)
    if chk['ring0'] < chk['n'] - chk['lined'] - 2 or chk['flipBad'] or chk['err']: fails.append(f'다듬기 확인: 그림 {chk["n"]}장(거의 검은 그림 {chk["dark"]}) 중 테두리 있는 그림 {chk["ring0"]}(가장자리가 이미 짙은 그림 {chk["lined"]}) · 뒤집힌 그림이 다른 것 {chk["flipBad"]} · 오류 {chk["err"]}')
    print(f'다듬은 그림 {chk["n"]}장 · 테두리 있음 {chk["ring0"]} · 거의 검은 그림 {chk["dark"]} · 오류 {len(chk["err"])}')
    for st in (0, 4, 8):
        pg.evaluate(SCENE, {'st': st, 'v': 'on', 'n': 40, 'warm': 40})
        off = pg.evaluate(FEET, {'r': 'off'}); on = pg.evaluate(FEET, {'r': 'on'})
        if not off or len(off) != len(on): fails.append(f'{st+1}막: 그린 그림 수가 다름 끔 {len(off)} 켬 {len(on)}'); continue
        for q, r in zip(off, on):
            k = q[2] / q[4]
            if abs(q[0] - r[0]) > 0.5 or abs(q[1] - (r[1] - k)) > 0.5 or abs(r[2] - (q[2] + 2 * k)) > 1e-6 or q[6] or not r[6]:
                fails.append(f'{st+1}막: 발 자리·둘레가 다름 끔 {q} 켬 {r}'); break
    br.close()
if errs: fails.append('화면 오류 ' + '; '.join(errs[:3]))
if fails: print(f'FAIL refine_same ({len(fails)})\n  ' + '\n  '.join(fails[:15])); sys.exit(1)
print('PASS refine_same (끔 10막 × PC·휴대폰이 v18.5와 같음 · 켬 발 자리 같고 둘레 1칸 · 화면 오류 0)')
