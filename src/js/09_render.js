/* ======================= render ======================= */
function resize(){DPR=LOW?1:Math.min(window.devicePixelRatio||1,2);const cw=Math.max(1,innerWidth||0),ch=Math.max(1,innerHeight||0);const tgt={big:160,mid:200,small:260}[meta.set.scale]||200;
 S=Math.max(1,Math.floor(Math.min(cw,ch)/tgt));W=Math.max(1,Math.ceil(cw/S));H=Math.max(1,Math.ceil(ch/S));const hk=hdOn()?2:1;buf.width=W*hk;buf.height=H*hk;
 cvs.width=Math.max(1,Math.round(cw*DPR));cvs.height=Math.max(1,Math.round(ch*DPR));
 vig=document.createElement('canvas');vig.width=W;vig.height=H;const v=vig.getContext('2d');const g=v.createRadialGradient(W/2,H/2,Math.min(W,H)*0.25,W/2,H/2,Math.hypot(W,H)*0.55);
 g.addColorStop(0,'rgba(10,6,20,0)');g.addColorStop(1,'rgba(10,6,20,0.82)');v.fillStyle=g;v.fillRect(0,0,W,H);}
addEventListener('resize',resize);resize();

function hash(x,y){let h=(x*374761393+y*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295;}
function drawGround(cx,cy){const st=curStg(),gr=st.gr,T=16;b.fillStyle=gr[0];b.fillRect(0,0,W,H);
 const tx0=Math.floor(cx/T),ty0=Math.floor(cy/T),tx1=Math.floor((cx+W)/T),ty1=Math.floor((cy+H)/T);
 for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){const h=hash(tx,ty),sx=tx*T-cx,sy=ty*T-cy;
  if(st.paved){b.fillStyle=h<0.4?gr[1]:gr[0];b.fillRect(sx,sy,T,T);b.fillStyle=gr[2];b.fillRect(sx,sy+T-1,T,1);b.fillRect(sx+((ty&1)?8:0),sy,1,T);
   if(h>0.85){b.fillRect(sx+4,sy+5,5,1);b.fillRect(sx+8,sy+6,1,3);}}
  else{if(h<0.3){b.fillStyle=gr[1];b.fillRect(sx,sy,T,T);}
   if(h>0.82){b.fillStyle=gr[3];b.fillRect(sx+3,sy+5,2,1);b.fillRect(sx+10,sy+11,1,1);}
   if(h>0.6&&h<0.66){b.fillStyle=gr[3];b.fillRect(sx+6,sy+8,1,3);b.fillRect(sx+8,sy+7,1,4);}}}}
function drawObstacles(cx,cy){const st=curStg(),k=st.ob;const tx0=Math.floor(cx/OT)-1,ty0=Math.floor(cy/OT)-1,tx1=Math.floor((cx+W)/OT)+1,ty1=Math.floor((cy+H)/OT)+1;
 for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){const o=obstAt(tx,ty);if(o)drawOb(k,R(o.x),R(o.y),o.r);}}
function drawOb(k,x,y,r){const rr=R(r);b.fillStyle='rgba(0,0,0,0.35)';b.fillRect(x-rr,y,rr*2,2);
 switch(k){
  case 'jang':for(const [ox,oy,s] of [[-rr*0.5,0,rr*0.6],[rr*0.5,-1,rr*0.55],[0,-rr*0.5,rr*0.5]]){const X=R(x+ox),Y=R(y+oy),sR=R(s);b.fillStyle='#4a2a18';b.beginPath();b.ellipse(X,Y-sR,sR,sR*1.1,0,0,TAU);b.fill();b.fillStyle='#6a3a20';b.fillRect(X-sR+1,Y-sR*2,sR*2-2,2);b.fillStyle='#2a1810';b.fillRect(X-2,Y-sR*2-1,4,1);}break;
  case 'bamboo':for(let i=-2;i<=2;i++){const bx=x+i*3,bh=20+((x*7+i*13)%10+10)%10;b.fillStyle=i%2?'#3f7a4a':'#4f8f55';b.fillRect(bx,y-bh,2,bh);b.fillStyle='#2a5234';for(let j=4;j<bh;j+=6)b.fillRect(bx,y-bh+j,2,1);b.fillStyle='#5faa60';b.fillRect(bx+2,y-bh+2,3,1);}break;
  case 'rock':case 'reef':b.fillStyle=k==='reef'?'#2a3a40':'#5a5448';b.beginPath();b.ellipse(x,y-rr*0.6,rr,rr*0.8,0,0,TAU);b.fill();b.fillStyle=k==='reef'?'#4a6a7a':'#7a7262';b.fillRect(x-rr*0.5,y-rr*1.2,rr*0.6,2);if(k==='reef'){b.fillStyle='#8fd3ff';b.fillRect(x-rr,y,rr*2,1);}break;
  case 'reed':b.fillStyle='#3a4a48';b.beginPath();b.ellipse(x,y-3,rr,rr*0.5,0,0,TAU);b.fill();b.fillStyle='#8a9a5a';for(let i=-3;i<=3;i++)b.fillRect(x+i*2,y-10-(i&1)*3,1,10);b.fillStyle='#b0a060';for(let i=-3;i<=3;i+=2)b.fillRect(x+i*2,y-13-(i&1)*3,1,3);break;
  case 'lantern':b.fillStyle='#6a6672';b.fillRect(x-4,y-4,8,4);b.fillRect(x-2,y-14,4,10);b.fillRect(x-5,y-18,10,4);b.fillRect(x-3,y-21,6,3);b.fillStyle='#e0b048';b.fillRect(x-1,y-17,2,2);b.fillStyle='#45424c';b.fillRect(x-6,y-19,12,1);break;
  case 'jangseung':b.fillStyle='#8a6a4a';b.fillRect(x-3,y-22,6,22);b.fillStyle='#1a1418';b.fillRect(x-4,y-24,8,3);b.fillStyle='#efe6d2';b.fillRect(x-2,y-19,1,2);b.fillRect(x+1,y-19,1,2);b.fillStyle='#c23b2a';b.fillRect(x-2,y-15,4,1);b.fillStyle='#4a3a30';b.fillRect(x-1,y-11,2,8);break;
  case 'pine':b.fillStyle='#4a3a30';b.fillRect(x-1,y-6,2,6);b.fillStyle='#2a4a3a';for(let i=0;i<3;i++){b.beginPath();b.moveTo(x,y-26+i*6);b.lineTo(x-rr+i,y-12+i*4);b.lineTo(x+rr-i,y-12+i*4);b.fill();}b.fillStyle='#e8ecf4';b.fillRect(x-3,y-24,6,1);b.fillRect(x-5,y-17,4,1);break;
  case 'stele':b.fillStyle='#3a3540';b.fillRect(x-4,y-16,8,16);b.fillStyle='#4a4552';b.fillRect(x-5,y-18,10,3);b.fillStyle='#8a8494';for(let i=0;i<4;i++)b.fillRect(x-2,y-13+i*3,4,1);break;
  default:b.fillStyle='#8a8494';b.fillRect(x-3,y-10,6,10);b.fillStyle='#5a5664';b.fillRect(x-4,y-1,8,1);b.fillStyle='#4a4552';b.fillRect(x-1,y-8,2,5);}}
function drawSpr(s,x,y,flip,fl,sc=1,alpha=1){const img=fl?(flip?s.hf:s.h):(flip?s.f:s.n);const w=s.w*sc,h=s.hgt*sc;if(alpha<1)b.globalAlpha=alpha;b.drawImage(img,R(x-w/2),R(y-h),w,h);if(alpha<1)b.globalAlpha=1;}
function shadow(x,y,r){b.fillStyle='rgba(0,0,0,0.35)';b.fillRect(R(x-r),R(y-1),R(r*2),2);}
const DITH={},EMB={},LITE={};
function mixHex(c,t,k){const h=x=>parseInt(x,16),a=[1,3,5].map(i=>h(c.substr(i,2))),bb=[1,3,5].map(i=>h(t.substr(i,2)));return '#'+a.map((v,i)=>Math.round(v+(bb[i]-v)*k).toString(16).padStart(2,'0')).join('');}
function lite(c){return LITE[c]||(LITE[c]=c.length===7?mixHex(c,'#ffffff',0.55):c);}
function dith(c,dense){const k=c+(dense?1:0);if(DITH[k])return DITH[k];const cv=document.createElement('canvas');cv.width=cv.height=4;const x=cv.getContext('2d');x.fillStyle=c;
 const pts=dense?[[0,0],[2,0],[1,1],[3,1],[0,2],[2,2],[1,3],[3,3]]:[[0,0],[2,2],[3,0],[1,2]];for(const [i,j] of pts)x.fillRect(i,j,1,1);return DITH[k]=b.createPattern(cv,'repeat');}
function pxRing(x,y,rx,ry,col,ph,dash,on){if(rx<1)return;const n=Math.max(12,Math.round(TAU*Math.sqrt((rx*rx+ry*ry)/2)/1.3)),off=Math.floor(ph);b.fillStyle=col;b.beginPath();
 for(let i=0;i<n;i++){if(dash&&(((i+off)%dash)+dash)%dash>=on)continue;const a=i/n*TAU;b.rect(R(x+Math.cos(a)*rx),R(y+Math.sin(a)*ry),1,1);}b.fill();}
function rune(x,y,col){x=R(x);y=R(y);b.fillStyle=col;b.fillRect(x-1,y,3,1);b.fillRect(x,y-1,1,3);b.fillStyle='#fff';b.fillRect(x,y,1,1);}
let EMQ=[],RCX=0,RCY=0;const BUBQ=[],EDGEQ=[];   // v17.5 말풍선·가장자리 표지(화면 글, drawGuideUI)
function emblem(src,x,y,a){if(!src)return;if(src!=='boss')a*=meta.set.fxA;if(a<=0.05)return;EMQ.push(src,x-RCX,y-RCY,Math.min(1,a));}
function embInfo(src){if(src==='boss')return {bg:'#7a2018',bd:'#ff5a3a',bang:1};
 if(src.startsWith('anom:')){const A=ANOM.find(x=>x.id===src.slice(5));return {bg:'#3a1a4a',bd:'#c080ff',g:A?A.g:'?'};}
 if(src==='call'){const k=G?callGod():'none';return {bg:k==='none'?'#4a3a30':BLESS[k].col,bd:'#fff6d0',g:CALL[k].g};}
 if(src==='ult')return {bg:'#7a2018',bd:'#e0b048',g:ULT[G.cid].g};
 if(src.startsWith('pet:')){const t=src.slice(4);return {bg:{tiger:'#b0702e',bear:'#5a3e2a',falcon:'#3a5f9e'}[t]||'#2a2228',bd:'#efe6d2',g:{tiger:'虎',bear:'熊',falcon:'鷹'}[t]||'獸'};}
 const d=WD[src];if(!d)return null;if(d.type==='c')return {bg:d.col||'#2a2228',bd:'#e0b048',g:d.g||d.name[0]};return {bg:'#2a2228',bd:'#e0b048',ic:ICS[src]};}
