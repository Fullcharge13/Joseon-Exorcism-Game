/* ======================= 분위기 층 (v18.2) =======================
   보기만 하는 효과: 막이 갈수록 깊어지는 밤, 막별 어둠 색, 빛나는 물건, 요괴 탄·경고 장판의 빛, 잔해.
   게임 규칙·맞는 범위는 건드리지 않는다. 설계: docs/specs/2026-11-01-분위기-층.md
   - 엔진이 부르는 곳: 바닥 뒤 vfxGround(cx,cy) · 피해 숫자·요괴 탄 직전 vfxLight(cx,cy) · kill 안 vfxDebris(e) · bossDown 10막 G.dawnT
   - 무거운 그림은 미리 굽는다: 어둠(화면 크기·밤 단계가 바뀔 때만), 빛 번짐(색마다 한 장), 새벽빛 */
// night: 어둠 세기(0~1) · tint: 어둠 색(막의 색감) · lamp: 빛나는 물건 · dawn: 막 보스 뒤 새벽
const STAGE_VFX=[
 {night:0.20,tint:'#2a1428',lamp:'chorong'},    // 1 한양 저잣거리 · 해 질 녘
 {night:0.28,tint:'#0e1c18',lamp:'firefly'},    // 2 대숲 오솔길 · 초저녁
 {night:0.32,tint:'#1e1610',lamp:'torch'},      // 3 범 나오는 고개
 {night:0.40,tint:'#0c1622',lamp:'boat'},       // 4 안개 낀 나루 · 밤
 {night:0.48,tint:'#14121e',lamp:'seokdeung'},  // 5 폐허가 된 산사 · 한밤
 {night:0.50,tint:'#1c1a0c',lamp:'candle'},     // 6 역병 도는 마을
 {night:0.50,tint:'#0e1426',lamp:'snow'},       // 7 백두산 골짜기
 {night:0.52,tint:'#0a1418',lamp:'fishfire'},   // 8 동해 바닷가
 {night:0.60,tint:'#120a1e',lamp:'neokbul'},    // 9 저승길 · 가장 깊음
 {night:0.56,tint:'#1a0c12',lamp:'palace',dawn:true}];   // 10 근정전 앞뜰 · 보스 뒤 새벽
// 빛나는 물건: post=땅에 선 것(몸체를 그림), float=떠다니는 빛 · c=빛 색 · r=빛 반지름 · d=격자 칸(96px)마다 나올 확률
const VFX_LAMP={
 chorong:{post:1,c:'255,170,80',r:52,d:0.22},torch:{post:1,c:'255,140,60',r:50,d:0.16},boat:{post:1,c:'255,190,110',r:46,d:0.14},
 seokdeung:{post:1,c:'255,200,120',r:48,d:0.18},candle:{post:1,c:'255,180,90',r:40,d:0.18},fishfire:{post:1,c:'255,150,70',r:46,d:0.12},
 palace:{post:1,c:'255,120,80',r:46,d:0.1},
 firefly:{float:14,c:'210,255,140',r:10},snow:{float:10,c:'220,235,255',r:12},neokbul:{float:12,c:'140,200,255',r:16}};
let VFX_WARN_UP=false;   // 밤이면 보스 경고 장판을 어둠 위(요괴 위)에 그린다: 어둠에 묻히지 않게
const VFXS={rs:12345,debris:[],lastT:0,dk:{key:''},glow:{},dawn:null};
function vfxRnd(){VFXS.rs=(VFXS.rs*1103515245+12345)%2147483648;return VFXS.rs/2147483648;}   // 보기만 하는 효과는 게임 난수를 쓰지 않는다: 효과를 켜도 게임 진행이 같게
function vfxLevel(){const v=meta.set.vfx;return v==='off'?'off':v==='soft'?'soft':'on';}
function vfxSi(){const s=curStg();const i=STAGES.indexOf(s);return i<0?0:i;}
function vfxNightBase(){const lv=vfxLevel();if(lv==='off'||!G)return 0;return STAGE_VFX[vfxSi()].night*(lv==='soft'?0.5:1);}
function vfxNight(){return vfxNightBase()*(1-vfxDawn());}
function vfxDawn(){if(!G)return 0;const V=STAGE_VFX[vfxSi()];return V.dawn&&G.dawnT!=null?clamp((G.time-G.dawnT)/3,0,1):0;}
const vfxCanvas=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');if(x)f(x,w,h);return c;};
function vfxGlowImg(c){return VFXS.glow[c]||(VFXS.glow[c]=vfxCanvas(32,32,x=>{const g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,`rgba(${c},1)`);g.addColorStop(1,`rgba(${c},0)`);x.fillStyle=g;x.fillRect(0,0,32,32);}));}
const vfxHex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(',');
// 잔해: 요괴·옹기를 쓰러뜨리면 조각이 튀었다가 바닥에 몇 초 남는다(밟으면 밀림)
function vfxDebris(e){const lv=vfxLevel();if(lv==='off'||!e)return;const cap=(LOW?60:260)*(lv==='soft'?0.5:1),D=VFXS.debris;
 const E=EN[e.kind]||{},cols=e.prop?['#8a5a2e','#b0702e','#5a3a1e']:[E.A||'#6a5a50',E.B||'#3a3030','#2a2220'],n=e.prop?9:LOW?2:4;
 for(let i=0;i<n;i++){const a=vfxRnd()*TAU,s=20+vfxRnd()*50;
  D.push({x:e.x,y:e.y,z:2,vx:Math.cos(a)*s,vy:Math.sin(a)*s*0.7,vz:40+vfxRnd()*60,c:cols[i%3],s:e.prop&&i%3===0?2:1,life:e.prop?9:5});}
 if(D.length>cap)D.splice(0,D.length-cap);}
