"""6차 차림 모음 캡처(v19.0): 6차 칸이 있는 갈래의 5차·6차 차림을 나란히(그림 다듬기 켬) → docs/img/tier6_looks.png
사용: python3 tests/browser/tier6_looks.py [게임.html]"""
import sys, pathlib, base64
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parents[2]
game = sys.argv[1] if len(sys.argv) > 1 else str(ROOT / 'index.html')
JS = """()=>{meta.set.refine='on';const L=[];for(const c in CHARS)CHARS[c].branches.forEach(b=>{if(b.tiers[5])L.push([b.tiers[4],b.tiers[5]]);});
 const k=6,cw=150,ch=200,cv=document.createElement('canvas');cv.width=cw*L.length;cv.height=ch;const x=cv.getContext('2d');x.fillStyle='#14101a';x.fillRect(0,0,cv.width,ch);x.imageSmoothingEnabled=false;
 L.forEach(([a,t],i)=>{const s=charSpr(t.look).n,s5=charSpr(a.look).n;x.globalAlpha=0.45;x.drawImage(s5,i*cw+8,40,s5.width*3,s5.height*3);x.globalAlpha=1;x.drawImage(s,i*cw+cw-s.width*k-10,20,s.width*k,s.height*k);
  x.fillStyle='#efe6d2';x.font='bold 15px sans-serif';x.textAlign='center';x.fillText(t.name,i*cw+cw/2,ch-14);x.fillStyle='#8a8494';x.font='11px sans-serif';x.fillText(a.name+' →',i*cw+40,ch-36);});
 return cv.toDataURL();}"""
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.route('**/fonts.g*/**', lambda r: r.abort()); pg.goto('file://' + str(pathlib.Path(game).resolve())); pg.wait_for_timeout(400)
    d = pg.evaluate(JS); (ROOT / 'docs' / 'img' / 'tier6_looks.png').write_bytes(base64.b64decode(d.split(',')[1])); br.close()
print('wrote docs/img/tier6_looks.png')
# README용 낱장: 6차 차림 docs/img/char_<직업>_06.png(갈래0)·_16.png(갈래1), 기술 도장 docs/img/s_<기술>.png
JS2 = """()=>{const o={};for(const c in CHARS)CHARS[c].branches.forEach((b,bi)=>{const t=b.tiers[5];if(!t)return;const s=charSpr(t.look).raw.n,cv=document.createElement('canvas');cv.width=s.width*4;cv.height=s.height*4;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(s,0,0,cv.width,cv.height);o[`char_${c}_${bi}6`]=cv.toDataURL();
 const d=WD[t.skill],q=document.createElement('canvas');q.width=q.height=32;const y=q.getContext('2d');y.fillStyle=d.col;y.fillRect(0,0,32,32);y.fillStyle='#fff6d0';y.font='bold 20px serif';y.textAlign='center';y.textBaseline='middle';y.fillText(d.g,16,17);o['s_'+t.skill]=q.toDataURL();});return o;}"""
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.route('**/fonts.g*/**', lambda r: r.abort()); pg.goto('file://' + str(pathlib.Path(game).resolve())); pg.wait_for_timeout(400)
    for k, d in pg.evaluate(JS2).items(): (ROOT / 'docs' / 'img' / (k.replace('_06', '_06').replace('_16', '_16') + '.png')).write_bytes(base64.b64decode(d.split(',')[1]))
    br.close()
print('wrote README 낱장')