function drawEmblems(){if(!EMQ.length)return;const k=S*DPR,sz=12*k;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.textAlign='center';ctx.textBaseline='middle';
 for(let i=0;i<EMQ.length;i+=4){const inf=embInfo(EMQ[i]);if(!inf)continue;const x=Math.round(EMQ[i+1]*k-sz/2),y=Math.round(EMQ[i+2]*k-sz/2);ctx.globalAlpha=EMQ[i+3];
  ctx.fillStyle='#0a080c';ctx.fillRect(x,y,sz,sz);ctx.fillStyle=inf.bd;ctx.fillRect(x+k,y+k,sz-2*k,sz-2*k);ctx.fillStyle=inf.bg;ctx.fillRect(x+2*k,y+2*k,sz-4*k,sz-4*k);
  if(inf.ic)ctx.drawImage(inf.ic,x+2*k,y+2*k,8*k,8*k);
  else if(inf.bang){ctx.fillStyle='#fff6d0';ctx.fillRect(x+5*k,y+3*k,2*k,4*k);ctx.fillRect(x+5*k,y+8*k,2*k,k);}
  else{ctx.font=`bold ${Math.round(7.5*k)}px "Song Myung", serif`;ctx.fillStyle='#0a080c';ctx.fillText(inf.g,x+sz/2+Math.max(1,k/3),y+sz/2+Math.max(1,k/3));ctx.fillStyle='#fff6d0';ctx.fillText(inf.g,x+sz/2,y+sz/2);}}
 ctx.restore();EMQ.length=0;}
function pxArea(x,y,r,col,a,ph,big){const ry=r*0.75;
 b.globalAlpha=0.08*a;b.fillStyle=col;b.beginPath();b.ellipse(x,y,r,ry,0,0,TAU);b.fill();
 b.globalAlpha=0.6*a;b.fillStyle=dith(col,false);b.fill();
 b.globalAlpha=0.95*a;pxRing(x,y,r,ry,col,ph*10,6,4);
 if(big&&!LOW){b.globalAlpha=0.55*a;pxRing(x,y,r*0.62,ry*0.62,lite(col),-ph*8,3,1);}
 if(r>=12){b.globalAlpha=a;const l=lite(col);rune(x+r,y,l);rune(x-r,y,l);rune(x,y+ry,l);if(r<14)rune(x,y-ry,l);}
 b.globalAlpha=1;}
function drawZone(z){const a=Math.min(1,z.life/0.4),ry=z.r*0.75;
 if(z.kind==='flag'){pxArea(z.x,z.y,z.r,z.col,a*0.6,G.time,false);b.globalAlpha=1;b.fillStyle='#4a3a30';b.fillRect(R(z.x),R(z.y-18),1,18);b.fillStyle=z.col;const wv=Math.sin(G.time*6+z.x)>0?1:0;b.fillRect(R(z.x+1),R(z.y-18),6+wv,5);b.fillStyle='#1a1418';b.fillRect(R(z.x+3),R(z.y-16),2,1);emblem(z.src,z.x,z.y+ry,a);return;}
 pxArea(z.x,z.y,z.r,z.col,a,G.time+(z.x%7),z.r>=30);
 if(z.r>=14)emblem(z.src,z.x,z.y-ry,a);
 b.globalAlpha=a*0.9;
 if(z.kind==='arrows'){b.globalAlpha=0.9;b.strokeStyle='#c9a06a';for(let i=0;i<6;i++){const t=(G.time*3+i/6)%1,ax=z.x+Math.cos(i*2.4+z.x)*z.r*0.7,ay=z.y+Math.sin(i*1.7)*z.r*0.5-(1-t)*24;b.beginPath();b.moveTo(R(ax),R(ay-5));b.lineTo(R(ax),R(ay));b.stroke();}}
 else if(z.kind==='fire'){b.globalAlpha=0.9;for(let i=0;i<3;i++){b.fillStyle=i?'#ffb04a':'#fff0a0';b.fillRect(R(z.x-1+i-1),R(z.y-3-((G.time*8+i)%3)),1,2);}}
 else if(z.kind==='petal'){b.globalAlpha=0.9;b.fillStyle='#ffb0d0';for(let i=0;i<6;i++){const t=(G.time*1.2+i/6)%1;b.fillRect(R(z.x+Math.cos(i*2.1+z.x)*z.r*0.7+Math.sin(t*6)*2),R(z.y-(1-t)*18+Math.sin(i*1.7)*z.r*0.4),2,1);}}
 else if(z.kind==='herb'){b.globalAlpha=0.9;b.fillStyle='#4f9f4f';for(let i=0;i<5;i++){const ox=Math.cos(i*1.9+z.x)*z.r*0.5,oy=Math.sin(i*2.3)*z.r*0.35;b.fillRect(R(z.x+ox),R(z.y+oy-2),1,3);b.fillRect(R(z.x+ox-1),R(z.y+oy-2),3,1);}}
 else{b.globalAlpha=a*0.8;for(let i=0;i<3;i++){const t=(G.time*1.5+i/3)%1;b.fillStyle=lite(z.col);b.fillRect(R(z.x+Math.cos(i*2.1+z.x)*z.r*0.5),R(z.y-t*8+Math.sin(i*2.1)*z.r*0.3),1,1);}}
 b.globalAlpha=1;}
function heroBox(){const P=G.P,ps=charSpr(playerLook()),k=entK(),w=ps.w*k,h=ps.hgt*k;return {x0:R(P.x-w/2)-1,y0:R(P.y-h)-2,x1:R(P.x+w/2)+1,y1:R(P.y+2)+3};}
/* 플레이어 둘레의 따뜻한 빛: 크기(hk)마다 한 번만 그려 두고 다시 쓴다(매 장면 그라디언트를 만들지 않게) */
const GLOW_RES=4,glowCache={};
function heroGlow(hk){if(glowCache[hk])return glowCache[hk];const w=52*hk,h=32*hk,c=document.createElement('canvas');c.width=Math.ceil(w*GLOW_RES);c.height=Math.ceil(h*GLOW_RES);
 const g=c.getContext('2d');g.scale(GLOW_RES,GLOW_RES);const lg=g.createRadialGradient(w/2,h/2-2*hk,3*hk,w/2,h/2-2*hk,26*hk);lg.addColorStop(0,'rgba(255,230,160,0.14)');lg.addColorStop(1,'rgba(255,230,160,0)');
 g.fillStyle=lg;g.beginPath();g.ellipse(w/2,h/2,26*hk,16*hk,0,0,TAU);g.fill();return glowCache[hk]=c;}
function drawHero(){drawHeroBody();drawHpBar();}
function drawHeroBody(){const P=G.P,ps=charSpr(playerLook()),pb=P.moving&&Math.sin(G.time*14)>0?-1:0;
 if(!(P.iframe>0&&Math.floor(G.time*20)%2))drawSpr(ps,P.x,P.y+pb,P.face<0,P.iframe>0.3,entK());}   // v17.2 걸을 때 돌려 그리기(도트가 깨짐)는 뺌
function drawHpBar(){const P=G.P;
 const w=14,x=R(P.x-w/2),y=R(P.y+2);b.fillStyle='#000';b.fillRect(x-1,y-1,w+2,4);b.fillStyle='#5a1a14';b.fillRect(x,y,w,2);b.fillStyle='#d24a34';b.fillRect(x,y,R(w*clamp(P.hp/P.maxHp,0,1)),2);}
function drawSpirit(s){const x=R(s.x),y=R(s.y+Math.sin(s.ph)*2);
 if(s.look==='kite'){const t=G.time*3+s.id*7;b.save();b.translate(x,y-8);b.rotate(Math.sin(t)*0.3);b.fillStyle='#efe6d2';b.fillRect(-4,-5,8,10);b.fillStyle='#c23b2a';b.fillRect(-1,-1,2,2);b.fillStyle='#3a5f9e';b.fillRect(-4,-5,8,1);b.fillRect(-4,4,8,1);b.restore();b.strokeStyle='rgba(239,230,210,0.5)';b.lineWidth=1;b.beginPath();b.moveTo(x,y-3);b.lineTo(x+Math.sin(t)*4,y+6);b.stroke();return;}
 if(s.look==='porter'||s.look==='peddler'){drawSpr(s.look==='porter'?SPR_PT:SPR_BS,x,y+4,s.fx<0,false);b.fillStyle='#4a3a30';b.fillRect(x+(s.fx>0?3:-5),y-8+(Math.sin(s.ph*3)>0?0:2),1,9);if(s.look==='peddler'){b.fillStyle='#8a8494';b.fillRect(x+(s.fx>0?3:-5),y+1,1,1);}return;}
 if(s.look==='yeokjol'||s.look==='navy'){drawSpr(s.look==='navy'?NAVY:SPR_YJ,x,y+4,s.fx<0,false);b.fillStyle=s.look==='navy'?'#8a8494':'#8a5a2b';if(s.look==='navy')b.fillRect(x+(s.fx>0?3:-4),y-10,1,12);else b.fillRect(x+(s.fx>0?3:-5),y-6+(Math.sin(s.ph*3)>0?0:2),2,6);return;}
 if(s.look==='sword'){b.save();b.translate(x,y-6);b.rotate(Math.sin(s.ph)*0.5+(s.fx>0?0.6:-0.6));b.fillStyle='#ffd0e0';b.globalAlpha=0.5;b.fillRect(-2,-7,4,12);b.globalAlpha=1;b.fillStyle='#dfe6f0';b.fillRect(-1,-7,2,9);b.fillStyle='#e0b048';b.fillRect(-2,2,4,1);b.fillStyle='#c23b2a';b.fillRect(-1,3,2,2);b.restore();return;}
 if(s.look==='bug'){b.fillStyle='#7a3aa0';b.fillRect(x-2,y-2,4,3);b.fillStyle='#c080ff';b.fillRect(x-3,y-3+(Math.sin(s.ph*6)>0?0:1),1,1);b.fillRect(x+2,y-3+(Math.sin(s.ph*6)>0?1:0),1,1);return;}
 const temp=s.life!==undefined;b.globalAlpha=temp?0.7:0.85;b.fillStyle=s.look==='soul'?'#e0e8ff':(temp?'#ffd0a0':'#8fd3ff');b.fillRect(x-3,y-6,6,5);b.fillRect(x-2,y-7,4,1);b.fillRect(x-3,y-1,1,2);b.fillRect(x,y-1,1,2);b.fillRect(x+2,y-1,1,2);b.fillStyle='#1a2b4a';b.fillRect(x-2,y-5,1,1);b.fillRect(x+1,y-5,1,1);if(s.look!=='soul'){b.fillStyle='#e0b048';b.fillRect(x-3,y-8,6,1);}b.globalAlpha=1;}