function vfxLampAt(tx,ty){const L=VFX_LAMP[STAGE_VFX[vfxSi()].lamp];return L&&L.post&&hash(tx*11+3,ty*7+5)<L.d;}
function vfxEachLamp(cx,cy,f){const T=96;for(let ty=Math.floor(cy/T)-1;ty<=Math.floor((cy+H)/T)+1;ty++)for(let tx=Math.floor(cx/T)-1;tx<=Math.floor((cx+W)/T)+1;tx++)if(vfxLampAt(tx,ty))f(tx*T+40,ty*T+50,tx);}
// 빛 목록(화면 좌표). 퇴마사가 맨 앞이라 상한에 잘리지 않는다. 요괴 탄·경고 장판은 어둠 속에서 스스로 빛난다
function vfxLights(cx,cy){const P=G.P,out=[],cap=LOW?15:45,add=(x,y,r,c,a,kind)=>{if(out.length>=cap)return;const sx=x-cx,sy=y-cy;if(sx<-r||sy<-r||sx>W+r||sy>H+r)return;out.push({x:sx,y:sy,r,c,a,kind});};
 add(P.x,P.y-6,78,'255,200,130',0.16,'hero');
 {const nn=vfxNight();for(const w of G.warns)if(!w.friendly)add(w.x,w.y,(w.r||14)*1.25+14,'255,80,60',0.3+nn*1.1,'warn');}   // 경고 장판은 밤이 깊을수록 세게 빛난다(vfx_read)
 for(const e of G.enemies)if(!e.dead&&(e.boss||e.mid||e.elite))add(e.x,e.y-8,30,'255,120,90',0.2,'foe');
 for(const q of G.ebul)add(q.x,q.y,12,'255,90,120',0.35,'ebul');
 if(G.shrine)add(G.shrine.x,G.shrine.y-20,80,'255,215,130',0.25,'shrine');
 const L=VFX_LAMP[STAGE_VFX[vfxSi()].lamp];if(L&&L.post)vfxEachLamp(cx,cy,(x,y,tx)=>add(x+5,y-14,L.r+Math.sin(G.time*3+tx)*3,L.c,0.32,'lamp'));
 for(const p of G.projs)add(p.x,p.y,13,'170,220,255',0.22,'proj');
 for(const g of G.gems)add(g.x,g.y,7,'140,220,255',0.3,'gem');
 return out;}
// 땅에 선 빛나는 물건의 몸체(작은 도트)
function vfxLampBody(k,x,y,t,tx){const sw=Math.round(Math.sin(t*1.6+tx)*0.6),fl=Math.sin(t*14+tx)>0;b.fillStyle='rgba(0,0,0,0.35)';b.fillRect(x-3,y,8,2);
 if(k==='chorong'||k==='palace'){b.fillStyle='#3a2a20';b.fillRect(x,y-18,1,18);b.fillRect(x,y-18,5,1);b.fillStyle=k==='palace'?'#8a1e1a':'#1d3f8a';b.fillRect(x+3+sw,y-17,4,2);b.fillStyle='#c8402c';b.fillRect(x+3+sw,y-15,4,3);b.fillStyle='#ffd27a';b.fillRect(x+4+sw,y-15,2,2);}
 else if(k==='torch'||k==='fishfire'||k==='boat'){b.fillStyle='#4a3424';b.fillRect(x+4,y-12,1,12);b.fillStyle=fl?'#ffb040':'#ff7a30';b.fillRect(x+3,y-15,3,3);b.fillStyle='#ffe08a';b.fillRect(x+4,y-14,1,1);}
 else if(k==='seokdeung'){b.fillStyle='#6a6a72';b.fillRect(x+2,y-4,5,4);b.fillRect(x+3,y-9,3,5);b.fillStyle='#4a4a52';b.fillRect(x+1,y-12,7,2);b.fillStyle=fl?'#ffd27a':'#ffb84a';b.fillRect(x+4,y-8,1,2);}
 else if(k==='candle'){for(const o of [0,4]){b.fillStyle='#e8dcc0';b.fillRect(x+o+1,y-4,2,4);b.fillStyle=fl?'#ffd040':'#ff9a30';b.fillRect(x+o+1,y-6,1,2);}}}