const SPR_PT=variants(mk(['.o....o.','.oooooo.','.oSSSSo.','.oskkso.','..ssss..','.nnnnnn.','snwwwwns','.nnnnnn.','.nn..nn.','.kk..kk.'],{...PAL,S:'#c9a06a'}));
const SPR_BS=variants(mk(['w.kkkk.w','.kkkkkk.','..ssss..','..skks..','..ssss..','.oooooo.','soyyyyos','.oooooo.','.oo..oo.','.kk..kk.']));
const SPR_YJ=variants(mk(['..kkkk..','.kkkkkk.','..ssss..','..skks..','..ssss..','.kkkkkk.','skrrrrks','.kkkkkk.','.kk..kk.','.kk..kk.']));
const NAVY=variants(mk(['...rr...','..xxxx..','..ssss..','..skks..','..ssss..','.BBBBBB.','sByyyyBs','.BBBBBB.','.BB..BB.','.kk..kk.']));
function drawJW(){const h=G.helper;if(!h)return;const s=charSpr(JW_LOOK),fade=Math.min(1,h.t*2),jk=entK();
 b.globalAlpha=fade*0.9;b.fillStyle='#efe6d2';for(const [ox,oy,r] of [[-6,1,3],[0,0,4],[6,1,3],[3,2,3],[-3,2,3]]){b.beginPath();b.arc(R(h.x+ox),R(h.y+oy),r,0,TAU);b.fill();}
 b.globalAlpha=fade*0.35;for(let i=0;i<2;i++){const a=h.ph*3+i*Math.PI;drawSpr(s,h.x+Math.cos(a)*14,h.y-1+Math.sin(a)*5,i===0,false,jk);}
 b.globalAlpha=fade;drawSpr(s,h.x,h.y-1,G.P.x<h.x,false,jk);b.globalAlpha=1;}
function drawCart(m){const x=R(m.x),y=R(m.y),d=m.dir;b.save();b.translate(x,y);b.scale(d,1);b.fillStyle='#6a4a2a';b.fillRect(-12,-8,22,6);b.fillStyle='#c9a06a';b.fillRect(-11,-14,8,6);b.fillRect(-2,-13,7,5);b.fillStyle='#efe6d2';b.fillRect(-10,-13,2,1);b.fillStyle='#4a3a30';b.fillRect(10,-6,8,1);const sp=Math.floor(G.time*12)%2;b.fillStyle='#2a1a10';b.fillRect(-9,-3,5,5);b.fillRect(3,-3,5,5);b.fillStyle='#8a6a4a';b.fillRect(-7+sp,-1,1,1);b.fillRect(5+sp,-1,1,1);drawSpr(SPR_BS,15,2,false,false);b.restore();}
function drawShip(m){if(m.kind==='cart'){drawCart(m);return;}const x=R(m.x),y=R(m.y),d=m.dir;b.save();b.translate(x,y);b.scale(d,1);
 b.fillStyle='#4a2a18';b.fillRect(-18,-4,34,8);b.fillStyle='#6a3a20';b.fillRect(-16,-10,30,7);b.fillStyle='#2a1a10';for(let i=-14;i<12;i+=4)b.fillRect(i,-11,1,2);
 b.fillStyle='#c23b2a';b.fillRect(14,-12,6,5);b.fillStyle='#e0b048';b.fillRect(18,-11,1,1);b.fillStyle='#efe6d2';for(let i=-14;i<12;i+=6)b.fillRect(i,1,2,2);
 b.fillStyle='#8fd3ff';b.globalAlpha=0.5;b.fillRect(-20,4,38,2);b.globalAlpha=1;b.restore();}
function chev(x,y,a,col){b.fillStyle=col;for(let i=0;i<3;i++){const px=x+Math.cos(a)*(-i)+Math.cos(a+1.57)*i,py=y+Math.sin(a)*(-i)+Math.sin(a+1.57)*i,qx=x+Math.cos(a)*(-i)-Math.cos(a+1.57)*i,qy=y+Math.sin(a)*(-i)-Math.sin(a+1.57)*i;b.fillRect(R(px),R(py),1,1);b.fillRect(R(qx),R(qy),1,1);}}
function drawWarn(w){const k=1-w.t/w.max,blink=k>0.6&&Math.floor(G.time*16)%2;
 if(w.kind==='line'){b.save();b.translate(w.x,w.y);b.rotate(w.a);const h=w.w/2;
  b.globalAlpha=0.12;b.fillStyle=w.col;b.fillRect(0,-h,w.len,w.w);b.globalAlpha=0.55;b.fillStyle=dith(w.col,false);b.fillRect(0,-h,w.len,w.w);
  b.globalAlpha=0.6;b.fillStyle=dith(w.col,true);b.fillRect(0,-h,R(w.len*k),w.w);
  b.globalAlpha=blink?1:0.85;b.fillStyle=w.col;const off=Math.floor(G.time*24)%6;for(let x=-off;x<w.len;x+=6){if(x<0)continue;b.fillRect(x,R(-h),4,1);b.fillRect(x,R(h)-1,4,1);}
  b.restore();b.globalAlpha=0.9;const sp=(G.time*60)%24;for(let d=sp;d<w.len;d+=24)chev(w.x+Math.cos(w.a)*d,w.y+Math.sin(w.a)*d,w.a,'#fff6d0');
  if(w.src==='boss')emblem('boss',w.x+Math.cos(w.a)*14,w.y+Math.sin(w.a)*14-w.w/2-6,0.9);}
 else{const ry=w.r*0.75,l=lite(w.col);
  b.globalAlpha=0.1;b.fillStyle=w.col;b.beginPath();b.ellipse(w.x,w.y,w.r,ry,0,0,TAU);b.fill();b.globalAlpha=0.5;b.fillStyle=dith(w.col,false);b.fill();
  b.globalAlpha=0.7;b.fillStyle=dith(w.col,true);b.beginPath();b.ellipse(w.x,w.y,Math.max(0.5,w.r*k),Math.max(0.5,ry*k),0,0,TAU);b.fill();
  b.globalAlpha=blink?1:0.9;pxRing(w.x,w.y,w.r,ry,blink?'#fff6d0':w.col,-G.time*14,4,3);
  if(!w.friendly&&w.r>=10){b.globalAlpha=1;for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4,d=1+(1-k)*4;chev(w.x+Math.cos(a)*(w.r+d),w.y+Math.sin(a)*(ry+d),a+Math.PI,l);}}
  if(w.friendly){if(w.r>=14)emblem(w.src,w.x,w.y-ry,0.85);}else if(w.r>=14)emblem(w.src||'boss',w.x,w.y,0.9);
  if(w.friendly){b.globalAlpha=1;const fy=w.y-(1-k)*90;b.fillStyle='#fff6c0';b.fillRect(R(w.x-1),R(fy-1),3,3);b.fillStyle='#e0b048';b.fillRect(R(w.x),R(fy-6),1,5);}}
 b.globalAlpha=1;}
/* v17.5 성황당: 서낭나무(오색 천·금줄) + 돌무더기 + 장승 + 당 지기 할머니 */
function shrineStatic(g,x,y){
 g.fillStyle='rgba(224,176,72,0.14)';g.beginPath();g.ellipse(x,y,30,20,0,0,TAU);g.fill();
 g.fillStyle='#4a3020';g.fillRect(x+7,y-40,4,40);g.fillRect(x+3,y-30,5,2);g.fillRect(x+11,y-34,6,2);
 g.fillStyle='#1f4a34';for(const [ox,oy,r] of [[9,-44,10],[0,-40,7],[18,-40,7],[5,-50,6],[14,-50,6]]){g.beginPath();g.arc(x+ox,y+oy,r,0,TAU);g.fill();}
 g.fillStyle='#2f6b48';for(const [ox,oy,r] of [[7,-47,5],[15,-44,4],[2,-42,3]]){g.beginPath();g.arc(x+ox,y+oy,r,0,TAU);g.fill();}
 g.fillStyle='#c8a860';g.fillRect(x+6,y-22,6,1);
 g.fillStyle='#6a6458';for(const [ox,oy,r] of [[-6,0,5],[4,0,5],[-1,-5,5],[-3,-10,4],[1,-14,3]]){g.beginPath();g.arc(x-4+ox,y+oy,r,0,TAU);g.fill();}
 g.fillStyle='#8a8478';for(const [ox,oy] of [[-8,-2],[2,-3],[-3,-8],[0,-15]])g.fillRect(x-4+ox,y+oy,2,1);
 g.fillStyle='#7a5a3a';g.fillRect(x-24,y-20,5,20);g.fillStyle='#1a1418';g.fillRect(x-24,y-21,5,2);g.fillRect(x-23,y-16,1,1);g.fillRect(x-21,y-16,1,1);g.fillStyle='#c23b2a';g.fillRect(x-23,y-12,3,1);}
const guideCache=(w,h,fn)=>{let c=null;return ()=>{if(c)return c;c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');if(g)fn(g);return c;};};
const SHRINE_IMG=guideCache(64,64,g=>shrineStatic(g,32,62));   // 움직이지 않는 부분은 한 번만 그려 둔다(v17.5 그리기 시간)
function drawShrine(s){const x=R(s.x),y=R(s.y),t=LOW?0:G.time;b.drawImage(SHRINE_IMG(),x-32,y-62);
 const cl=['#3a6fd0','#d04030','#e0b048','#efe6d2','#3f9a5a'];
 for(let i=0;i<5;i++){const sw=Math.round(Math.sin(t*3+i));b.fillStyle=cl[i];b.fillRect(x+1+i*4+sw,y-34+(i%2)*2,2,7+(i%3)*2);}
 drawGuideNpc('shrine',x,y,s.say);
 if(s.prog>0){b.strokeStyle='#e0b048';b.lineWidth=2;b.beginPath();b.arc(x,y-6,18,-Math.PI/2,-Math.PI/2+TAU*s.prog/s.need);b.stroke();}}
/* 안내인 그리기: 자리·방향·배율은 GUIDE 표, 말풍선은 화면 글 대기열(BUBQ)로 */
function drawGuideNpc(kind,x,y,say,al=1){const g=GUIDE[kind],k=(g.sc||1)*entK(),spr=GNPC[g.npc],nx=x+g.at[0],ny=y+g.at[1];
 shadow(nx,ny,4*k);drawSpr(spr,nx,ny+(LOW?0:Math.round(Math.sin(G.time*3)*0.5)),g.face<0,false,k);
 if(say&&say.txt)BUBQ.push({x:nx-RCX,y:ny-spr.hgt*k-RCY,txt:say.txt,col:g.col,a:al});}
/* 괴이 둘레 금줄: 말뚝 넷, 새끼줄에 고추·숯·흰 종이 */
const ROPE_IMG=guideCache(40,28,g=>{const x=20,y=18,P=[[-18,-6],[18,-6],[18,8],[-18,8]];g.fillStyle='#4a3020';for(const [ox,oy] of P)g.fillRect(x+ox-1,y+oy-12,2,12);
 const it=['#c23b2a','#1a1418','#efe6d2'];
 for(let k=0;k<4;k++){const [ax,ay]=P[k],[bx,by]=P[(k+1)%4];for(let i=0;i<=12;i++){const u=i/12,px=Math.round(x+ax+(bx-ax)*u),py=Math.round(y+ay-10+(by-ay)*u+Math.sin(u*Math.PI)*2);g.fillStyle='#c8a860';g.fillRect(px,py,1,1);if(i%4===2){g.fillStyle=it[(k+i)%3];g.fillRect(px,py+1,1,2);}}}});
function anomRope(x,y){b.drawImage(ROPE_IMG(),x-20,y-18);}
function drawAnom(a){drawAnomBase(a);const x=R(a.x),y=R(a.y);anomRope(x,y);drawGuideNpc('anom',x,y,a.say);}
/* 샛길: 문 + 방망이 + 패랭이 쓴 길잡이 도깨비(푸른 기운) */
function drawDk(d){drawDkBase(d);const x=R(d.x),y=R(d.y);
 b.fillStyle='#6a4a2a';b.fillRect(x+12,y-14,3,14);b.fillStyle='#8a6a3a';b.fillRect(x+11,y-18,5,5);b.fillStyle='#4a3020';b.fillRect(x+12,y-17,1,1);b.fillRect(x+14,y-15,1,1);
 b.globalAlpha=LOW?0.3:0.35+Math.sin(G.time*4)*0.15;b.fillStyle='#5af0d0';b.beginPath();b.ellipse(x-22,y-8,9,13,0,0,TAU);b.fill();b.globalAlpha=1;
 drawGuideNpc('dk',x,y,d.say);}
/* 끝난 장소: 1.5초 동안 상징물과 안내인이 남아 마지막 말을 하고 흐려진다 */
function drawGuideGfx(){for(const g of G.gfx||[]){const al=Math.min(1,g.t/0.6),x=R(g.x),y=R(g.y);b.globalAlpha=al;
  if(g.kind==='shrine')drawShrine({x:g.x,y:g.y,prog:0,need:1,say:null});else if(g.kind==='anom')anomRope(x,y);
  b.globalAlpha=al;drawGuideNpc(g.kind,x,y,{txt:g.txt},al);b.globalAlpha=1;}}
/* 가장자리 표지: 상징물 아이콘 + 방향 꼬리(+ 말 한 줄). 화면 안이면 그리지 않는다 */
function edgeSign(kind,o,cx,cy){const sx=o.x-cx,sy=o.y-cy;if(sx>4&&sx<W-4&&sy>4&&sy<H-4)return;const a=Math.atan2(sy-H/2,sx-W/2);
 EDGEQ.push({x:clamp(W/2+Math.cos(a)*W,12,W-12),y:clamp(H/2+Math.sin(a)*H,22,H-12),a,kind,txt:o.edgeSay?o.edgeSay.txt:''});}
let GUIR=[];const BUBW=new Map();   // 마지막 장면의 말풍선·표지 사각형(화면 픽셀, 시험용)
function drawGuideUI(){GUIR=[];if(!BUBQ.length&&!EDGEQ.length)return;const k=S*DPR,fs=clamp(6.5*S,12,18)*DPR,u=fs/6.5,VW=W*k,VH=H*k;
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.font=`bold ${Math.round(fs)}px "Song Myung", serif`;ctx.textBaseline='middle';
 const P=G.P,px=(P.x-RCX)*k,py=(P.y-RCY)*k,hh=20*entK()*k,hw=8*entK()*k;
 for(const q of BUBQ){ctx.globalAlpha=q.a==null?1:q.a;const ck=q.txt+'|'+q.col+'|'+fs;let tw=BUBW.get(ck);if(tw==null){tw=ctx.measureText(q.txt).width;if(BUBW.size>80)BUBW.clear();BUBW.set(ck,tw);}const pw=Math.round(tw+8*u),ph=Math.round(fs+5*u);
  let bx=Math.round(clamp(q.x*k-pw/2,4*u,VW-pw-4*u)),by=Math.round(q.y*k-ph-5*u);
  if(bx<px+hw&&bx+pw>px-hw&&by<py&&by+ph>py-hh)by=Math.round(py-hh-ph-6*u);   // 퇴마사 머리와 겹치면 위로 비킴
  by=Math.round(clamp(by,4*u,VH-ph-4*u));const tx=Math.round(clamp(q.x*k,bx+3*u,bx+pw-3*u)),d=Math.max(1,Math.round(u));
  ctx.fillStyle='#0a080c';ctx.fillRect(bx-d,by-d,pw+2*d,ph+2*d);ctx.fillRect(tx-2*d,by+ph,4*d,2*d);ctx.fillRect(tx-d,by+ph+2*d,2*d,2*d);
  ctx.fillStyle=q.col;ctx.fillRect(bx,by,pw,ph);ctx.fillStyle='#f4ecd8';ctx.fillRect(bx+d,by+d,pw-2*d,ph-2*d);ctx.fillRect(tx-d,by+ph-d,2*d,2*d);
  ctx.fillStyle='#2a1a14';ctx.textAlign='center';ctx.fillText(q.txt,bx+pw/2,by+ph/2+d*0.5);GUIR.push({t:'b',x:bx,y:by,w:pw,h:ph});}
 ctx.globalAlpha=1;
 let hb=null;if(EDGEQ.length){const el=$('#hudbtns');if(el&&!el.hidden&&el.style.visibility!=='hidden'){const r=el.getBoundingClientRect(),cr=cvs.getBoundingClientRect();if(r.height)hb={top:(r.top-cr.top)*DPR-4*DPR};}}   // 오른쪽 아래 단추(신내림·소리·상태·정지) 위로 비킴
 for(const e of EDGEQ){const g=GUIDE[e.kind],sz=Math.round(clamp(16*S,28,44)*DPR),d=Math.max(1,Math.round(sz/16)),mg=sz/2+8*d,ex=clamp(e.x*k,mg,VW-mg);let ey=clamp(e.y*k,mg,VH-mg);if(hb&&ey+mg>hb.top)ey=hb.top-mg;const x=Math.round(ex-sz/2),y=Math.round(ey-sz/2);
  ctx.fillStyle='#0a080c';ctx.fillRect(x-d,y-d,sz+2*d,sz+2*d);ctx.fillStyle=g.col;ctx.fillRect(x,y,sz,sz);ctx.fillStyle='#1a1418';ctx.fillRect(x+d,y+d,sz-2*d,sz-2*d);
  const ic=Math.max(1,Math.floor((sz-4*d)/10));ctx.drawImage(GICON[e.kind],Math.round(ex-5*ic),Math.round(ey-5*ic),10*ic,10*ic);GUIR.push({t:'e',k:e.kind,x,y,w:sz,h:sz});
  const r=sz/2+3*d,hx=ex+Math.cos(e.a)*r,hy=ey+Math.sin(e.a)*r;ctx.fillStyle=g.col;ctx.beginPath();ctx.moveTo(hx+Math.cos(e.a)*4*d,hy+Math.sin(e.a)*4*d);ctx.lineTo(hx+Math.cos(e.a+2.3)*4*d,hy+Math.sin(e.a+2.3)*4*d);ctx.lineTo(hx+Math.cos(e.a-2.3)*4*d,hy+Math.sin(e.a-2.3)*4*d);ctx.fill();
  if(e.txt){const tw=ctx.measureText(e.txt).width,left=e.x>W/2;let tx=left?x-tw-10*d:x+sz+10*d;tx=clamp(tx,4*d,VW-tw-4*d);
   ctx.fillStyle='rgba(10,8,12,0.85)';ctx.fillRect(Math.round(tx-4*d),Math.round(ey-fs/2-2*d),Math.round(tw+8*d),Math.round(fs+4*d));ctx.fillStyle=g.col;ctx.textAlign='left';ctx.fillText(e.txt,tx,ey+d*0.5);}}
 ctx.restore();}
function drawImugi(e){for(let i=e.segs.length-1;i>=0;i--){const s=e.segs[i],r=Math.max(3,9-i*0.4);b.fillStyle=i%2?'#1d4d42':'#2f6b5a';b.beginPath();b.arc(R(s.x),R(s.y-4),r,0,TAU);b.fill();b.fillStyle='#a8c890';b.fillRect(R(s.x-1),R(s.y-4-r+1),2,1);}
 const x=R(e.x),y=R(e.y-5);b.fillStyle=e.flash>0?'#fff':'#2f7d6b';b.beginPath();b.arc(x,y,11,0,TAU);b.fill();b.fillStyle='#e0b048';b.fillRect(x-5,y-3,3,3);b.fillRect(x+2,y-3,3,3);b.fillStyle='#1a1418';b.fillRect(x-4,y-2,1,2);b.fillRect(x+3,y-2,1,2);b.fillStyle='#efe6d2';b.fillRect(x-6,y-12,2,4);b.fillRect(x+4,y-12,2,4);b.fillStyle='#c23b2a';b.fillRect(x-3,y+4,6,2);}
function drawEoduk(e){const r=R(e.sc*4.5),x=R(e.x),y=R(e.y-r);b.globalAlpha=0.92;b.fillStyle=e.flash>0?'#5a5060':'#0a0810';b.beginPath();b.arc(x,y,r,0,TAU);b.fill();
 b.strokeStyle='#5a3a7a';b.lineWidth=1;b.globalAlpha=0.5+Math.sin(G.time*5)*0.3;b.beginPath();b.arc(x,y,r+1+Math.sin(G.time*3)*1.5,0,TAU);b.stroke();b.globalAlpha=1;
 b.fillStyle='#e0b048';b.fillRect(x-R(r*0.4),y-2,3,2);b.fillRect(x+R(r*0.4)-2,y-2,3,2);}
function drawGeuseunde(e){const w=R(e.sc*5),h=R(e.sc*16),x=R(e.x),y=R(e.y);b.fillStyle=e.flash>0?'#4a4050':'#0c0810';b.beginPath();b.moveTo(x-w,y);
 for(let i=0;i<=8;i++){const yy=y-h*i/8;b.lineTo(x-w+Math.sin(G.time*3+i)*1.5*(i>0),yy);}b.arc(x,y-h,w,Math.PI,0);for(let i=8;i>=0;i--){b.lineTo(x+w+Math.sin(G.time*3+i+1)*1.5*(i>0),y-h*i/8);}b.fill();
 b.fillStyle='#ff4a3a';b.fillRect(x-R(w*0.45),y-h-1,2,2);b.fillRect(x+R(w*0.45)-1,y-h-1,2,2);}
function edgeArrow(tx,ty,cx,cy,c){const sx=tx-cx,sy=ty-cy;if(sx>4&&sx<W-4&&sy>4&&sy<H-4)return;const a=Math.atan2(sy-H/2,sx-W/2);const ex=clamp(W/2+Math.cos(a)*W,8,W-8),ey=clamp(H/2+Math.sin(a)*H,14,H-8);
 b.save();b.translate(R(ex),R(ey));b.rotate(a);b.fillStyle=c;b.beginPath();b.moveTo(5,0);b.lineTo(-3,-4);b.lineTo(-3,4);b.fill();b.restore();}

/* v16.2 내 효과 진하기: 내 효과를 그리는 동안에만 붓의 투명도에 진하기를 곱한다.
   (따로 그린 뒤 얹는 방식은 휴대폰에서 프레임마다 그리기가 멈춰 느려졌다) */
const ALPHA_D=typeof CanvasRenderingContext2D!=='undefined'&&Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'globalAlpha');
function fxLayer(draw){const A=meta.set.fxA;if(!(A<1)||!ALPHA_D){draw();return;}
 Object.defineProperty(b,'globalAlpha',{configurable:true,get(){return ALPHA_D.get.call(this)/A;},set(v){ALPHA_D.set.call(this,v*A);}});
 b.globalAlpha=1;
 try{draw();}finally{delete b.globalAlpha;ALPHA_D.set.call(b,1);}}
function drawNum(f,k){b.globalAlpha=clamp(k*2,0,1);b.font=(f.big?'10px':'8px')+' Silkscreen, monospace';b.textAlign='center';b.fillStyle='#000';b.fillText(f.v,R(f.x)+1,R(f.y)+1);b.fillStyle=f.crit?'#ff9a4a':(f.big?'#ffd76a':'#efe6d2');b.fillText(f.v,R(f.x),R(f.y));b.globalAlpha=1;}
function render(){
 if(!buf.width||!buf.height)return;
 {const hk=buf.width>W?2:1;b.setTransform(hk,0,0,hk,0,0);}   // v17.1 2배 정밀이면 게임 좌표를 2배로 그린다
 b.imageSmoothingEnabled=false;
 if(!G){drawTitleBg();blit();return;}
 const P=G.P;let cx=R(P.x-W/2),cy=R(P.y-H/2);if(G.shake>0&&meta.set.shake){cx+=R(rnd(-G.shake,G.shake));cy+=R(rnd(-G.shake,G.shake));}RCX=cx;RCY=cy;EMQ.length=0;BUBQ.length=0;EDGEQ.length=0;
 drawGround(cx,cy);b.save();b.translate(-cx,-cy);
 fxLayer(()=>{for(const z of G.zones)drawZone(z);
 for(const w of wAll())if(w.id==='bangul'&&w.R){w.pulse=(w.pulse||0)-0.016;b.globalAlpha=w.evo?0.85:0.55;pxRing(P.x,P.y-3,w.R,w.R*0.8,'#e0b048',G.time*8,5,3);if(w.pulse>0){b.globalAlpha=w.pulse*2*0.6;b.fillStyle=dith('#e0b048',true);b.beginPath();b.ellipse(P.x,P.y-3,w.R,w.R*0.8,0,0,TAU);b.fill();}b.globalAlpha=1;emblem('bangul',P.x+w.R*0.71,P.y-3-w.R*0.57,0.7);}});
 for(const z of G.ezones){const a=Math.min(1,z.life),c=z.col||'#7a3aa0',ry=z.r*0.75;b.globalAlpha=0.12*a;b.fillStyle=c;b.beginPath();b.ellipse(z.x,z.y,z.r,ry,0,0,TAU);b.fill();b.globalAlpha=0.75*a;b.fillStyle=dith(c,true);b.fill();
  b.globalAlpha=a;pxRing(z.x,z.y,z.r,ry,c,G.time*6,3,2);if(z.r>=12){for(let i=0;i<3;i++){const t=(G.time*0.9+i/3+z.x*0.01)%1;b.fillStyle=lite(c);b.fillRect(R(z.x+Math.cos(i*2.1+z.y)*z.r*0.5),R(z.y+Math.sin(i*2.1)*ry*0.5-t*5),1,1);}}if(z.r>=18)emblem('boss',z.x,z.y,a*0.8);b.globalAlpha=1;}
 for(const w of G.warns)drawWarn(w);
 if(G.shrine)drawShrine(G.shrine);
 if(G.anom)drawAnom(G.anom);
 if(G.trace)drawTrace(G.trace);
 if(G.mode==='tale'){const tr=taleRule();if(tr&&tr.draw)tr.draw(G.tale.R);}
 if(G.dk)drawDk(G.dk);drawGuideGfx();
 for(const g of G.gems){if(g.x<cx-4||g.x>cx+W+4||g.y<cy-4||g.y>cy+H+4)continue;const c=g.v<4?'#6fd3c1':g.v<15?'#7fb0ff':'#ff7a8a';const x=R(g.x),y=R(g.y);b.fillStyle=c;b.fillRect(x-1,y,3,1);b.fillRect(x,y-1,1,3);b.fillStyle='#fff';b.fillRect(x,y-1,1,1);}
 for(const it of G.items){if(it.x<cx-10||it.x>cx+W+10||it.y<cy-12||it.y>cy+H+10)continue;const s=ICS[it.k];const bob=R(Math.sin(G.time*4+it.x));if(it.k==='chest'){b.fillStyle='rgba(224,176,72,0.25)';b.fillRect(R(it.x-7),R(it.y-9+bob),14,12);}b.drawImage(s,R(it.x-4),R(it.y-8+bob));}
 // depth-sorted: obstacles, enemies, player
 drawObstacles(cx,cy);
 const vx0=cx-40,vx1=cx+W+40,vy0=cy-16,vy1=cy+H+60;
 if(!LOW){b.fillStyle='rgba(0,0,0,0.35)';b.beginPath();for(const e of G.enemies){if(e.hidden||e.x<vx0||e.x>vx1||e.y<vy0||e.y>vy1)continue;if(e.boss){const pk=EN[e.kind].proc;if(pk==='imugi'||pk==='eoduk'||pk==='geuseunde')continue;}const r=e.prop?4:e.r*entK(e);b.rect(R(e.x-r),R(e.y-1),R(r*2),2);}b.fill();}
 for(const e of G.enemies){if(e.hidden)continue;
  if(!e.boss&&(e.x<vx0||e.x>vx1||e.y<vy0||e.y>vy1))continue;
  if(e.prop){b.drawImage(e.flash>0?ICS.pot:ICS.pot,R(e.x-4),R(e.y-8));continue;}
  const pk=EN[e.kind].proc;
  if(pk==='imugi'&&e.boss){drawImugi(e);continue;}if(pk==='eoduk'&&e.boss){drawEoduk(e);continue;}if(pk==='geuseunde'&&e.boss){drawGeuseunde(e);continue;}
  const s=ESPR[e.spr]||ESPR[e.kind],esc=e.sc*entK(e);const flip=e.left?(e.vx>0):(e.vx<0);
  const bob=e.fly?Math.sin(e.bob)*1.5-2:(Math.sin(e.bob)>0?-1:0);
  if(e.boss&&e.act&&BSK[e.act].mv===0&&Math.floor(G.time*10)%2){b.fillStyle='rgba(255,60,40,0.35)';b.beginPath();b.ellipse(e.x,e.y,(e.r+4)*entK(e),(e.r+4)*0.5*entK(e),0,0,TAU);b.fill();}
  if(e.cs==='wind'&&Math.floor(G.time*12)%2){b.fillStyle='rgba(255,90,60,0.5)';b.fillRect(R(e.x-1),R(e.y-e.r*2*esc-5),2,3);}
  drawSpr(s,e.x,e.y+bob,flip,e.flash>0,esc,e.clone?0.55:(e.fly&&!e.boss&&EN[e.kind].t.startsWith('ghost')?0.85:1));
  if(e.frz>0){b.strokeStyle='rgba(143,211,255,0.8)';b.lineWidth=1;b.beginPath();b.ellipse(e.x,e.y,(e.r+1)*entK(e),(e.r+1)*0.45*entK(e),0,0,TAU);b.stroke();const tp=e.y-s.hgt*esc-2;b.fillStyle='#cfefff';b.fillRect(R(e.x-3),R(tp),1,1);b.fillRect(R(e.x+2),R(tp+1),1,1);b.fillRect(R(e.x),R(tp-1),1,1);}
  if(e.vr){const V=VARIANTS[e.vr];b.globalAlpha=0.9;pxRing(e.x,e.y,(e.r+2)*entK(e),(e.r+2)*0.45*entK(e),V.col,G.time*8,3,2);b.globalAlpha=1;}
  if(e.dotT>0){b.fillStyle=e.drain?'#ff5a5a':'#b07fd0';b.fillRect(R(e.x-1),R(e.y-s.hgt*esc-3),2,2);}
  if(e.mark>G.time){b.fillStyle='#ff5a3a';b.fillRect(R(e.x-2),R(e.y-s.hgt*esc-6),4,1);b.fillRect(R(e.x-1),R(e.y-s.hgt*esc-8),2,4);}
  if(e.elite){const w=16;b.fillStyle='#000';b.fillRect(R(e.x-w/2),R(e.y+2),w,2);b.fillStyle='#e0b048';b.fillRect(R(e.x-w/2),R(e.y+2),R(w*Math.max(0,e.hp/e.maxHp)),2);}}
 for(const s of G.spirits)drawSpirit(s);
 for(const m of G.movers)drawShip(m);
 drawPet();
 drawJW();
 drawSky();
 const hk=entK();shadow(P.x,P.y,5*hk);
 if(!LOW){const g=heroGlow(hk);b.drawImage(g,R(P.x-g.width/(2*GLOW_RES)),R(P.y-3*hk-g.height/(2*GLOW_RES)),g.width/GLOW_RES,g.height/GLOW_RES);}
 const look=playerLook(),ps=charSpr(look);const pb=P.moving&&Math.sin(G.time*14)>0?-1:0;
 if(look.aura){b.globalAlpha=0.25+Math.sin(G.time*3)*0.1;b.fillStyle=look.aura;b.beginPath();b.ellipse(P.x,P.y-7*hk,9*hk,10*hk,0,0,TAU);b.fill();b.globalAlpha=1;if(!LOW&&Math.random()<0.15)particle(P.x+rnd(-5,5)*hk,P.y-rnd(2,12)*hk,look.aura,1,8,0.6);}
 if(G.sky&&G.sky.t>0){const c=SKY[G.sky.k].rgb;b.strokeStyle=`rgba(${c},${0.35+Math.sin(G.time*5)*0.2})`;b.lineWidth=1;b.beginPath();b.ellipse(P.x,P.y+1,9*hk,3*hk,0,0,TAU);b.stroke();}
 if(G.guardT>0||G.seongT>0){b.globalAlpha=0.9;pxRing(P.x,P.y-6*hk,12*hk,13*hk,G.guardT>0?'#7fe0a0':'#d0c090',G.time*10,3,2);b.globalAlpha=1;}
 if(G.jwBuff>0){b.strokeStyle=`rgba(224,176,72,${0.4+Math.sin(G.time*8)*0.25})`;b.lineWidth=1;b.beginPath();b.ellipse(P.x,P.y-6*hk,11*hk,12*hk,0,0,TAU);b.stroke();}
 if(P.shieldCd&&P.shieldT<=0){b.strokeStyle='rgba(143,211,255,0.6)';b.lineWidth=1;b.beginPath();b.ellipse(P.x,P.y-6*hk,9*hk,10*hk,0,0,TAU);b.stroke();}
 fxLayer(()=>{
 for(const w of wAll()){
  if(w.pos&&w.pos.length)w.pos.forEach(([x,y,a],pi)=>{const X=R(x),Y=R(y);
   if(w.look==='blade'){b.strokeStyle='#dfe6f0';b.lineWidth=2;b.beginPath();b.moveTo(X-Math.cos(a+1.57)*6,Y-Math.sin(a+1.57)*6);b.lineTo(X+Math.cos(a+1.57)*6,Y+Math.sin(a+1.57)*6);b.stroke();b.fillStyle='#4a3a30';b.fillRect(X-1,Y-1,2,2);}
   else if(w.look==='law'){b.fillStyle='#efe6d2';b.fillRect(X-4,Y-5,8,10);b.fillStyle='#7a2018';b.fillRect(X-4,Y-5,8,1);b.fillRect(X-4,Y+4,8,1);b.font='bold 7px "Song Myung", serif';b.textAlign='center';b.fillStyle='#1a1418';b.fillText(LAW[pi%LAW.length],X,Y+2);}
   else if(w.look==='sun'){const sun=pi%2===0;b.fillStyle=sun?'#ff7a3a':'#e8ecf4';b.beginPath();b.arc(X,Y,5,0,TAU);b.fill();b.fillStyle=sun?'#ffd040':'#b0c0d8';b.beginPath();b.arc(X-1,Y-1,2.5,0,TAU);b.fill();}
   else{b.fillStyle='#e0b048';b.fillRect(X-2,Y-3,4,6);b.fillStyle='#c23b2a';b.fillRect(X-1,Y-2,2,1);b.fillRect(X,Y-1,1,3);b.fillRect(X-1,Y+1,2,1);}});
  if(w.beams)for(const [a,len] of w.beams){const c=w.look==='cloth'?'#efe6d2':(w.look==='sun'?'#ffe3a0':w.look==='note'?'#ffb0d0':'#bfe8ff');b.globalAlpha=0.55;b.strokeStyle=c;b.lineWidth=w.look==='cloth'?5:3;const r0=Math.min(10,len*0.5);b.beginPath();b.moveTo(P.x+Math.cos(a)*r0,P.y-3+Math.sin(a)*r0);
   if(w.look==='cloth'){for(let i=1;i<=8;i++){const t=i/8,d=r0+(len-r0)*t;b.lineTo(P.x+Math.cos(a)*d+Math.cos(a+1.57)*Math.sin(G.time*6+i)*2,P.y-3+Math.sin(a)*d+Math.sin(a+1.57)*Math.sin(G.time*6+i)*2);}}else b.lineTo(P.x+Math.cos(a)*len,P.y-3+Math.sin(a)*len);
   b.stroke();b.globalAlpha=1;b.strokeStyle='#ffffff';b.lineWidth=1;b.stroke();if(w.look!=='cloth'){b.fillStyle='#e0b048';b.fillRect(R(P.x+Math.cos(a)*r0-2),R(P.y-3+Math.sin(a)*r0-2),4,4);}}
  if(w.shields)for(const [x,y,a,r] of w.shields){b.save();b.translate(R(x),R(y));b.fillStyle='#b0702e';b.beginPath();b.ellipse(0,0,r*0.55,r*0.75,a,0,TAU);b.fill();b.strokeStyle=w.evo?'#8a8494':'#e0b048';b.lineWidth=1;b.stroke();b.fillStyle='#c23b2a';b.fillRect(-1,-1,2,2);b.restore();}}
 for(const p of G.projs){const x=R(p.x),y=R(p.y),a=Math.atan2(p.vy,p.vx);
  switch(p.kind){
   case 'ink':{const r=Math.max(2,R(p.r));b.fillStyle='#0a080c';b.beginPath();b.arc(x,y,r,0,TAU);b.fill();b.fillStyle='#3a3540';b.fillRect(x-1,y-1,1,1);break;}
   case 'needle':b.strokeStyle=p.purple?'#c080ff':'#dfe6f0';b.lineWidth=1;b.beginPath();b.moveTo(x-Math.cos(a)*4,y-Math.sin(a)*4);b.lineTo(x+Math.cos(a)*2,y+Math.sin(a)*2);b.stroke();break;
   case 'arrow':b.strokeStyle='#c9a06a';b.lineWidth=1;b.beginPath();b.moveTo(x-Math.cos(a)*6,y-Math.sin(a)*6);b.lineTo(x,y);b.stroke();b.fillStyle='#efe6d2';b.fillRect(x,y,1,1);break;
   case 'rocket':b.fillStyle='#ffb04a';b.fillRect(x-1,y-1,3,3);b.fillStyle='#fff3c0';b.fillRect(x,y,1,1);break;
   case 'ball':b.fillStyle='#1a1418';b.beginPath();b.arc(x,y,3,0,TAU);b.fill();b.fillStyle='#8a8494';b.fillRect(x-1,y-2,1,1);break;
   case 'boomer':{b.save();b.translate(x,y);b.rotate(p.spin||0);const s=R(p.r);if(p.bundle){b.fillStyle='#8a5a2b';b.fillRect(-s,-s*0.7,s*2,s*1.4);b.fillStyle='#c9a06a';b.fillRect(-1,-s*0.7,2,s*1.4);b.fillStyle='#4a3a30';b.fillRect(-2,-s*0.7-2,4,2);b.restore();break;}b.fillStyle='#2a2830';b.fillRect(-s,-s*0.6,s*2,s*1.2);b.fillStyle='#14121a';b.fillRect(-s+1,-s*0.6+1,s,s*1.2-2);b.restore();break;}
   case 'wind':b.globalAlpha=clamp(p.life*2,0,1);b.strokeStyle='#efe6d2';b.lineWidth=1;b.beginPath();b.arc(x-Math.cos(a)*p.r*0.5,y-Math.sin(a)*p.r*0.5,p.r,a-0.9,a+0.9);b.stroke();b.beginPath();b.arc(x-Math.cos(a)*p.r,y-Math.sin(a)*p.r,p.r,a-0.6,a+0.6);b.stroke();b.globalAlpha=1;break;
   case 'letter':b.save();b.translate(x,y);b.rotate(a);b.fillStyle=p.bill?'#f6e7b0':'#efe6d2';b.fillRect(-3,-2,6,4);b.fillStyle='#c23b2a';if(p.bill){b.fillRect(-2,-1,2,2);b.fillStyle='#9a6a10';b.fillRect(1,-1,2,1);}else b.fillRect(0,-1,1,2);b.restore();break;
   case 'yut':b.save();b.translate(x,y);b.rotate(a+G.time*12);b.fillStyle='#efe6d2';b.fillRect(-4,-1,8,2);b.fillStyle='#4a3a30';b.fillRect(-2,-1,1,1);b.fillRect(1,-1,1,1);b.restore();break;
   case 'jegi':{const bob=Math.round(Math.sin(G.time*20+x)*1);b.fillStyle='#e0b048';b.fillRect(x-1,y+bob,3,2);b.fillStyle='#c23b2a';b.fillRect(x-1,y-3+bob,1,3);b.fillStyle='#3a5f9e';b.fillRect(x,y-4+bob,1,4);b.fillStyle='#3f9a5a';b.fillRect(x+1,y-3+bob,1,3);break;}
   case 'bead':b.fillStyle='#4a2a18';b.fillRect(x-1,y-1,3,3);b.fillStyle='#c9a06a';b.fillRect(x,y-1,1,1);break;
   case 'coin':b.fillStyle='#e0b048';b.fillRect(x-2,y-1,5,3);b.fillRect(x-1,y-2,3,5);b.fillStyle='#4a3a10';b.fillRect(x,y,1,1);break;
   case 'jtal':b.save();b.translate(x,y);b.rotate(a);b.fillStyle='#e0b048';b.fillRect(-3,-2,6,4);b.fillStyle='#c23b2a';b.fillRect(-1,-1,3,1);b.fillRect(0,0,1,1);b.restore();break;
   case 'note':b.fillStyle='#ffb0d0';b.fillRect(x-2,y,3,2);b.fillRect(x,y-4,1,4);b.fillRect(x+1,y-4,2,1);break;
   case 'cup':b.fillStyle='#8a8494';b.fillRect(x-2,y-2,4,4);b.fillStyle='#c23b2a';b.fillRect(x-1,y,2,1);break;
   case 'blade':{b.save();b.translate(x,y);b.rotate(p.spin||0);const s=R(p.r);b.fillStyle='#dfe6f0';b.fillRect(-s,-1,s*2,2);b.fillStyle='#4a3a30';b.fillRect(-1,-s*0.6,2,s*1.2);b.restore();break;}
   case 'pill':b.fillStyle=p.boom?'#e0b048':'#8a5a2b';b.beginPath();b.arc(x,y,2.5,0,TAU);b.fill();b.fillStyle='#fff3c0';b.fillRect(x-1,y-1,1,1);break;
   case 'knife':b.save();b.translate(x,y);b.rotate(a);b.fillStyle='#dfe6f0';b.fillRect(-1,-1,6,2);b.fillStyle='#c23b2a';b.fillRect(-3,-1,2,2);b.restore();break;
   case 'bomb':b.fillStyle='#2a2830';b.beginPath();b.arc(x,y,3,0,TAU);b.fill();if(p.fuse>=0&&Math.floor(G.time*12)%2){b.fillStyle='#ffd040';b.fillRect(x+1,y-4,2,2);}if(p.fuse>=0){b.globalAlpha=0.25;b.strokeStyle='#ff6a3a';b.beginPath();b.ellipse(x,y,p.br,p.br*0.75,0,0,TAU);b.stroke();b.globalAlpha=1;}break;}}
 });
 drawHeroBody();
 fxLayer(()=>{for(const f of G.fx){if(f.t==='num')continue;const k=f.max?f.life/f.max:1;
  if(f.t==='p'){b.globalAlpha=clamp(k,0,1);b.fillStyle=f.col;b.fillRect(R(f.x),R(f.y),1,1);b.globalAlpha=1;}
  else if(f.t==='num')drawNum(f,k);
  else if(f.t==='slash'){if(f.life>f.max)continue;b.globalAlpha=clamp(k,0,1);b.strokeStyle=f.col||'#efe6d2';b.lineWidth=3;b.beginPath();b.arc(f.x,f.y-3,f.r*0.8,f.a-f.half,f.a+f.half);b.stroke();b.strokeStyle='#c23b2a';b.lineWidth=1;b.beginPath();b.arc(f.x,f.y-3,f.r*0.95,f.a-f.half*0.8,f.a+f.half*0.8);b.stroke();b.globalAlpha=1;}
  else if(f.t==='ring'){const r=Math.max(0.5,f.r+(f.maxR-f.r)*(1-k));b.globalAlpha=clamp(k,0,1);b.strokeStyle=f.col;b.lineWidth=2;b.beginPath();b.ellipse(f.x,f.y,r,r*0.8,0,0,TAU);b.stroke();b.globalAlpha=1;}
  else if(f.t==='wave'){if(f.r<=3)continue;b.strokeStyle=f.col||'#c23b2a';b.globalAlpha=0.8;b.lineWidth=3;b.beginPath();b.ellipse(f.x,f.y,f.r,f.r*0.8,0,0,TAU);b.stroke();b.strokeStyle='rgba(224,176,72,0.9)';b.lineWidth=1;b.beginPath();b.ellipse(f.x,f.y,f.r-3,(f.r-3)*0.8,0,0,TAU);b.stroke();b.globalAlpha=1;}
  else if(f.t==='bolt'){b.globalAlpha=clamp(k,0,1);b.strokeStyle=f.col||'#fff6c0';b.lineWidth=2;b.beginPath();let x=f.x,y=f.y-H;b.moveTo(x,y);let sd=f.seed;while(y<f.y){y+=8;sd=(sd*9301+49297)%233280;x+=(sd/233280-0.5)*10;b.lineTo(x,Math.min(y,f.y));}b.stroke();b.fillStyle='rgba(255,246,192,0.5)';b.beginPath();b.ellipse(f.x,f.y,8,6,0,0,TAU);b.fill();b.globalAlpha=1;}
  else if(f.t==='chain'){b.globalAlpha=clamp(k,0,1);b.strokeStyle=f.col;b.lineWidth=2;b.beginPath();f.pts.forEach((p,i)=>i?b.lineTo(p[0],p[1]):b.moveTo(p[0],p[1]));b.stroke();b.strokeStyle='#ffd0c0';b.lineWidth=1;b.stroke();b.globalAlpha=1;}
  else if(f.t==='beam'){b.save();b.translate(f.x,f.y);b.rotate(f.a);b.globalAlpha=clamp(k,0,1)*0.6;b.fillStyle=f.col;b.fillRect(0,-f.w/2,f.len,f.w);b.globalAlpha=clamp(k,0,1);b.fillStyle=f.col==='#1a1418'?'#3a3540':'#fff';b.fillRect(0,-1,f.len,2);b.restore();b.globalAlpha=1;}
  else if(f.t==='glyph'){b.font=(f.big?'bold 16px':'bold 13px')+' "Song Myung", serif';b.textAlign='center';b.fillStyle='rgba(0,0,0,0.3)';b.fillRect(R(f.x-3),R(f.y),6,2);b.fillStyle='#0a080c';b.fillText(f.ch,R(f.x)+1,R(f.y-f.h)+1);b.fillStyle=f.big?'#ffd76a':'#efe6d2';b.fillText(f.ch,R(f.x),R(f.y-f.h));}}});
 for(const f of G.fx)if(f.t==='num')drawNum(f,f.max?f.life/f.max:1);
 /* v16.2 요괴 탄은 내 효과 위에, 언제나 또렷하게 */
 for(const q of G.ebul){const x=R(q.x),y=R(q.y);b.fillStyle=q.col||'#ff5a8a';b.fillRect(x-2,y-1,4,2);b.fillRect(x-1,y-2,2,4);b.fillStyle='#fff';b.fillRect(x,y-1,1,1);}
 drawHpBar();
 if(window.__occ)window.__occ(cx,cy);
 b.restore();
 if(vig.width&&vig.height)b.drawImage(vig,0,0);
 if(G.dark>0){const px=P.x-cx,py=P.y-cy-6,g=b.createRadialGradient(px,py,22,px,py,64);g.addColorStop(0,'rgba(4,2,8,0)');g.addColorStop(1,`rgba(4,2,8,${Math.min(0.96,G.dark*0.5)})`);b.fillStyle=g;b.fillRect(0,0,W,H);}
 if(G.shrine)edgeSign('shrine',G.shrine,cx,cy);
 if(G.anom)edgeSign('anom',G.anom,cx,cy);
 if(G.trace)edgeArrow(G.trace.x,G.trace.y,cx,cy,'#ffe08a');
 if(G.mode==='tale'){const tr=taleRule(),tg=tr&&tr.goal&&tr.goal(G.tale.R);if(tg)edgeArrow(tg.x,tg.y,cx,cy,'#ffe08a');}
 if(G.dk)edgeSign('dk',G.dk,cx,cy);
 const bt=G.boss||G.mid;if(bt&&!bt.hidden)edgeArrow(bt.x,bt.y,cx,cy,'#ff5a3a');
 if(G.flash){b.fillStyle=`rgba(${G.flash.c},${Math.min(0.6,G.flash.t)})`;b.fillRect(0,0,W,H);}
 if(P.hp/P.maxHp<0.3){b.fillStyle=`rgba(160,20,10,${0.12+Math.sin(G.time*6)*0.06})`;b.fillRect(0,0,W,H);}
 if(G.pull){b.fillStyle='rgba(255,90,170,0.08)';b.fillRect(0,0,W,H);}
 blit();drawEmblems();drawGuideUI();
 if(joy&&joy.active&&!modal&&meta.set.joy){ctx.save();ctx.scale(DPR,DPR);ctx.strokeStyle='rgba(239,230,210,0.35)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(joy.ox,joy.oy,36,0,TAU);ctx.stroke();const dx=joy.x-joy.ox,dy=joy.y-joy.oy,d=Math.hypot(dx,dy),m=Math.min(d,36)/(d||1);ctx.fillStyle='rgba(239,230,210,0.35)';ctx.beginPath();ctx.arc(joy.ox+dx*m,joy.oy+dy*m,14,0,TAU);ctx.fill();ctx.restore();}
}
let titleT=0;
function drawTitleBg(){titleT+=0.016;b.fillStyle='#15121a';b.fillRect(0,0,W,H);
 for(let i=0;i<40;i++){const x=(hash(i,1)*W+titleT*6*(0.3+hash(i,2)))%W,y=(hash(i,3)*H+Math.sin(titleT+i)*4);b.fillStyle=i%3?'rgba(143,211,255,0.5)':'rgba(224,176,72,0.5)';b.fillRect(R(x),R(y),1,1);}
 b.fillStyle='#0d0b10';b.beginPath();b.moveTo(0,H);for(let x=0;x<=W;x+=8)b.lineTo(x,H*0.72+Math.sin(x*0.03)*10+Math.sin(x*0.011)*14);b.lineTo(W,H);b.fill();}
function blit(){if(!buf.width||!buf.height||!cvs.width||!cvs.height)return;ctx.imageSmoothingEnabled=false;ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(buf,0,0,buf.width,buf.height,0,0,W*S*DPR,H*S*DPR);}

function hud(){const P=G.P;$('#xpfill').style.width=clamp(P.xp/P.next,0,1)*100+'%';$('#lvl').textContent='LV '+P.lvl;
 const rem=G.bossDone?0:Math.max(0,STAGE_T-G.st);$('#clock').textContent=G.boss?'BOSS':G.mode==='rush'?_t("원정 {p}/{length}",{p:G.stage+1,length:STAGES.length}):G.mode==='tale'?taleClock():(G.st>=STAGE_T&&G.mid?'MID':fmtT(rem));
 {const cb=$('#callBtn'),k=callGod();cb.style.setProperty('--p',Math.floor(G.call));cb.classList.toggle('ready',G.call>=100);cb.title=_t("신내림 · {n} (Space)",{n:CALL[k].n});}
 $('#stats').innerHTML=_t("처치 {kills}<br><span class=\"c\">엽전 {coins}</span><br>전우치 {p}{p2}{p3}{p4}{p5}{p6}{p7}",{kills:G.kills,coins:G.coins,p:G.helper?_t("출현"):(G.jw.cd50>0?Math.ceil(G.jw.cd50)+'s':_t("대기")),p2:G.sky&&G.sky.t>0?`<br><span style="color:${SKY[G.sky.k].col}">${SKY[G.sky.k].n}·${G.sky.n} ${Math.ceil(G.sky.t)}s</span>`:'',p3:G.path?_t("<br><span style=\"color:{p}\">길 끝: {s}{p2}</span>",{p:G.path.hard?'#ff8a6a':'#9af0b0',s:PATHS[G.path.id].s,p2:G.path.hard?' ×2':''}):'',p4:G.q?_t("<br><span style=\"color:{p}\">의뢰 {n} {p2}</span>",{p:G.q.done?'#9af0b0':'#efe6d2',n:QUESTS[G.q.id].n,p2:G.q.done?_t("완료"):questProg()+'/'+G.q.need}):'',p5:G.cb.n>=10?_t("<br><span style=\"color:{p}\">연격 {n}</span>",{p:['#efe6d2','#ffd080','#ffb060','#ff8a6a','#ff5a8a'][cbTier()],n:G.cb.n}):'',p6:G.dkC?_t("<br><span style=\"color:#5af0d0\">짐 {n}</span>",{n:DKC[G.dkC].n}):'',p7:G.guardT>0?_t("<br>철갑 {p}s",{p:Math.ceil(G.guardT)}):G.seongT>0?_t("<br>수호 {p}s",{p:Math.ceil(G.seongT)}):G.callBuff>0?_t("<br>청룡 {p}s",{p:Math.ceil(G.callBuff)}):''});
 const bt=G.boss||G.mid,bb=$('#bossbar');
 if(bt){bb.hidden=false;bb.classList.toggle('mid',!!bt.mid);const a=bt.act;$('#bossname').textContent=EN[bt.bossKind].n+(a?` · ${BSK[a].label}`:'');
  const marks=bt.ults.map(u=>`<s style="left:${u*100}%"></s>`).join('');const box=$('#bossbb');if(box.dataset.m!==marks){box.dataset.m=marks;box.innerHTML='<i id="bossfill"></i>'+marks;}
  $('#bossfill').style.width=clamp(bt.hp/bt.maxHp,0,1)*100+'%';}
 else bb.hidden=true;}

function toast(t,cls=''){const d=document.createElement('div');d.textContent=t;d.className=cls;const box=$('#toast');box.innerHTML='';box.appendChild(d);}
function toastBig(sub,main){const d=document.createElement('div');d.className='ult';d.style.color='#e0b048';d.innerHTML=`<small>${sub}</small>${main}`;const box=$('#toast');box.innerHTML='';box.appendChild(d);}
function toastUlt(who,name){const d=document.createElement('div');d.className='ult';d.innerHTML=_t("<small>{who}의 필살기</small>{name}",{who:who,name:name});const box=$('#toast');box.innerHTML='';box.appendChild(d);}

/* v16.3 보상 창 순서: 전직이 대기 중이면 쌓인 레벨업 카드보다 먼저 연다.
   (늦게 열리면 「10레벨인데 전직 창이 안 뜬다」로 보이고, 5차 전직이 레벨 54를 넘기면 오의 각성이 일반 레벨업으로 바뀌어 사라졌다) */
function takeQueued(){const i=G.P.tier<5?G.queue.indexOf('adv'):-1;return i>=0?G.queue.splice(i,1)[0]:G.queue.shift();}
let last=performance.now(),hudT=0;
let pm={acc:0,n:0,slow:0},fpsV=60,errN=0;
function perfWatch(raw){fpsV+=((raw>0?1000/raw:60)-fpsV)*0.05;
 if(meta.set.perf!=='auto'||autoLow||!G||G.over||modal||document.hidden||raw>250)return;
 pm.acc+=raw;pm.n++;if(pm.acc>=1000){const avg=pm.acc/pm.n;pm.acc=0;pm.n=0;pm.slow=avg>24?pm.slow+1:0;
  if(pm.slow>=3&&hdOn()){entOff=true;pm.slow=0;resize();toast(_t("화면이 느려져 캐릭터·요괴 크기를 기본으로 돌렸다 (설정에서 변경)"));return;}   // v17.1 먼저 2배 정밀을 끈다
  if(pm.slow>=3){autoLow=true;applyPerf();resize();while(G.fx.length>CAP.p)G.fx.shift();toast(_t("화면이 느려져 절약 모드로 바꿨다 (설정에서 변경)"));}}}
function drawFps(){if(!meta.set.fps)return;ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.font='12px monospace';ctx.textAlign='left';ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(4,innerHeight-22,96,18);ctx.fillStyle=fpsV<40?'#ff8a6a':'#9af0b0';ctx.fillText(`${Math.round(fpsV)} FPS${LOW?_t(" · 절약"):''}`,8,innerHeight-9);ctx.restore();}
function frame(now){const raw=now-last;const dt=Math.min(0.05,raw/1000);last=now;
 try{
  if(G&&!G.over&&!modal){update(dt);
   if(!modal&&G.queue.length&&!G.over&&G.clearT===undefined){const q=takeQueued();if(q==='adv'&&G.P.tier<5)openAdv();else if(q==='bless')openBless();else if(q==='awk'&&G.P.tier>=5&&G.awkN<5)openAwk();else if(q==='ult'&&G.P.tier>=5&&G.awkN>=4&&!G.ult)openUlt();else if(q==='seal')openSeal();else if(q==='temper')openTemper();else openLevel();}}
  if(!document.hidden){render();drawFps();}
  if(G){hudT-=dt;if(hudT<=0){hudT=0.1;hud();}}
  perfWatch(raw);
 }catch(e){diagErr(_t("오류"),e);if(errN++<5)console.warn('frame error',e);}
 try{diagWatch(raw);}catch(_){}
 finally{requestAnimationFrame(frame);}}
document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden&&DIAG.hb){DIAG.hb.hidden=true;diagSave();}pm.acc=0;pm.n=0;pm.slow=0;if(document.hidden&&G&&!G.over&&!modal)openPause();if(!document.hidden)resumeAudio();});
/* 조합 시험장: 진화 무기마다 쓸 수 있는 퇴마사 하나(전용 무기는 그 퇴마사, 공용은 짝 보패를 받을 수 있는 첫 퇴마사) */
function labList(){const out=[];for(const wid in WD){const d=WD[wid];if(!d.evo||d.type!=='w')continue;const p=PD[d.evo];
  const cid=d.job||Object.keys(CHARS).find(c=>!p.job||jobHas(p,c))||'seonbi';out.push({wid,pid:d.evo,cid});}return out;}