// 바닥 뒤: 빛나는 물건 몸체와 잔해(화면 좌표)
function vfxGround(cx,cy){if(vfxLevel()==='off'||!G)return;const t=G.time,P=G.P,dt=Math.min(0.05,Math.max(0,t-VFXS.lastT));VFXS.lastT=t;
 const k=STAGE_VFX[vfxSi()].lamp;if(!LOW&&VFX_LAMP[k]&&VFX_LAMP[k].post)vfxEachLamp(cx,cy,(x,y,tx)=>vfxLampBody(k,R(x-cx),R(y-cy),t,tx));
 const D=VFXS.debris;for(let i=D.length-1;i>=0;i--){const q=D[i];q.life-=dt;if(q.life<=0){D.splice(i,1);continue;}
  if(q.z>0||q.vz>0){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vz-=260*dt;q.z+=q.vz*dt;if(q.z<0){q.z=0;q.vz=-q.vz*0.3;q.vx*=0.5;q.vy*=0.5;if(q.vz<12)q.vz=0;}}
  const dx=q.x-P.x,dy=q.y-(P.y+2),d=Math.hypot(dx,dy);if(d<5&&P.moving){q.x+=dx/(d||1)*1.2;q.y+=dy/(d||1)*1.2;}
  const sx=R(q.x-cx),sy=R(q.y-q.z-cy);if(sx<-2||sy<-2||sx>W+2||sy>H+2)continue;b.globalAlpha=Math.min(1,q.life);b.fillStyle=q.c;b.fillRect(sx,sy,q.s,1);}
 b.globalAlpha=1;}
// 세상 그림 뒤, 피해 숫자·요괴 탄·체력 막대 전: 어둠(미리 구운 한 장) → 빛 번짐 → 떠다니는 빛 → 새벽빛
function vfxLight(cx,cy){const lv=vfxLevel();if(lv==='off'||!G)return;const n=vfxNight(),V=STAGE_VFX[vfxSi()],t=G.time;
 b.save();const hk=buf.width>W?2:1;b.setTransform(hk,0,0,hk,0,0);
 const nb=vfxNightBase();if(n>0.01){const key=W+'x'+H+'_'+V.tint+'_'+Math.round(nb*40);if(VFXS.dk.key!==key){const c=vfxHex(V.tint);VFXS.dk={key,img:vfxCanvas(W,H,(x)=>{const px=W/2,py=H/2-6,g=x.createRadialGradient(px,py,40,px,py,Math.max(W,H)*0.7);
   g.addColorStop(0,`rgba(${c},0)`);g.addColorStop(0.35,`rgba(${c},${(nb*0.55).toFixed(3)})`);g.addColorStop(1,`rgba(${c},${nb.toFixed(3)})`);x.fillStyle=g;x.fillRect(0,0,W,H);})};}
  b.globalAlpha=nb>0?n/nb:1;b.drawImage(VFXS.dk.img,0,0);b.globalAlpha=1;}   // 새벽에는 구운 한 장을 옅게(다시 굽지 않음)
 const dw=vfxDawn();if(dw>0){if(!VFXS.dawn||VFXS.dawn.width!==W||VFXS.dawn.height!==H)VFXS.dawn=vfxCanvas(W,H,(x)=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(255,200,140,0.35)');g.addColorStop(1,'rgba(255,200,140,0)');x.fillStyle=g;x.fillRect(0,0,W,H);});
  b.globalAlpha=Math.sin(dw*Math.PI)*0.6+dw*0.3;b.drawImage(VFXS.dawn,0,0);b.globalAlpha=1;}
 if(LOW){b.restore();return;}   // 절약 모드: 미리 구운 어둠 한 장만(요괴 탄·경고·숫자는 어둠 위에 그리므로 그대로 잘 보임)
 b.globalCompositeOperation='lighter';const soft=lv==='soft'?0.6:1;
 for(const l of vfxLights(cx,cy)){if(l.kind==='hero')continue;   // 퇴마사 둘레는 어둠 그림이 이미 밝게 비워 둠. 그림 위에 더하면 도트 색이 번진다(ent_size)
  const rr=l.r*(l.kind==='warn'?0.95:0.6);b.globalAlpha=l.a*soft*(0.4+n*1.2);b.drawImage(vfxGlowImg(l.c),l.x-rr,l.y-rr,rr*2,rr*2);}
 const L=VFX_LAMP[V.lamp];if(L&&L.float&&!LOW){for(let i=0;i<L.float;i++){const x=((hash(i,4)*W*2+Math.sin(t*0.7+i)*30-cx*0.2)%W+W)%W,y=((hash(i,5)*H*2+(V.lamp==='snow'?t*8:Math.cos(t*0.5+i*2)*20)-cy*0.2)%H+H)%H,a=0.5+0.5*Math.sin(t*3+i*1.7);
  b.globalAlpha=0.5*a*soft;b.fillStyle=`rgb(${L.c})`;b.fillRect(R(x),R(y),1,1);b.globalAlpha=0.35*a*soft;b.drawImage(vfxGlowImg(L.c),R(x)-L.r/2,R(y)-L.r/2,L.r,L.r);}}
 b.globalAlpha=1;b.globalCompositeOperation='source-over';b.restore();}