function labStart(wid,mode){const it=labList().find(x=>x.wid===wid);if(!it)return;const d=WD[wid];
 newGame(it.cid,null,0,'normal');G.lab=true;G.queue.length=0;G.mods.dmgIn=0;
 G.weapons=[];G.passives={};addWeapon(wid);const w=G.weapons[0];
 if(mode==='card'){w.lv=d.max-1;recompute();refreshSlots();
  const other=Object.keys(PD).find(id=>id!==it.pid&&jobOk(PD[id]));
  curOpts=[decorate({k:'pnew',id:it.pid}),decorate({k:'wup',id:wid}),...(other?[decorate({k:'pnew',id:other})]:[])];banMode=false;renderLevel();show('levelup');return;}
 w.lv=d.max;G.passives[it.pid]=1;recompute();refreshSlots();dropItem('chest',G.P.x+28,G.P.y);toast(_t("옆의 보물상자를 주우세요 → ")+d.evoName);}
function openLab(){const box=$('#labList');box.innerHTML='';
 for(const it of labList()){const d=WD[it.wid],row=document.createElement('div');row.className='labrow';
  row.innerHTML=_t("<span class=\"ep own\"><img src=\"{p}\" alt=\"\">{name}</span> + <span class=\"ep own\"><img src=\"{p2}\" alt=\"\">{name2}</span> → <b>{evoName}</b> <small>{name3}</small><span class=\"lb2\"><button class=\"btn sm\" data-m=\"evo\">상자 진화</button><button class=\"btn ghost sm\" data-m=\"card\">카드 보기</button></span>",{p:ICON[it.wid],name:d.name,p2:ICON[it.pid],name2:PD[it.pid].name,evoName:d.evoName,name3:CHARS[it.cid].name});
  for(const b of row.querySelectorAll('button'))b.onclick=()=>labStart(it.wid,b.dataset.m);
  box.appendChild(row);}
 show('lab');}
if(LAB){$('#labBtn').hidden=false;$('#labBtn').onclick=openLab;$('#labBack').onclick=()=>{renderTitle();show('title');};}
function start(){{const l=detectLang();setLang(l==='zh'&&!LANG_ZH_PUBLIC?'ko':l,false);}   // v18.0: 간체 사전이 채워질 때까지는 한국어
 renderTitle();if(LAB)openLab();else show('title');requestAnimationFrame(frame);}
window.claude?.hot?.ready?window.claude.hot.ready(start):start();
