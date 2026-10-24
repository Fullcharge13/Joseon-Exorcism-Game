/* ======================= world helpers ======================= */
const CELL=24;const grid=new Map();
function buildGrid(){grid.clear();for(const e of G.enemies){if(e.dead||e.inv)continue;const k=Math.floor(e.x/CELL)*100003+Math.floor(e.y/CELL);let a=grid.get(k);if(!a){a=[];grid.set(k,a);}a.push(e);}}
function near(x,y,r,out){out.length=0;const m=r+20;const x0=Math.floor((x-m)/CELL),x1=Math.floor((x+m)/CELL),y0=Math.floor((y-m)/CELL),y1=Math.floor((y+m)/CELL);
 for(let cx=x0;cx<=x1;cx++)for(let cy=y0;cy<=y1;cy++){const a=grid.get(cx*100003+cy);if(!a)continue;for(const e of a){if(e.dead)continue;const dx=e.x-x,dy=e.y-y,rr=r+e.r;if(dx*dx+dy*dy<rr*rr)out.push(e);}}return out;}
const dist2=(a,b2)=>(a.x-b2.x)**2+(a.y-b2.y)**2;
function nearest(x,y,maxD){let best=null,bd=maxD*maxD;for(const e of G.enemies){if(e.dead||e.inv||e.prop)continue;const d=(e.x-x)**2+(e.y-y)**2;if(d<bd){bd=d;best=e;}}return best;}
function inView(e,m=6){const P=G.P;return Math.abs(e.x-P.x)<W/2+m&&Math.abs(e.y-P.y)<H/2+m;}
function randomEnemy(range){const P=G.P,rx=range||W/2,ry=range||H/2;const l=[];for(const e of G.enemies){if(!e.dead&&!e.inv&&!e.prop&&Math.abs(e.x-P.x)<rx&&Math.abs(e.y-P.y)<ry)l.push(e);}return l.length?l[Math.random()*l.length|0]:null;}
function shoot(x,y,a,spd,kind,dmg,pierce,life,r=2,extra){const p={x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,a,kind,dmg,pierce,life,r,hit:new Set(),kb:12,src:CUR_SRC};if(extra)Object.assign(p,extra);G.projs.push(p);return p;}
function particle(x,y,c,n=1,sp=40,life=0.4){for(let i=0;i<n&&G.fx.length<CAP.p;i++){const a=Math.random()*TAU,s=rnd(sp*0.3,sp);G.fx.push({t:'p',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,col:c,life:rnd(life*0.5,life),max:life});}}
function aoe(x,y,r,dmg,kb){for(const e of near(x,y,r,TMP2).slice())hurt(e,dmg,kb,x,y);}
function slash(x,y,a,rng,dmg,half,delay,c){G.fx.push({t:'slash',x,y,a,r:rng,life:0.18+delay,max:0.18,delay,half,col:c});
 for(const e of near(x,y,rng,TMP2).slice()){let da=Math.atan2(e.y-y,e.x-x)-a;da=Math.atan2(Math.sin(da),Math.cos(da));if(Math.abs(da)<half+0.2)hurt(e,dmg,40,x,y);}
 snd(320,0.05,'triangle',0.03);}
function hurt(e,dmg,kb=0,fx=0,fy=0,noCrit){
 if(e.dead||e.inv)return;const P=G.P;let crit=false;
 if(e.prop){kill(e);return;}
 if(duoOn('sancheon')&&P.hp>=P.maxHp*0.8)dmg*=1.25;
 if(!noCrit&&(Math.random()<P.crit||(e.frz>0&&duoOn('chilyong')))){dmg*=P.critDmg;crit=true;}
 if(e.mark>G.time)dmg*=1.5;
 dmg=Math.max(1,Math.round(dmg*rnd(0.9,1.1)));if(e.boss&&!e.prop){const cap=e.maxHp*(e.mid?MID_CAP:BOSS_CAP);if(G.time-(e.capT??-9)>=1){e.capT=G.time;e.capD=0;}dmg=Math.max(0,Math.min(dmg,cap-e.capD));e.capD+=dmg;if(dmg<=0){e.flash=0.04;return;}}
 if(!e.boss)G.dpsAcc=(G.dpsAcc||0)+Math.min(dmg,Math.max(0,e.hp));{const hs=HSRC||CUR_SRC;if(hs&&G.rs){const D=G.rs.dmg||(G.rs.dmg={});D[hs]=(D[hs]||0)+Math.min(dmg,Math.max(0,e.hp));const tm=G.tmOf&&G.tmOf[hs];if(tm&&!noCrit&&!G._dg)temperHit(tm,e,dmg);}}e.hp-=dmg;e.flash=0.08;
 if(kb&&!e.boss){const dx=e.x-fx,dy=e.y-fy,d=Math.hypot(dx,dy)||1,m=e.heavy?0.25:(e.elite?0.15:1);e.kx+=dx/d*kb*m;e.ky+=dy/d*kb*m;}
 if(!noCrit){if(P.frzCh&&!e.boss&&Math.random()<P.frzCh)e.frz=Math.max(e.frz,0.7);if(P.burnCh&&Math.random()<P.burnCh){e.dotSrc=HSRC||CUR_SRC||e.dotSrc,e.dot=Math.max(e.dot||0,8*P.might);e.dotT=2.5;}}
 if(meta.set.nums&&G.fx.length<CAP.n)G.fx.push({t:'num',x:e.x+rnd(-2,2),y:e.y-e.r-2,v:dmg,life:0.5,max:0.5,big:crit||dmg>=80,crit});
 const now=performance.now();if(now-lastHit>45){lastHit=now;snd(520+Math.random()*200,0.03,'square',0.015);}
 if(!noCrit&&!G._dg&&duoOn('yongho')&&Math.random()<0.08){G._dg=1;bolt(e.x,e.y,14,(20+15*G.stage)*P.might);G._dg=0;}
 if(e.hp<=0&&!e.dead)kill(e);}
const ITEM_CAP=300;
function dropItem(k,x,y){if(k==='tteok'&&G.mods.noTteok)return;   // 떡이 없는 설화 막: 처치·신내림·쌍신 어느 길로도 떡을 떨어뜨리지 않는다
 G.items.push({k,x,y});if(G.items.length>ITEM_CAP){const i=G.items.findIndex(it=>it.k!=='chest');if(i>=0)G.items.splice(i,1);}}
function kill(e){e.dead=true;
 if(e.prop){G.rs.pots++;particle(e.x,e.y,'#b0702e',8,50,0.4);snd(300,0.08,'square',0.03);const r=Math.random();
  if(r<0.35&&!G.mods.noTteok)dropItem('tteok',e.x,e.y);else if(r<0.7){for(let i=0;i<3;i++)dropItem('coin',e.x+rnd(-4,4),e.y+rnd(-3,3));}else if(r<0.82)dropItem('pouch',e.x,e.y);else G.gems.push({x:e.x,y:e.y,v:10+G.stage*6,mag:false});return;}
 G.kills++;G.rs.kills++;cbKill();if(!EN[e.kind].tale){const sn=G.rs.seen[e.kind]||(G.rs.seen[e.kind]={s:1,k:0});sn.k++;}
 particle(e.x,e.y,e.kind==='gwihwa'?'#8fd3ff':'#efe6d2',5,50,0.35);
 if(e.clone)return;
 addCall(e.boss?(e.mid?25:40):e.elite?6:0.25);
 if(!G._dg){if(duoOn('maenghwa')&&e.dotT>0){G._dg=1;const pv=CUR_SRC;CUR_SRC=null;aoe(e.x,e.y,22,(20+15*G.stage)*G.P.might,40);particle(e.x,e.y,'#ff7a3a',8,50,0.4);CUR_SRC=pv;G._dg=0;}
  if(duoOn('bukhae')&&e.frz>0){for(const o of near(e.x,e.y,26,TMP2).slice())if(!o.boss)o.frz=Math.max(o.frz,1.2);particle(e.x,e.y,'#cfefff',8,50,0.4);}}
 if(e.vr){G.rs.variants=(G.rs.variants||0)+1;
  if(e.vr==='split'){for(let i=0;i<2;i++){const c=spawnEnemy(e.kind,e.x+rnd(-6,6),e.y+rnd(-6,6),{novr:1});c.hp=c.maxHp=e.maxHp*0.35;c.sc=(c.sc||1)*0.8;}}
  if(e.vr==='venom')G.ezones.push({x:e.x,y:e.y,r:14,life:3,max:3,dmg:4+G.stage*2,col:'#7fe07f'});}
 if(e.boss){bossDown(e);return;}
 if(e.elite){G.rs.elites++;dropItem('chest',e.x,e.y);}
 if(e.ai==='split'){for(let i=0;i<2;i++)spawnEnemy('hwangchung',e.x+rnd(-6,6),e.y+rnd(-6,6));}
 if(e.ai==='explode'){const nb=G.stage===8?4:6;for(let i=0;i<nb;i++)ebul(e.x,e.y,i/nb*TAU+Math.random(),45,{dmg:e.dmg*(G.stage===8?0.5:0.7),col:'#c080ff'});}
 if(G.jinogwi&&Math.random()<G.jinogwi.ch)G.spirits.push({own:'temp',src:'jinogwi',look:'soul',x:e.x,y:e.y,ph:0,id:Math.random(),dmg:G.jinogwi.dmg,sp:130,life:G.jinogwi.life});
 G.gems.push({x:e.x,y:e.y,v:e.xp,mag:false});
 if(G.mode==='tale'){const tr=taleRule();if(tr&&tr.kill)tr.kill(G.tale.R,e);}
 const r=Math.random()/G.P.drop;if(r<0.025)dropItem('coin',e.x+2,e.y);else if(r<0.031&&!G.mods.noTteok)dropItem('tteok',e.x,e.y);else if(r<0.0328)dropItem('pouch',e.x,e.y);}
function explode(p){aoe(p.x,p.y,p.br,p.dmg,30);G.fx.push({t:'ring',x:p.x,y:p.y,r:3,maxR:p.br,col:'#ff9a4a',life:0.25,max:0.25});particle(p.x,p.y,'#ffb04a',8,70,0.4);G.shake=Math.max(G.shake,1);snd(110,0.12,'sawtooth',0.03);}
function warn(o){G.warns.push(Object.assign({max:o.t,col:'#ff3a2a',src:CUR_SRC},o));}

/* --- terrain: solid obstacles per stage (deterministic), breakable 옹기, shrine --- */
const OT=40;
function obstAt(tx,ty){if(Math.abs(tx)<=1&&Math.abs(ty)<=1)return null;const h=hash(tx*3+7,ty*5-11);if(h<0.86)return null;
 const h2=hash(tx-91,ty+33);return {x:tx*OT+8+h2*24,y:ty*OT+8+hash(tx+5,ty+9)*24,r:6+h2*6};}
function pushOut(o,r){const tx=Math.floor(o.x/OT),ty=Math.floor(o.y/OT);
 for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const ob=obstAt(tx+i,ty+j);if(!ob)continue;const dx=o.x-ob.x,dy=o.y-ob.y,d=Math.hypot(dx,dy)||0.01,ov=ob.r+r-d;if(ov>0){o.x+=dx/d*ov;o.y+=dy/d*ov;}}}
function spawnPot(){const P=G.P,a=Math.random()*TAU,d=rnd(70,130);const x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d*0.8;
 G.enemies.push({kind:'pot',prop:true,x,y,hp:1,maxHp:1,r:4,spd:0,dmg:0,kx:0,ky:0,hc:{},flash:0,slow:0,frz:0,dot:0,dotT:0,dotTick:0,vx:0,bob:0,sc:1});}
function spawnShrine(){const P=G.P,a=Math.random()*TAU,d=rnd(120,150);G.shrine={x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d*0.8,prog:0,need:G.ks==='ocheon'?2.1:3.5};toast(_t("어디선가 성황당의 방울 소리가 들린다"));guideSay('shrine',G.shrine,'appear');}

/* ======================= spawning ======================= */
/* 지금 막의 모습(배경·요괴 종류). 설화 출정은 막의 세기(G.stage)와 모습(G.tale.st)을 따로 둔다 */
/* 결과·상태 창의 「막」 칸: 설화 출정은 설화의 막(『전우치전』 3막), 본편은 제n막(바퀴) */
function stageLabel(){if(G.mode==='tale'&&G.tale)return _t("『{n}』 {p}막",{n:TALES[G.tale.id].n,p:G.tale.act+1});return `${curStg().sub}${G.loop?_t(" · {p}바퀴",{p:G.loop+1}):''}`;}
function curStg(){return STAGES[G.mode==='tale'&&G.tale?G.tale.st:G.stage];}
function stageHpF(s){return 1+s+HP_MID_K*Math.pow(Math.max(0,s-2),2);}
const HP_MID_K=0.15;
function spawnEnemy(id,x,y,opt={}){
 const d=EN[id],s=G.stage,hpm=stageHpF(s)*(1+Math.min(G.st,STAGE_T*1.5)/STAGE_T*0.6)*G.mods.eHp*(G.path&&G.path.hard?1.3:1);
 if(x===undefined){const a=Math.random()*TAU,R0=Math.hypot(W/2,H/2)+16;x=G.P.x+Math.cos(a)*R0;y=G.P.y+Math.sin(a)*R0;}
 const base=d.c==='n'?d:{...ELITE_BASE,...d};
 const e={kind:id,x,y,hp:base.hp*hpm,maxHp:base.hp*hpm,spd:(base.spd||24)*rnd(0.9,1.1)*(1+s*0.05)*G.mods.eSpd,dmg:(base.dmg||12)*(1+s*0.3),r:base.r||5,xp:Math.ceil((base.xp||3)*(1+s*0.3)),
  heavy:d.heavy,ai:d.ai,fly:d.fly,kx:0,ky:0,flash:0,hc:{},slow:0,frz:0,vx:0,bob:Math.random()*TAU,sc:d.sc||1,spr:id,dot:0,dotT:0,dotTick:0,left:LEFT_FACING.has(d.t)};
 Object.assign(e,opt);G.enemies.push(e);
 if(d.c==='n'&&!e.boss&&!e.prop&&!e.clone&&!opt.novr)maybeVariant(e);
 if(!G.rs.seen[id]&&!EN[id].tale)G.rs.seen[id]={s:1,k:0};return e;}
function spawnElite(){const id=curStg().elite;const e=spawnEnemy(id);e.elite=true;e.hp=e.maxHp=e.maxHp*10;e.et=2;toast(_t("엘리트 {n} 출현",{n:EN[id].n}),'red');}

/* ======================= bosses ======================= */
const BOSS={
 jwclone:{skills:['blink','foxOrbs','ring'],ults:[{n:'분신술',sk:'clones'}]},
 yagwang:{skills:['shoeSteal','ring','blink'],ult:'ring2'},
 jangsan:{skills:['charm','dash3'],ult:'dash3'},
 geumdwaeji:{skills:['charge','summon'],minion:'sikingyeon',ult:'charge'},
 geodaeha:{skills:['tailFan','pillars'],ult:'pillars'},
 yeommae:{skills:['foxOrbs','fog'],ult:'foxOrbs'},
 yeoksin:{skills:['plague','ring'],ult:'plague'},
 baekdusan:{skills:['slam','hail'],ult:'hail'},
 bulgae:{skills:['charge','fireTrail'],ult:'fireTrail'},
 jigwi:{skills:['fireTrail','ring2'],ult:'fireTrail'},
 jangjamari:{skills:['maskSpin','gate'],minion:'mongdal',ult:'maskSpin'},
 dokchief:{skills:['slam','ring','summon','charge'],minion:'dokkaebi',ults:[{n:'금 나와라 뚝딱!',sk:'goldRain'}]},
 gumiho:{skills:['foxOrbs','dash3','tailFan','charm'],ults:[{n:'천년 환영',sk:'clones'}]},
 gangcheol:{skills:['charge','hail','ring','stormTrail'],ults:[{n:'우박 폭풍',sk:'hailStorm'}]},
 imugi:{skills:['spiral','coil','pillars','fog'],ults:[{n:'승천',sk:'ascend'}]},
 eoduk:{skills:['blink','foxOrbs','ring2','summon'],minion:'dalgyal',ults:[{n:'칠흑',sk:'blackout'}]},
 bulgasari:{skills:['spikes','charge','slam','eat'],ults:[{n:'쇠 삼키기',sk:'ironFeast'}]},
 jiha:{skills:['heads','summon','slam','ring'],minion:'baekduyacha',ults:[{n:'아홉 머리',sk:'nineHeads'}]},
 samdu:{skills:['dive','feather','tailFan','foxOrbs'],ults:[{n:'세 머리 급강하',sk:'tripleDive'}]},
 saja:{skills:['ledger','gate','blink','ring2'],minion:'jibak',ults:[{n:'명부 집행',sk:'judgement'}]},
 geuseunde:{skills:['shadowWall','ledger','gate','grow'],minion:'kkeomeok',ults:[{n:'그림자 장막',sk:'eclipse'},{n:'칠흑',sk:'blackout'}],thr:[0.7,0.4,0.15]},
};
const BORROW=['slam','ring','charge','foxOrbs','dash3','tailFan','spiral','pillars','fog','ledger','blink','ring2','hail','stormTrail','plague','fireTrail','maskSpin','spikes','heads','feather','shadowWall','shoeSteal','charm'];
const bdmg=()=>(14+G.stage*6)*G.mods.eBul;
function ebul(x,y,a,sp,extra){G.ebul.push(Object.assign({x,y,vx:Math.cos(a)*sp*G.mods.eBul,vy:Math.sin(a)*sp*G.mods.eBul,r:3,life:5,dmg:(8+G.stage*3.5)*G.mods.eBul},extra||{}));}
function ringB(e,n,sp,off=0,gap){for(let i=0;i<n;i++){const a=i/n*TAU+off;if(gap!==undefined&&Math.abs(Math.atan2(Math.sin(a-gap),Math.cos(a-gap)))<0.55)continue;ebul(e.x,e.y-6,a,sp);}}
const angTo=(a,b2)=>Math.atan2(b2.y-a.y,b2.x-a.x);
function summonRing(c,kind,n,R0=26){for(let i=0;i<n;i++){const a=i/n*TAU;spawnEnemy(kind,c.x+Math.cos(a)*R0,c.y+Math.sin(a)*R0*0.8);}}
function eatProj(e,R0){for(const p of G.projs){if((p.x-e.x)**2+(p.y-e.y)**2<R0*R0){p.dead=true;particle(p.x,p.y,'#8a8494',1,20);}}}
function chaseTick(e,dt,sp){const P=G.P,a=angTo(e,P);e.x+=Math.cos(a)*sp*dt;e.y+=Math.sin(a)*sp*dt;e.vx=Math.cos(a);}
const BSK={
 slam:{label:'내려찍기',start(e){e.k=3;e.kt=0;},tick(e,dt){e.kt-=dt;if(e.kt<=0&&e.k>0){warn({x:G.P.x,y:G.P.y,r:26,t:0.85,dmg:bdmg(),fx:'slam'});e.k--;e.kt=0.6;}return e.k<=0&&e.kt<-0.9;},mv:0.4},
 ring:{label:'원한 산탄',start(e){e.k=3;e.kt=0;},tick(e,dt){e.kt-=dt;if(e.kt<=0&&e.k>0){ringB(e,14,72,e.k*0.22);e.k--;e.kt=0.45;}return e.k<=0&&e.kt<0;},mv:0.6},
 summon:{label:'졸개 부르기',start(e){summonRing(e,e.def.minion||'dokkaebi',8);particle(e.x,e.y,'#3f9a5a',16,70,0.5);e.k=0.8;},tick(e,dt){return (e.k-=dt)<=0;},mv:0},
 charge:{label:'돌진',start(e){e.k=0.75;e.ph=0;e.da=angTo(e,G.P);warn({kind:'line',x:e.x,y:e.y,a:e.da,len:170,w:20,t:0.75,dmg:0});},
  tick(e,dt){e.k-=dt;if(e.ph===0&&e.k<=0){e.ph=1;e.k=0.5;}if(e.ph===1){e.x+=Math.cos(e.da)*320*dt;e.y+=Math.sin(e.da)*320*dt;e.vx=Math.cos(e.da);if(Math.random()<0.5)particle(e.x,e.y,'#b0702e',1,20);if(e.k<=0)return true;}return false;},mv:0},
 goldRain:{label:'금 나와라 뚝딱!',start(e){e.k=3.6;e.kt=0;summonRing(e,'dokkaebi',8);},tick(e,dt){e.k-=dt;e.kt-=dt;if(e.kt<=0){e.kt=0.11;warn({x:G.P.x+rnd(-W/2+10,W/2-10),y:G.P.y+rnd(-H/2+10,H/2-10),r:15,t:0.8,dmg:bdmg(),col:'#ffd040',fx:'gold'});}return e.k<=0;},mv:0.3},
 foxOrbs:{label:'원혼 구슬',start(e){for(let i=0;i<6;i++)ebul(e.x,e.y-6,i/6*TAU,50,{hom:1,life:5,col:'#ffb0d8',r:4});e.k=1;},tick(e,dt){return (e.k-=dt)<=0;},mv:0.5},
 dash3:{label:'삼연 질주',start(e){e.k=3;e.ph=0;e.mt=0;},tick(e,dt){e.mt-=dt;
   if(e.ph===0&&e.mt<=0){if(e.k<=0)return true;e.da=angTo(e,G.P);warn({kind:'line',x:e.x,y:e.y,a:e.da,len:120,w:16,t:0.45,dmg:0});e.ph=1;e.mt=0.45;}
   else if(e.ph===1&&e.mt<=0){e.ph=2;e.mt=0.35;}
   else if(e.ph===2){e.x+=Math.cos(e.da)*300*dt;e.y+=Math.sin(e.da)*300*dt;e.vx=Math.cos(e.da);if(e.mt<=0){e.ph=0;e.mt=0.15;e.k--;}}return false;},mv:0},
 tailFan:{label:'부채꼴 탄',start(e){e.k=3;e.kt=0;},tick(e,dt){e.kt-=dt;if(e.kt<=0&&e.k>0){const a=angTo(e,G.P);for(let i=0;i<9;i++)ebul(e.x,e.y-6,a+(i-4)*0.13,88);e.k--;e.kt=0.35;}return e.k<=0&&e.kt<0;},mv:0.3},
 charm:{label:'홀림',start(e){e.k=1.8;G.pull={src:e,spd:46};toast(_t("홀린다! 반대쪽으로 달아나세요"),'red');},tick(e,dt){e.k-=dt;if(Math.random()<0.3)particle(G.P.x,G.P.y-8,'#ff7ab0',1,15);if(e.k<=0){G.pull=null;ringB(e,12,70);return true;}return false;},mv:0},
 clones:{label:'천년 환영',start(e){e.k=2;e.kt=0;},tick(e,dt){e.kt-=dt;if(e.kt<=0&&e.k>0){const P=G.P,n=8,o=Math.random();for(let i=0;i<n;i++){const a=(i+o)/n*TAU;const c=spawnEnemy('baekyeou',P.x+Math.cos(a)*95,P.y+Math.sin(a)*75,{clone:true,spr:e.spr,sc:2,r:7,mode:'tele',mt:0.9});c.hp=c.maxHp=40+G.stage*30;c.dmg=bdmg();}e.k--;e.kt=2.2;}return e.k<=0&&e.kt<0;},mv:0},
 spiral:{label:'물줄기 소용돌이',start(e){e.k=2.4;e.kt=0;e.sa=Math.random()*TAU;},tick(e,dt){e.k-=dt;e.kt-=dt;if(e.kt<=0){e.kt=0.09;e.sa+=0.42;for(let j=0;j<2;j++)ebul(e.x,e.y-5,e.sa+j*Math.PI,75,{col:'#7fc0ff'});}return e.k<=0;},mv:0.2},
 coil:{label:'휘감기',start(e){e.k=2.6;e.ca=angTo(G.P,e);e.kt=0;},tick(e,dt){e.k-=dt;e.ca+=2.2*dt;const R0=45+55*Math.max(0,e.k/2.6),P=G.P;e.x=P.x+Math.cos(e.ca)*R0;e.y=P.y+Math.sin(e.ca)*R0*0.8;e.kt-=dt;if(e.kt<=0){e.kt=0.3;ebul(e.x,e.y-5,angTo(e,P),80,{col:'#7fc0ff'});}return e.k<=0;},mv:0},
 pillars:{label:'물기둥',start(e){const P=G.P;warn({x:P.x,y:P.y,r:18,t:1.1,dmg:bdmg(),col:'#3a8aff'});for(let i=0;i<6;i++){const a=i/6*TAU+Math.random();warn({x:P.x+Math.cos(a)*42,y:P.y+Math.sin(a)*32,r:18,t:1.1+i*0.08,dmg:bdmg(),col:'#3a8aff'});}e.k=1.6;},tick(e,dt){return (e.k-=dt)<=0;},mv:0.3},
 fog:{label:'독안개',start(e){const P=G.P;for(let i=0;i<3;i++)G.ezones.push({x:P.x+rnd(-50,50),y:P.y+rnd(-40,40),r:26,life:6,max:6,dmg:6+G.stage*3,col:'#7a3aa0'});e.k=0.8;},tick(e,dt){return (e.k-=dt)<=0;},mv:0.5},
 ascend:{label:'승천',start(e){e.inv=true;e.hidden=true;e.k=3.4;e.kt=0;e.ph=0;flash('20,40,80',0.6);},tick(e,dt){e.k-=dt;e.kt-=dt;const P=G.P;
   if(e.ph===0){if(e.kt<=0){e.kt=0.09;warn({x:P.x+rnd(-W/2+8,W/2-8),y:P.y+rnd(-H/2+8,H/2-8),r:12,t:0.7,dmg:bdmg(),col:'#bfe0ff',fx:'bolt'});}if(e.k<=0){e.ph=1;e.k=1.3;e.lx=P.x;e.ly=P.y;warn({x:P.x,y:P.y,r:42,t:1.3,dmg:bdmg()*1.6,fx:'slam'});}}
   else if(e.k<=0){e.inv=false;e.hidden=false;e.x=e.lx;e.y=e.ly-4;if(e.segs)for(const s of e.segs){s.x=e.x;s.y=e.y;}ringB(e,16,80);return true;}return false;},mv:0},
 ledger:{label:'명부 낙인',start(e){e.k=4;e.kt=0;},tick(e,dt){e.kt-=dt;if(e.kt<=0&&e.k>0){const P=G.P,a=Math.random()*Math.PI;warn({kind:'line',x:P.x-Math.cos(a)*200,y:P.y-Math.sin(a)*200,a,len:400,w:12,t:1.0,dmg:bdmg(),col:'#b070ff'});e.k--;e.kt=0.22;}return e.k<=0&&e.kt<-1;},mv:0.3},
 gate:{label:'저승 문',start(e){summonRing(G.P,e.def.minion||'songaksi',10,90);toast(_t("문이 열리고 넋이 쏟아진다"),'red');e.k=1;},tick(e,dt){return (e.k-=dt)<=0;},mv:0.4},
 blink:{label:'그림자 걸음',start(e){e.k=3;e.kt=0;},tick(e,dt){e.kt-=dt;if(e.kt<=0&&e.k>0){const P=G.P;particle(e.x,e.y-8,'#4a4552',10,50);e.x=P.x-P.dirx*48;e.y=P.y-P.diry*40;particle(e.x,e.y-8,'#4a4552',10,50);ringB(e,10,70,Math.random());e.k--;e.kt=0.75;}return e.k<=0&&e.kt<0;},mv:0},
 ring2:{label:'혼불 고리',start(e){e.k=3;e.kt=0;e.sa=0;},tick(e,dt){e.kt-=dt;if(e.kt<=0&&e.k>0){e.sa+=0.12;ringB(e,16,64,e.sa);e.k--;e.kt=0.4;}return e.k<=0&&e.kt<0;},mv:0.5},
 judgement:{label:'명부 집행',start(e){e.k=4.5;e.kt=0;e.sa=0;G.pull={src:e,spd:22};flash('0,0,0',0.6);},tick(e,dt){e.k-=dt;e.kt-=dt;if(e.kt<=0){e.kt=0.08;e.sa+=0.21;for(let j=0;j<4;j++)ebul(e.x,e.y-6,e.sa+j*Math.PI/2,68,{col:'#b070ff'});}if(e.k<=0){G.pull=null;return true;}return false;},mv:0},
 shoeSteal:{label:'신발 훔치기',start(e){G.P.slowT=3;toast(_t("신발을 빼앗겼다! 걸음이 느려진다"),'red');ringB(e,10,60);e.k=0.8;},tick(e,dt){return (e.k-=dt)<=0;},mv:0.5},
 hail:{label:'우박',start(e){e.k=2.4;e.kt=0;},tick(e,dt){e.k-=dt;e.kt-=dt;if(e.kt<=0){e.kt=0.12;const P=G.P;warn({x:P.x+rnd(-70,70),y:P.y+rnd(-55,55),r:11,t:0.75,dmg:bdmg()*0.7,col:'#bfe0ff'});}return e.k<=0;},mv:0.5},
 hailStorm:{label:'우박 폭풍',start(e){e.k=4.5;e.kt=0;const a=Math.random()*TAU;G.wind={x:Math.cos(a)*38,y:Math.sin(a)*38,t:4.5};flash('180,200,230',0.4);},tick(e,dt){e.k-=dt;e.kt-=dt;if(e.kt<=0){e.kt=0.06;const P=G.P;warn({x:P.x+rnd(-W/2+6,W/2-6),y:P.y+rnd(-H/2+6,H/2-6),r:12,t:0.75,dmg:bdmg()*0.8,col:'#bfe0ff'});}return e.k<=0;},mv:0.3},
 stormTrail:{label:'번개 질주',start(e){e.k=0.55;e.ph=0;e.da=angTo(e,G.P);warn({kind:'line',x:e.x,y:e.y,a:e.da,len:190,w:18,t:0.55,dmg:0,col:'#ffe060'});e.dt2=0;},
  tick(e,dt){e.k-=dt;if(e.ph===0&&e.k<=0){e.ph=1;e.k=0.6;}if(e.ph===1){e.x+=Math.cos(e.da)*300*dt;e.y+=Math.sin(e.da)*300*dt;e.vx=Math.cos(e.da);e.dt2-=dt;if(e.dt2<=0){e.dt2=0.06;G.ezones.push({x:e.x,y:e.y,r:10,life:2.5,max:2.5,dmg:6+G.stage*3,col:'#ffe060'});}if(e.k<=0)return true;}return false;},mv:0},
 plague:{label:'돌림병',start(e){const P=G.P;for(let i=0;i<6;i++){const a=i/6*TAU+Math.random();G.ezones.push({x:P.x+Math.cos(a)*55,y:P.y+Math.sin(a)*42,r:18,life:5,max:5,dmg:6+G.stage*3,col:'#7fa040'});}G.ezones.push({x:P.x,y:P.y,r:14,life:5,max:5,dmg:6+G.stage*3,col:'#7fa040'});e.k=1;},tick(e,dt){return (e.k-=dt)<=0;},mv:0.5},
 fireTrail:{label:'불길 질주',start(e){e.k=2.2;e.dt2=0;},tick(e,dt){e.k-=dt;chaseTick(e,dt,105);e.dt2-=dt;if(e.dt2<=0){e.dt2=0.1;G.ezones.push({x:e.x,y:e.y,r:9,life:3,max:3,dmg:6+G.stage*3,col:'#ff6a3a'});}return e.k<=0;},mv:0},
 maskSpin:{label:'탈춤',start(e){e.k=2.6;e.kt=0;e.sa=0;},tick(e,dt){e.k-=dt;e.kt-=dt;if(e.kt<=0){e.kt=0.1;e.sa+=0.3;for(let j=0;j<3;j++)ebul(e.x,e.y-6,e.sa+j*TAU/3,70,{col:'#e0b048'});}return e.k<=0;},mv:0.2},
 blackout:{label:'칠흑',start(e){G.dark=6;e.k=2;e.kt=0;e.sc=Math.min(4.6,e.sc+0.5);e.r=Math.min(22,e.r+2);ringB(e,18,60);toast(_t("빛이 사라진다"),'red');},tick(e,dt){e.k-=dt;e.kt-=dt;if(e.kt<=0){e.kt=0.6;summonRing(G.P,e.def.minion||'dalgyal',3,80);}return e.k<=0;},mv:0.5},
 spikes:{label:'쇠가시',start(e){e.k=3;e.kt=0;},tick(e,dt){e.kt-=dt;if(e.kt<=0&&e.k>0){const a=angTo(e,G.P);for(let i=0;i<7;i++)ebul(e.x,e.y-6,a+(i-3)*0.16,130,{col:'#c0c0d0',r:2.5});e.k--;e.kt=0.3;}return e.k<=0&&e.kt<0;},mv:0.3},
 eat:{label:'쇠 먹기',start(e){e.k=1.6;G.pull={src:e,spd:50};toast(_t("불가사리가 쇠붙이를 빨아들인다"),'red');},tick(e,dt){e.k-=dt;eatProj(e,40);if(e.k<=0){G.pull=null;return true;}return false;},mv:0},
 ironFeast:{label:'쇠 삼키기',start(e){e.k=4;e.kt=0;G.pull={src:e,spd:35};},tick(e,dt){e.k-=dt;e.kt-=dt;eatProj(e,55);if(e.kt<=0){e.kt=0.5;ringB(e,12,70,Math.random());e.sc=Math.min(4.2,e.sc+0.05);}if(e.k<=0){G.pull=null;return true;}return false;},mv:0},
 heads:{label:'세 머리 숨결',start(e){e.k=3;e.kt=0;},tick(e,dt){e.kt-=dt;if(e.kt<=0&&e.k>0){for(const ox of [-16,0,16]){const sx=e.x+ox,sy=e.y-24,a=Math.atan2(G.P.y-sy,G.P.x-sx);for(let i=0;i<5;i++)ebul(sx,sy,a+(i-2)*0.15,85);}e.k--;e.kt=0.5;}return e.k<=0&&e.kt<0;},mv:0.3},
 nineHeads:{label:'아홉 머리',start(e){e.k=4;e.kt=0;e.sa=0;},tick(e,dt){e.k-=dt;e.kt-=dt;if(e.kt<=0){e.kt=0.15;e.sa+=0.17;for(let i=0;i<9;i++)ebul(e.x,e.y-20,e.sa+i/9*TAU,70);}return e.k<=0;},mv:0},
 dive:{label:'급강하',start(e){e.ph=0;e.k=0.7;e.da=angTo(e,G.P);warn({kind:'line',x:e.x,y:e.y,a:e.da,len:300,w:18,t:0.7,dmg:0});},tick(e,dt){e.k-=dt;if(e.ph===0&&e.k<=0){e.ph=1;e.k=0.75;}if(e.ph===1){e.x+=Math.cos(e.da)*400*dt;e.y+=Math.sin(e.da)*400*dt;e.vx=Math.cos(e.da);if(e.k<=0)return true;}return false;},mv:0},
 tripleDive:{label:'세 머리 급강하',start(e){e.n=3;e.ph=2;e.k=0;},tick(e,dt){e.k-=dt;const P=G.P;
   if(e.ph===2&&e.k<=0){if(e.n<=0)return true;e.n--;const a=Math.random()*TAU;e.x=P.x+Math.cos(a)*130;e.y=P.y+Math.sin(a)*100;e.da=angTo(e,P);warn({kind:'line',x:e.x,y:e.y,a:e.da,len:300,w:22,t:0.6,dmg:0});e.ph=0;e.k=0.6;for(let i=0;i<8;i++)ebul(e.x,e.y,i/8*TAU,55,{col:'#c9a06a'});}
   else if(e.ph===0&&e.k<=0){e.ph=1;e.k=0.75;}else if(e.ph===1){e.x+=Math.cos(e.da)*420*dt;e.y+=Math.sin(e.da)*420*dt;e.vx=Math.cos(e.da);if(e.k<=0){e.ph=2;e.k=0.3;}}return false;},mv:0},
 feather:{label:'깃털 화살',start(e){e.k=3;e.kt=0;},tick(e,dt){e.kt-=dt;if(e.kt<=0&&e.k>0){const a=angTo(e,G.P);for(let i=0;i<11;i++)ebul(e.x,e.y-6,a+(i-5)*0.14,65,{col:'#c9a06a'});e.k--;e.kt=0.4;}return e.k<=0&&e.kt<0;},mv:0.3},
 shadowWall:{label:'그림자 고리',start(e){e.k=3;e.kt=0;},tick(e,dt){e.kt-=dt;if(e.kt<=0&&e.k>0){ringB(e,30,50,Math.random(),Math.random()*TAU);e.k--;e.kt=0.7;}return e.k<=0&&e.kt<0;},mv:0.3},
 grow:{label:'커지기',start(e){e.sc=Math.min(4.6,e.sc+0.3);e.r=Math.min(22,e.r+1.5);summonRing(e,e.def.minion||'kkeomeok',5);e.k=0.8;flash('0,0,0',0.25);},tick(e,dt){return (e.k-=dt)<=0;},mv:0},
 eclipse:{label:'그림자 장막',start(e){G.dark=5;e.k=4;e.kt=0;toast(_t("그림자가 하늘을 덮는다"),'red');},tick(e,dt){e.k-=dt;e.kt-=dt;if(e.kt<=0){e.kt=0.8;ringB(e,32,58,Math.random(),Math.random()*TAU);const P=G.P,a=Math.random()*Math.PI;warn({kind:'line',x:P.x-Math.cos(a)*200,y:P.y-Math.sin(a)*200,a,len:400,w:12,t:1.0,dmg:bdmg(),col:'#b070ff'});}return e.k<=0;},mv:0.2},
};
/* 플레이어 힘(최근 20초 동안 준 피해의 초당 값)에 맞춘 보스 체력 */
const BOSS_MAXX=4,BOSS_T=40,BOSS_T_MID=18,BOSS_K=0.06,BOSS_CAP=0.06,MID_CAP=0.1;
function playerDps(){const a=G.dpsBuf;if(!a||!a.length)return 0;return a.reduce((x,y)=>x+y,0)/a.length;}
function updDps(dt){G.dpsT=(G.dpsT||0)+dt;if(G.dpsT>=1){G.dpsT-=1;const b=G.dpsBuf||(G.dpsBuf=[]);b.push(G.dpsAcc||0);G.dpsAcc=0;if(b.length>20)b.shift();}}
function spawnBoss(id,isMid){const s=curStg(),D=BOSS[id],E=EN[id];const a=Math.random()*TAU,R0=Math.hypot(W/2,H/2)+10;
 const baseHp=BOSS_HP[G.stage]*(isMid?0.32:1)*G.mods.bossHp*G.mods.eHp;const hp=Math.max(baseHp,Math.min(baseHp*BOSS_MAXX,playerDps()*(isMid?BOSS_T_MID:BOSS_T)*BOSS_K*G.mods.bossHp*(G.mods.eHp>1?Math.sqrt(G.mods.eHp):1)));
 let ults=[];if(!isMid){ults=(D.thr||[0.6,0.25]).slice();if(G.mods.extraUlt)ults.unshift(0.85);}else if(G.mods.midUlt)ults=[0.5];
 const e=spawnEnemy(id,G.P.x+Math.cos(a)*R0,G.P.y+Math.sin(a)*R0,{boss:true,mid:isMid,bossKind:id,def:D,sc:isMid?2.2:3,r:isMid?11:14,spd:(isMid?28:24)+G.stage*2.5,dmg:(15+G.stage*6)*(isMid?0.8:1),cd:2.2,act:null,last:null,ults,ultI:0});
 e.hp=e.maxHp=hp;e.ai=null;e.fly=1;
 e.skills=D.skills.slice();e.si=0;if(G.mods.borrow){const pool=BORROW.filter(k=>!e.skills.includes(k));for(let i=0;i<G.mods.borrow&&pool.length;i++)e.skills.push(pool.splice(Math.random()*pool.length|0,1)[0]);}
 if(id==='imugi'){e.segs=[];for(let i=0;i<14;i++)e.segs.push({x:e.x,y:e.y});e.spd=40;e.r=12;}
 if(id==='gumiho'||id==='jangsan')e.spd+=10;
 if(id==='eoduk'){e.sc=2.5;e.r=11;} if(id==='geuseunde'){e.sc=2.6;}
 if(isMid)G.mid=e;else G.boss=e;
 if(isMid&&G.mods.eliteWithMid)spawnElite();
 toast(`${isMid?_t("중간 보스"):_t("막 보스")} · ${E.n}`,'big red');snd(80,0.6,'sawtooth',0.06);}
const bnm=e=>e.taleN||EN[e.bossKind].n;
function bossAI(e,dt){const D=e.def;
 if(e.ults.length&&e.hp/e.maxHp<=e.ults[0]&&!e.ulting){e.ults.shift();G.pull=null;if(e.inv){e.inv=false;e.hidden=false;}
  let sk,name;if(D.ults){const u=D.ults[e.ultI%D.ults.length];e.ultI++;sk=u.sk;name=u.n;}else{sk=D.ult;name=BSK[sk].label;}
  e.act=sk;e.ulting=true;BSK[sk].start(e);toastUlt(bnm(e),name);if(!G.flash)flash('120,0,0',0.4);snd(60,0.8,'sawtooth',0.07);return;}
 if(e.act){if(BSK[e.act].tick(e,dt)){e.last=e.act;e.act=null;e.ulting=false;e.cd=Math.max(0.8,2.0-G.stage*0.12)*rnd(0.8,1.2)*(e.mid?1.3:1)*G.mods.bossCd;}return;}
 e.cd-=dt;if(e.cd<=0){if(G.mods.bossOrder){e.act=e.skills[e.si++%e.skills.length];}else{const opts=e.skills.filter(s=>s!==e.last);e.act=opts[Math.random()*opts.length|0];}BSK[e.act].start(e);}}
function bossDown(e){G.pull=null;
 for(let i=0;i<(e.mid?6:14);i++)G.gems.push({x:e.x+rnd(-20,20),y:e.y+rnd(-20,20),v:e.xp*2+10,mag:!e.mid});
 particle(e.x,e.y,'#e0b048',40,120,0.9);snd(200,0.8,'triangle',0.06);
 const k='boss_'+e.bossKind;G.rs[k]=(G.rs[k]||0)+1;   // 설화 출정의 보스도 본편 보스 과업에 센다
 if(e.mid){G.mid=null;G.rs.mids++;dropItem('chest',e.x,e.y);toast(_t("{p} 퇴치",{p:bnm(e)}),'big');if(!G.boss)$('#bossbar').hidden=true;return;}
 G.boss=null;G.bossDone=true;$('#bossbar').hidden=true;if(G.mode==='normal'&&(G.stage===4||G.stage===9)){G.rs.mak=(G.rs.mak||0)+1;setTimeout(()=>toast(_t("마을에서 막걸리 한 병을 보내왔다")),900);}flash('255,255,255',0.5);G.dark=0;G.wind=null;
 for(const g of G.gems)g.mag=true;
 for(const en of G.enemies)if(!en.dead){en.dead=true;particle(en.x,en.y,'#efe6d2',2,30,0.3);}
 G.mid=null;G.ebul.length=0;G.warns=G.warns.filter(w=>w.friendly);G.ezones.length=0;
 G.clearT=1.8;}

/* ======================= update ======================= */
function update(dt){
 const P=G.P;G.time+=dt;G.dtNow=dt;
 if(G.clearT!==undefined){G.clearT-=dt;if(G.clearT<=0){G.clearT=undefined;if(G.mode==='rush')rushReward();else if(G.mode==='tale')taleCleared();else claimDk(()=>claimPath(()=>openChest(3+(G.mods.chestPlus||0),()=>openTavern())));
   if(modal)return;}}   // 막을 끝맺는 창이 열렸으면 이번 걸음은 여기서 멈춘다(같은 걸음에 주운 상자 창이 덮어쓰지 않게)
 else if(!G.bossDone){G.st+=dt;}
 let mx=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0),my=(keys.ArrowDown||keys.KeyS?1:0)-(keys.ArrowUp||keys.KeyW?1:0);
 if(joy&&joy.active){const dx=joy.x-joy.ox,dy=joy.y-joy.oy,d=Math.hypot(dx,dy);if(d>6){mx=dx/Math.max(d,30);my=dy/Math.max(d,30);}}
 const ml=Math.hypot(mx,my);if(ml>1){mx/=ml;my/=ml;}
 P.moving=ml>0.05;if(P.moving){P.dirx=mx/(ml||1);P.diry=my/(ml||1);if(Math.abs(mx)>0.1)P.face=mx>0?1:-1;}
 P.slowT-=dt;const sp=62*P.spd*(P.slowT>0?0.6:1)*(1+0.05*cbTier());P.x+=mx*sp*dt;P.y+=my*sp*dt;
 if(G.pull&&G.pull.src&&!G.pull.src.dead){const s=G.pull.src,dx=s.x-P.x,dy=s.y-P.y,d=Math.hypot(dx,dy)||1;if(d>14){P.x+=dx/d*G.pull.spd*dt;P.y+=dy/d*G.pull.spd*dt;}}
 if(G.wind){G.wind.t-=dt;P.x+=G.wind.x*dt;P.y+=G.wind.y*dt;if(G.wind.t<=0)G.wind=null;}
 pushOut(P,P.r);
 G.dark=Math.max(0,G.dark-dt);
 P.iframe-=dt;if(P.hp<P.maxHp)heal(P.regen*dt);if(P.shieldCd)P.shieldT-=dt;
 updJW(dt);updSky(dt);updCall(dt);updAnom(dt);updTrace(dt);updDps(dt);updDk(dt);guideUpd(dt);updCombo(dt);updQuest();
 if(modal)return;   // 괴이·흔적·샛길 창이 열렸으면 이번 걸음은 여기까지(같은 걸음에 주운 상자 창이 덮어쓰지 않게)
 if(G.tmAt!==undefined&&G.st>=G.tmAt){G.tmAt=undefined;G.queue.push('temper');}

 if(!G.bossDone){
  if(G.mode==='tale')taleTick(dt);
  else if(G.mode!=='rush'&&G.st>=MID_T&&!G.midDone){G.midDone=true;spawnBoss(curStg().mid,true);}
  if(G.mode==='normal'&&G.st>=STAGE_T&&!G.boss){if(G.midDone&&!G.mid)spawnBoss(curStg().boss,false);else if(!G.gateMsg){G.gateMsg=true;toast(_t("중간 보스를 토벌해야 막 보스가 나타난다"),'red');}}
  G.spawnT-=dt;if(G.spawnT<=0){G.spawnT=0.25;
   const target=Math.min(CAP.e,(12+Math.min(G.st,STAGE_T)*0.8+G.stage*20)*(G.boss?0.45:1)*G.mods.eCnt*(G.path&&G.path.hard?1.15:1)*(G.mode==='rush'?0.4:1));const alive=G.enemies.length;
   const s=curStg(),list=G.st>45?s.early.concat(s.late):s.early;
   let n=Math.min(8,Math.ceil((target-alive)*0.3));for(let i=0;i<n;i++){const id=list[Math.random()*list.length|0];if(EN[id].ai==='swarm'){const a=Math.random()*TAU,R0=Math.hypot(W/2,H/2)+16,x=P.x+Math.cos(a)*R0,y=P.y+Math.sin(a)*R0;for(let j=0;j<3;j++)spawnEnemy(id,x+rnd(-8,8),y+rnd(-8,8));i+=2;}else spawnEnemy(id);}}
  G.eliteT-=dt*G.mods.elite;if(G.mode!=='rush'&&G.eliteT<=0&&!G.boss&&(G.mods.eliteWithMid||!G.mid)){G.eliteT=45;spawnElite();}
  if(G.mode!=='rush'&&!G.swarmDone&&G.st>90){G.swarmDone=true;const s=curStg();toast(_t("요괴 떼가 몰려온다"),'red');for(let i=0;i<36;i++){const a=i/36*TAU;spawnEnemy(s.early[i%s.early.length],P.x+Math.cos(a)*(W*0.55),P.y+Math.sin(a)*(H*0.6));}}
  if(G.shrineN<2&&!G.shrine&&G.st>(G.shrineN?80:25)){G.shrineN++;spawnShrine();}
  G.potT-=dt;if(G.potT<=0){G.potT=7;if(G.enemies.filter(e=>e.prop).length<6)spawnPot();}
 }
 if(G.shrine){const s=G.shrine,d=Math.hypot(P.x-s.x,P.y-s.y);guideTick('shrine',s,dt);if(d<22){s.prog+=dt;if(Math.random()<0.2)particle(s.x,s.y-10,'#e0b048',1,20);if(s.prog>=s.need){guideDone('shrine',s);G.shrine=null;G.rs.shrines++;G.queue.push('bless');snd(880,0.4,'triangle',0.05);}}else s.prog=Math.max(0,s.prog-dt*0.5);}
 buildGrid();
 const tmM=P.might;if(G.taleMight)P.might*=1+G.taleMight;try{
 for(const w of G.weapons){const d=WD[w.id];CUR_SRC=w.id;const p0=G.projs.length,z0=G.zones.length,f0=G.fx.length,m0=G.movers.length,s0=G.spirits.length;runW(w,d.type==='c'?dt*G.mods.cls:dt,P);postW(w,dt,P,p0,z0,f0,m0,s0);}CUR_SRC=null;
 }finally{P.might=tmM;}
 updSpirits(dt);
 petUpd(dt);CUR_SRC=null;
 for(const m of G.movers){HSRC=m.src||null;m.x+=m.vx*dt;m.life-=dt;if(Math.random()<0.6)particle(m.x-m.dir*16,m.y+2,'#bfe0ff',1,20,0.4);
  for(const e of near(m.x,m.y,m.r,TMP).slice()){if(m.hit.has(e))continue;m.hit.add(e);hurt(e,m.dmg,160,m.x-m.dir*20,m.y);}}
 HSRC=null;G.movers=G.movers.filter(m=>m.life>0);
 updProjs(dt,P);
 for(const z of G.zones){z.life-=dt;z.tt-=dt;if(z.follow){z.x=P.x;z.y=P.y;}
  if(z.tt<=0){z.tt=z.tick;HSRC=z.src||null;for(const e of near(z.x,z.y,z.r,TMP).slice()){hurt(e,z.dmg,0,0,0,true);if(z.slow)e.slow=0.45;if(z.hold&&!e.boss)e.frz=Math.max(e.frz,0.35);if(z.vtx&&!e.boss){const dx=z.x-e.x,dy=z.y-e.y,d=Math.hypot(dx,dy)||1;if(d>4){e.kx+=dx/d*70;e.ky+=dy/d*70;}}}HSRC=null;}
  if(z.heal&&(P.x-z.x)**2+(P.y-z.y)**2<z.r*z.r)heal(z.heal*dt);}
 G.zones=G.zones.filter(z=>z.life>0);
 for(const z of G.ezones){z.life-=dt;if((P.x-z.x)**2+(P.y-z.y)**2<z.r*z.r&&P.iframe<=0)damagePlayer(z.dmg);}
 G.ezones=G.ezones.filter(z=>z.life>0);
 for(const w of G.warns){w.t-=dt;if(w.t<=0)resolveWarn(w);}
 G.warns=G.warns.filter(w=>w.t>0);
 updEnemies(dt,P);
 for(const q of G.ebul){if(q.hom){const ta=Math.atan2(P.y-q.y,P.x-q.x),ca=Math.atan2(q.vy,q.vx);let da=Math.atan2(Math.sin(ta-ca),Math.cos(ta-ca));const na=ca+clamp(da,-1.6*dt,1.6*dt),s=Math.hypot(q.vx,q.vy);q.vx=Math.cos(na)*s;q.vy=Math.sin(na)*s;}
  q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;if(q.life>0){const dd=(q.x-P.x)**2+(q.y-P.y+3)**2,hr=q.r+P.r-1;if(dd<hr*hr){q.hz=1;if(P.iframe<=0){damagePlayer(q.dmg);q.life=0;}}else if(dd<(hr+7)**2)q.nr=1;else if(q.nr&&!q.gz&&!q.hz){q.gz=1;graze(q);}}}
 G.ebul=G.ebul.filter(q=>q.life>0);
 const mg=P.magnet;
 for(const g of G.gems){const dx=P.x-g.x,dy=P.y-g.y,d=Math.hypot(dx,dy)||1;if(d<mg)g.mag=true;if(g.mag){const s=Math.max(160,d*3);g.x+=dx/d*s*dt;g.y+=dy/d*s*dt;}if(d<6){gainXp(g.v);g.dead=true;}}
 G.gems=G.gems.filter(g=>!g.dead);
 if(G.gems.length>360){const old=G.gems.splice(0,120);const v=old.reduce((s,g)=>s+g.v,0);G.gems.push({x:old[0].x,y:old[0].y,v,mag:false});}
 for(const it of G.items){const dx=P.x-it.x,dy=P.y-it.y,d=Math.hypot(dx,dy)||1;
  if(it.k==='coin'&&d<mg){it.x+=dx/d*150*dt;it.y+=dy/d*150*dt;}
  if(d<8){it.dead=true;
   if(it.k==='coin'){G.coins+=Math.round((1+P.coinPlus)*G.mods.coin);snd(1200,0.06,'triangle',0.03);if(duoOn('bokrok')){const r=Math.random();if(r<0.04)dropItem('tteok',it.x+rnd(-12,12),it.y+rnd(-10,10));else if(r<0.06)dropItem('pouch',it.x+rnd(-12,12),it.y+rnd(-10,10));}}
   else if(it.k==='tteok'){heal(30*P.tteokM);G.rs.tteok++;particle(P.x,P.y,'#7fe0a0',8,40);snd(660,0.1,'triangle');}
   else if(it.k==='grain'){if(G.tale&&G.tale.R.grain!==undefined){G.tale.R.grain++;particle(P.x,P.y-4,'#e0b048',6,30,0.4);snd(700,0.08,'triangle',0.03);}}
   else if(it.k==='pouch'){for(const g of G.gems)g.mag=true;snd(880,0.2,'triangle');toast(_t("복주머니: 구슬을 모두 끌어온다"));}
   else if(it.k==='chest'){openChest(1+(G.mods.chestPlus||0));}}}
 G.items=G.items.filter(i=>!i.dead);
 for(const f of G.fx){f.life-=dt;HSRC=f.src||null;
  if(f.t==='p'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=0.9;f.vy*=0.9;}
  else if(f.t==='num'){f.y-=18*dt;}
  else if(f.t==='glyph'){f.h-=(f.big?200:240)*dt;if(f.h<=0){aoe(f.x,f.y,f.r,f.dmg,20);particle(f.x,f.y,'#efe6d2',6,60,0.3);f.life=0;}}
  else if(f.t==='wave'){f.r+=200*dt;if(f.r>0)for(const e of near(f.x,f.y,f.r+4,TMP).slice()){if(f.hit.has(e))continue;const dd=Math.hypot(e.x-f.x,e.y-f.y);if(dd>f.r-10){f.hit.add(e);hurt(e,f.dmg,f.kb||120,f.x,f.y);if(f.frz&&!e.boss)e.frz=Math.max(e.frz,1);if(f.slow)e.slow=Math.max(e.slow,1.2);}}if(f.r>=f.maxR)f.life=0;}}
 HSRC=null;G.fx=G.fx.filter(f=>f.life>0);
 if(G.flash){G.flash.t-=dt;if(G.flash.t<=0)G.flash=null;}
 G.shake=Math.max(0,G.shake-dt*20);
 G.taskT=(G.taskT||0)-dt;if(G.taskT<=0){G.taskT=1;checkTasks();}
}
function resolveWarn(w){const P=G.P;
 if(w.friendly){HSRC=w.src||null;aoe(w.x,w.y,w.r,w.dmg,60);HSRC=null;G.fx.push({t:'ring',x:w.x,y:w.y,r:4,maxR:w.r,col:w.col,life:0.3,max:0.3});particle(w.x,w.y,w.col,12,80,0.5);G.shake=Math.max(G.shake,2);snd(90,0.2,'sawtooth',0.04);return;}
 let hit=false;
 if(w.kind==='line')hit=segDist(P.x,P.y-3,w.x,w.y,w.x+Math.cos(w.a)*w.len,w.y+Math.sin(w.a)*w.len)<w.w/2+P.r;
 else hit=(P.x-w.x)**2+(P.y-w.y)**2<(w.r+P.r)**2;
 if(w.dmg&&hit&&P.iframe<=0)damagePlayer(w.dmg);
 if(w.kind!=='line'){G.fx.push({t:'ring',x:w.x,y:w.y,r:3,maxR:w.r,col:w.col,life:0.25,max:0.25});particle(w.x,w.y,w.col,6,60,0.35);}
 else if(w.dmg)G.fx.push({t:'beam',x:w.x,y:w.y,a:w.a,len:w.len,w:w.w,col:w.col,life:0.2,max:0.2});
 if(w.fx==='bolt')G.fx.push({t:'bolt',x:w.x,y:w.y,life:0.15,max:0.15,seed:Math.random()*99});
 if(w.fx==='gold'&&Math.random()<0.25)dropItem('coin',w.x,w.y);
 if(w.fx==='slam')G.shake=Math.max(G.shake,3);}
function updSpirits(dt){const P=G.P;
 for(const s of G.spirits){if(s.life!==undefined){s.life-=dt;if(s.life<=0){s.dead=true;continue;}}
  s.ph+=dt*4;let tg=s.tg&&!s.tg.dead&&!s.tg.inv&&dist2(s.tg,P)<170*170?s.tg:null;if(!tg){tg=nearest(s.x,s.y,150);s.tg=tg;}
  let tx,ty;if(tg){tx=tg.x;ty=tg.y;}else{tx=P.x+Math.cos(s.ph*0.5)*20;ty=P.y+Math.sin(s.ph*0.5)*14;}
  const dx=tx-s.x,dy=ty-s.y,d=Math.hypot(dx,dy)||1;s.x+=dx/d*Math.min(s.sp*dt,d);s.y+=dy/d*Math.min(s.sp*dt,d);s.fx=dx>0?1:-1;
  if(tg&&d<tg.r+4&&(tg.hc['s'+s.id]||0)<G.time){tg.hc['s'+s.id]=G.time+0.35;if(s.dot){tg.dotSrc=s.src||(s.own!=='temp'?s.own:null)||tg.dotSrc,tg.dot=Math.max(tg.dot||0,s.dot);tg.dotT=3;}HSRC=s.src||(s.own&&s.own!=='temp'?s.own:null);hurt(tg,s.dmg,30,s.x,s.y);HSRC=null;}}
 G.spirits=G.spirits.filter(s=>!s.dead&&(s.own==='temp'||G.weapons.some(w=>w.id===s.own)));}
function updProjs(dt,P){
 for(const p of G.projs){if(p.dead)continue;p.life-=dt;HSRC=p.src||null;if(p.hm)steer(p,dt);
  if(p.kind==='rocket'||p.kind==='letter'||p.kind==='jtal'){if(p.tg&&!p.tg.dead){const ta=Math.atan2(p.tg.y-p.y,p.tg.x-p.x);let da=Math.atan2(Math.sin(ta-p.a),Math.cos(ta-p.a));p.a+=da*Math.min(1,(p.kind==='letter'?6:5)*dt);}else if(p.kind==='letter'&&Math.random()<0.1)p.tg=randomEnemy();
   const s=Math.min(p.kind==='letter'?190:p.kind==='jtal'?260:400,Math.hypot(p.vx,p.vy)+160*dt);p.vx=Math.cos(p.a)*s;p.vy=Math.sin(p.a)*s;if(p.kind==='rocket'&&Math.random()<0.5)particle(p.x,p.y,'#e0b048',1,10,0.25);}
  else if(p.kind==='boomer'){p.tt+=dt;const s=p.v0-p.v0*1.4*p.tt;if(s<0&&!p.ret){p.ret=true;p.hit.clear();}
   if(p.ret){const dx=P.x-p.x,dy=P.y-p.y,d=Math.hypot(dx,dy)||1,v=Math.min(260,-s+40);p.vx=dx/d*v;p.vy=dy/d*v;if(d<6){p.dead=true;continue;}}
   else{p.vx=Math.cos(p.a)*s;p.vy=Math.sin(p.a)*s;}p.spin=(p.spin||0)+dt*14;}
  else if(p.kind==='blade'){p.clr-=dt;if(p.clr<=0){p.clr=0.45;p.hit.clear();}p.spin=(p.spin||0)+dt*16;
   if(p.x<P.x-W/2+4&&p.vx<0||p.x>P.x+W/2-4&&p.vx>0)p.vx*=-1;if(p.y<P.y-H/2+4&&p.vy<0||p.y>P.y+H/2-4&&p.vy>0)p.vy*=-1;}
  else if(p.kind==='bomb'){if(p.fuse<0){if((p.x-p.tx)**2+(p.y-p.ty)**2<16){p.vx=p.vy=0;p.fuse=0.9;}}else{p.fuse-=dt;if(p.fuse<=0){explode(p);p.dead=true;}continue;}}
  else if(p.kind==='knife'){p.spin=(p.spin||0)+dt*20;}
  else if(p.kind==='note'){p.ph+=dt*9;const w=Math.cos(p.ph)*34*dt;p.x+=-Math.sin(p.a)*w;p.y+=Math.cos(p.a)*w;}
  p.x+=p.vx*dt;p.y+=p.vy*dt;
  if(p.life<=0){if(p.kind==='rocket'||p.kind==='ball'||p.kind==='bomb')explode(p);p.dead=true;continue;}
  if(p.kind==='bomb')continue;
  for(const e of near(p.x,p.y,p.r,TMP)){if(p.hit.has(e))continue;
   if(p.kind==='rocket'||p.kind==='ball'){explode(p);p.dead=true;break;}
   p.hit.add(e);hurt(e,p.dmg,p.kb,p.x-p.vx*0.05,p.y-p.vy*0.05);
   if(p.dot){e.dotSrc=HSRC||CUR_SRC||e.dotSrc,e.dot=Math.max(e.dot||0,p.dot);e.dotT=p.dotT;e.dotSrc=p.src;if(p.drain)e.drain=p.drain;}
   if(p.bst){G._dg=1;aoe(p.x,p.y,14*G.P.area,p.dmg*0.5,10);G._dg=0;if(Math.random()<0.4)particle(p.x,p.y,'#ffb060',3,40,0.25);}
   if(p.heal){P.healAcc++;if(P.healAcc>=12){P.healAcc=0;heal(1);}}
   if(p.kind==='letter'&&p.boom){G._dg=1;aoe(p.x,p.y,p.boom*G.P.area,p.dmg*0.4,10);G._dg=0;}
   if(p.kind==='pill'||p.kind==='coin'||p.kind==='jegi'){if(p.boom)aoe(p.x,p.y,p.boom,p.dmg*0.6,20);
    let nx=null;if(p.bounces-->0){let bd=90*90;for(const o of G.enemies){if(o.dead||o.prop||p.hit.has(o))continue;const d=(o.x-p.x)**2+(o.y-p.y)**2;if(d<bd){bd=d;nx=o;}}}
    if(nx){const a=Math.atan2(nx.y-p.y,nx.x-p.x),s=Math.hypot(p.vx,p.vy);p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s;p.life=Math.max(p.life,0.6);}else p.dead=true;break;}
   if(--p.pierce<=0){if(p.bnc>0&&retarget(p)){p.bnc--;p.pierce=1;break;}p.dead=true;break;}}}
 HSRC=null;G.projs=G.projs.filter(p=>!p.dead);}
function updEnemies(dt,P){
 const farX=W/2+60,farY=H/2+60;
 for(const e of G.enemies){if(e.dead)continue;
  if(e.prop){if(Math.abs(e.x-P.x)>W||Math.abs(e.y-P.y)>H)e.dead=true;continue;}
  e.flash-=dt;e.slow-=dt;e.frz-=dt;e.bob+=dt*6;
  if(e.dotT>0){e.dotT-=dt;e.dotTick-=dt;if(e.dotTick<=0){e.dotTick=0.4;const d=e.dot*0.4;if(e.drain)heal(d*e.drain*0.15);HSRC=e.dotSrc||null;hurt(e,d,0,0,0,true);HSRC=null;if(Math.random()<0.5)particle(e.x,e.y-4,e.drain?'#ff5a5a':'#b07fd0',1,15);if(e.dead)continue;}}else e.dot=0;
  if(e.clone){e.mt-=dt;if(e.mode==='tele'){if(e.mt<=0){e.mode='dash';e.mt=0.7;e.da=angTo(e,P);}}else{e.x+=Math.cos(e.da)*230*dt;e.y+=Math.sin(e.da)*230*dt;e.vx=Math.cos(e.da);if(e.mt<=0){e.dead=true;particle(e.x,e.y,'#f2efe8',6,40);continue;}}
   if((e.x-P.x)**2+(e.y-P.y)**2<(e.r+P.r)**2&&P.iframe<=0)damagePlayer(e.dmg);continue;}
  let mv=1;
  if(e.boss){CUR_SRC='boss';bossAI(e,dt);CUR_SRC=null;if(e.dead)continue;mv=e.act?BSK[e.act].mv:1;if(e.hidden)continue;}
  const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1;
  let spd=e.spd*(e.slow>0?0.5:1)*mv*(G.sky&&G.sky.fx==='mire'&&G.sky.t>0?0.7:1);if(e.frz>0)spd=0;
  let vx=dx/d*spd,vy=dy/d*spd;
  if(spd>0)switch(e.ai){
   case 'zig':{const s=Math.sin(e.bob*0.8)*0.8;vx+=-dy/d*spd*s;vy+=dx/d*spd*s;break;}
   case 'charge':if(e.ct===undefined)e.ct=rnd(1,3);e.ct-=dt;
    if(e.cs==='wind'){vx=vy=0;if(e.ct<=0){e.cs='dash';e.ct=0.4;}}else if(e.cs==='dash'){vx=e.cdx*spd*3.2;vy=e.cdy*spd*3.2;if(e.ct<=0){e.cs=null;e.ct=rnd(2.5,4);}}
    else if(e.ct<=0&&d<130){e.cs='wind';e.ct=0.45;e.cdx=dx/d;e.cdy=dy/d;}break;
   case 'shoot':if(d<70){vx*=-0.6;vy*=-0.6;}if(e.ct===undefined)e.ct=rnd(1,2.6);e.ct-=dt;if(e.ct<=0&&d<170){e.ct=2.8;ebul(e.x,e.y-4,Math.atan2(dy,dx),70,{dmg:e.dmg*0.8,r:2.5,col:'#ffb0d8'});}break;
   case 'leap':if(e.ct===undefined)e.ct=Math.random();e.ct-=dt;if(e.ct<=0)e.ct=1.1;if(e.ct>0.35){vx*=0.15;vy*=0.15;}else{vx*=2.6;vy*=2.6;}break;}
  if(e.elite){e.et-=dt;if(e.et<=0){e.et=3.5;ringB(e,8,55,Math.random());}}
  e.vx=vx;e.x+=(vx+e.kx)*dt;e.y+=(vy+e.ky)*dt;const kd=Math.max(0,1-9*dt);e.kx*=kd;e.ky*=kd;
  if(e.boss&&e.segs){let px=e.x,py=e.y;for(const s of e.segs){const sx=px-s.x,sy=py-s.y,sd=Math.hypot(sx,sy);if(sd>7){s.x+=sx/sd*(sd-7);s.y+=sy/sd*(sd-7);}px=s.x;py=s.y;}}
  if(!e.boss){for(const o of near(e.x,e.y,e.r,TMP)){if(o===e||o.boss||o.prop)continue;const ox=e.x-o.x,oy=e.y-o.y,od=Math.hypot(ox,oy)||0.01,ov=e.r+o.r-od;if(ov>0){const push=ov*0.35/od;e.x+=ox*push;e.y+=oy*push;}}
   if(!e.fly)pushOut(e,e.r);}
  if(d<e.r+P.r&&P.iframe<=0&&e.frz<=0&&!e.inv){damagePlayer(e.dmg);if(e.vr==='hex')P.slowT=1.5;}
  if(!e.boss&&(Math.abs(e.x-P.x)>farX+40||Math.abs(e.y-P.y)>farY+40)){const a=Math.atan2(P.diry,P.dirx)+rnd(-1,1),R0=Math.hypot(W/2,H/2)+12;e.x=P.x+Math.cos(a)*R0;e.y=P.y+Math.sin(a)*R0;}
  if(e.boss&&!e.act&&(Math.abs(e.x-P.x)>W||Math.abs(e.y-P.y)>H)){const a=Math.random()*TAU;e.x=P.x+Math.cos(a)*W*0.6;e.y=P.y+Math.sin(a)*H*0.6;}
 }
 G.enemies=G.enemies.filter(e=>!e.dead);}
const SKY={
 pung:{n:'풍백',t:'바람을 다스리는 신',col:'#bfe8ff',rgb:'191,232,255',look:lk('crown','#dfeef8',{H:'#efe6d2',h:'#8fd3ff',T:'#8fd3ff',L:'#3a6fd0',item:'fan',aura:'#bfe8ff'}),
  fx:[{id:'gale',n:'순풍',d:'이동 속도 +35%'},{id:'swift',n:'질풍',d:'투사체 속도 +40% · 범위 +15%'},{id:'storm',n:'회오리',d:'2초마다 돌풍이 주변 요괴를 밀어내고 벤다'}]},
 usa:{n:'우사',t:'비를 다스리는 신',col:'#7fb0ff',rgb:'127,176,255',look:lk('jeongja','#3a5f9e',{T:'#7fb0ff',L:'#efe6d2',C:'#efe6d2',item:'gourd',aura:'#7fb0ff'}),
  fx:[{id:'rain',n:'단비',d:'초당 체력 회복 +3'},{id:'mire',n:'진창',d:'요괴 이동 속도 −30%'},{id:'downpour',n:'뇌우',d:'2.5초마다 요괴 다섯에게 벼락'}]},
 unsa:{n:'운사',t:'구름을 다스리는 신',col:'#efe6d2',rgb:'239,230,210',look:lk('hwagwan','#efe6d2',{H:'#efe6d2',h:'#b0b8c8',T:'#b0b8c8',L:'#e0b048',item:'staff',aura:'#ffffff'}),
  fx:[{id:'veil',n:'운무',d:'받는 피해 −25%'},{id:'mist',n:'구름 장막',d:'재사용 대기 −20%'},{id:'bounty',n:'풍년 구름',d:'획득 범위 ×3 · 경험치 +25%'}]}};
const SKY_T=30;
function skyOn(id){return G.sky&&G.sky.t>0&&G.sky.fx===id;}
function skyArrive(){const P=G.P,keys=Object.keys(SKY),k=keys[Math.random()*keys.length|0],god=SKY[k],f=god.fx[Math.random()*god.fx.length|0];
 G.sky={k,fx:f.id,n:f.n,t:SKY_T,tk:1};G.skyGod={k,x:P.x+40,y:P.y-60,t:4.5};G.rs.sky=(G.rs.sky||0)+1;
 recompute();toastBig(_t("{n} 강림 · {t}",{n:god.n,t:god.t}),_t("{n} — {d} ({SKY_T}초)",{n:f.n,d:f.d,SKY_T:SKY_T}));flash(god.rgb,0.3);
 particle(P.x,P.y-8,god.col,20,60,0.8);snd(523,0.3,'triangle',0.05);setTimeout(()=>snd(784,0.3,'triangle',0.05),120);setTimeout(()=>snd(1046,0.4,'triangle',0.05),240);}
function updSky(dt){const P=G.P;
 if(!G.bossDone&&G.skyAt!==undefined&&G.st>=G.skyAt){G.skyAt=undefined;skyArrive();}
 const g=G.skyGod;if(g){g.t-=dt;const tx=P.x+28,ty=P.y-30;g.x+=(tx-g.x)*Math.min(1,3*dt);g.y+=(ty-g.y)*Math.min(1,3*dt);if(Math.random()<0.3)particle(g.x+rnd(-8,8),g.y+2,'#efe6d2',1,10,0.6);if(g.t<=0){particle(g.x,g.y-6,SKY[g.k].col,14,40,0.6);G.skyGod=null;}}
 const k=G.sky;if(!k||k.t<=0)return;k.t-=dt;
 if(k.t<=0){recompute();toast(_t("{n}의 가호가 걷혔다",{n:SKY[k.k].n}));return;}
 const s=G.stage;k.tk-=dt;
 if(k.fx==='storm'&&k.tk<=0){k.tk=2;const r=60*P.area;G.fx.push({t:'wave',x:P.x,y:P.y,r:4,maxR:r,dmg:(14+10*s)*P.might,kb:220,hit:new Set(),life:1,max:1,col:'#bfe8ff'});particle(P.x,P.y,'#bfe8ff',10,70,0.5);snd(300,0.15,'triangle',0.03);}
 if(k.fx==='downpour'&&k.tk<=0){k.tk=2.5;for(let i=0;i<5;i++){const e=randomEnemy();if(e)qpush({t:i*0.08,f:()=>{if(!e.dead)bolt(e.x,e.y,14,(30+28*s)*P.might);}});}snd(200,0.2,'sawtooth',0.03);}
 if(k.fx==='rain'&&Math.random()<0.4)particle(P.x+rnd(-W/2,W/2),P.y+rnd(-H/2,H/2),'#7fb0ff',1,6,0.4);}
function drawSky(){const g=G.skyGod;if(!g)return;const a=Math.min(1,g.t*1.5),god=SKY[g.k];b.globalAlpha=a*0.85;b.fillStyle='#efe6d2';
 for(const [ox,oy,r] of [[-7,1,5],[0,0,7],[7,1,5],[-3,3,5],[4,3,5]]){b.beginPath();b.ellipse(g.x+ox,g.y+oy,r,r*0.55,0,0,TAU);b.fill();}
 b.globalAlpha=a*0.3;b.fillStyle=god.col;b.beginPath();b.ellipse(g.x,g.y-8,10,12,0,0,TAU);b.fill();b.globalAlpha=a;drawSpr(charSpr(god.look),g.x,g.y-1+Math.sin(G.time*2)*1.5,g.x>G.P.x);b.globalAlpha=1;}
const JW_LOOK=lk('gat','#4a5a7a',{T:'#e0b048',L:'#c23b2a',C:'#efe6d2',item:'fan'});
ESPR.jwclone=ESPR.jwshade=charSpr(JW_LOOK);
/* 설화 소품 도트(흔적·규칙 소품·장면 그림) */
const PROP={
 scroll:mk(['.yyyyyyyy.','.wwwwwwww.','.wkkwwkkw.','.wwwwwwww.','.wkwkkwkw.','.wwwwwwww.','.wkkwkwkw.','.wwwwwwww.','.yyyyyyyy.','..n....n..'],PAL),
 cave:mk(['...xxxx...','..xXXXXx..','.xXkkkkXx.','xXkkkkkkXx','xXkkkkkkXx','xXkkkkkkXx','xXkkkkkkXx','gxXkkkkXxg','ggxxxxxxgg'],PAL),
 flower:mk(['..r....p..','.rwr..pwp.','..r.y..p..','..g.y.g...','...gyg....','..yyyyy...','...ywy....','....g.....','...ggg....','....g.....'],PAL),
 well:mk(['.nnnnnnnn.','.n......n.','.n..kk..n.','.nnnnnnnn.','xXXXXXXXXx','xXccccccXx','xXbbbbbbXx','xXXXXXXXXx','.xxxxxxxx.'],PAL),
 grain:mk(['...nn....','..oyyo...','.oyyyyo..','oyyoyyyo.','oyyyyoyo.','oyoyyyyo.','.oyyyyo..','..oooo...'],PAL),
 dawn:mk(['..........','....yy....','...yyyy...','rrryyyyrrr','RRRRRRRRRR','nnnnnnnnnn','kknkknkknk'],PAL),
};
ICS.grain=PROP.grain;
function artSpr(a){if(!a)return null;if(a==='jw')return charSpr(JW_LOOK);const [k,v]=a.split(':');
 if(k==='en')return ESPR[v]?ESPR[v].n:null;if(k==='ch')return CHARS[v]?charSpr(CHARS[v].look).n:null;if(k==='prop')return PROP[v]||null;return null;}
/* 이야기 장면 창: openScene(쪽 배열, 다 읽은 뒤 할 일) */
let scenePages=null,sceneI=0,sceneDone=null;
function renderScene(){const pg=scenePages[sceneI],last=sceneI===scenePages.length-1;
 $('#sceneEye').textContent=pg.eye||'';$('#sceneTitle').textContent=pg.title||'';$('#sceneText').textContent=pg.t||'';$('#sceneFoot').textContent=pg.foot||'';
 const sp=artSpr(pg.art),im=$('#sceneArt');if(sp){const c=sp.n||sp;im.src=big(c,Math.max(2,Math.floor(96/Math.max(c.width,c.height))));im.hidden=false;}else im.hidden=true;
 $('#sceneNext').textContent=last?_t("계속"):_t("다음");}
function openScene(pages,done){scenePages=pages;sceneI=0;sceneDone=done||null;renderScene();show('scene');snd(520,0.2,'triangle',0.04);}
function sceneNext(){if(modal!=='scene'||!scenePages||!armed())return;
 if(sceneI<scenePages.length-1){sceneI++;renderScene();armUntil=performance.now()+250;return;}
 const cb=sceneDone;scenePages=null;sceneDone=null;show(null);if(cb)cb();}
function summonJW(mode){const P=G.P;G.helper=Object.assign(G.helper||{x:P.x-24,y:P.y-14,at:0,bt:0,ph:0},{t:5,mode});
 if(mode==='20'){heal(P.maxHp*0.4/P.healM);G.jwBuff=10;toastBig(_t("도사 전우치의 도술"),_t("금강불괴 · 회복과 방어"));flash('255,230,160',0.4);particle(P.x,P.y-6,'#e0b048',24,60,0.7);}
 else{toastBig(_t("도사 전우치 출현"),_t("분신술 · 요괴 토벌"));flash('230,240,255',0.25);}
 particle(G.helper.x,G.helper.y,'#efe6d2',16,50,0.6);snd(660,0.3,'triangle',0.05);setTimeout(()=>snd(990,0.3,'triangle',0.05),120);}
function updJW(dt){const P=G.P,J=G.jw,M=G.mods;J.cd50-=dt;J.cd20-=dt;G.jwBuff=Math.max(0,G.jwBuff-dt);
 const r=P.hp/P.maxHp;
 if(r<=0.2&&J.cd20<=0&&P.hp>0){J.cd20=M.jw20*(G.ks==='buchae'?0.75:1);summonJW('20');}
 else if(r<=0.5&&J.cd50<=0&&P.hp>0){J.cd50=M.jw50*(G.ks==='buchae'?0.75:1);summonJW('50');}
 const h=G.helper;if(!h)return;h.t-=dt;h.ph+=dt;
 const tx=P.x+Math.cos(h.ph*1.6)*26,ty=P.y-12+Math.sin(h.ph*1.6)*14;h.x+=(tx-h.x)*Math.min(1,6*dt);h.y+=(ty-h.y)*Math.min(1,6*dt);
 const s=G.stage;h.at-=dt;if(h.at<=0){h.at=0.35;for(let i=0;i<2;i++){const tg=randomEnemy();shoot(h.x,h.y-6,tg?Math.atan2(tg.y-h.y,tg.x-h.x)+rnd(-.4,.4):Math.random()*TAU,90,'jtal',12+12*s,2,2,3,{tg});}}
 h.bt-=dt;if(h.bt<=0){h.bt=1.2;const tg=randomEnemy();if(tg)bolt(tg.x,tg.y,16,40+40*s);}
 if(h.t<=0){particle(h.x,h.y-6,'#efe6d2',16,40,0.6);G.helper=null;toast(_t("전우치가 구름을 타고 떠난다"));}}
function petSkill(pt,slot){const L=PETS[pt.type].sk[slot];let cur=null;for(const s of L)if(pt.lv>=s.lv)cur=s;return cur;}
function petGrow(){const pt=G.pet;if(!pt)return;const nl=clamp(1+Math.floor((G.P.lvl-10)/4),1,10);if(nl<=pt.lv)return;
 const before={a:petSkill(pt,'a'),h:petSkill(pt,'h'),u:petSkill(pt,'u')};pt.lv=nl;const learned=[];
 for(const k of ['a','h','u']){const now=petSkill(pt,k);if(now&&now!==before[k])learned.push(now.n);}
 toast(_t("{n} 레벨 {lv}{p}",{n:PETS[pt.type].n,lv:pt.lv,p:learned.length?' · '+learned.join(', ')+_t(" 습득"):''}));refreshSlots();}
function pickPet(type){const P=G.P;G.pet={type,lv:1,x:P.x-14,y:P.y,cdA:0.5,cdH:2,cdU:4,ph:0,hold:0,white:0};petGrow();show(null);toast(_t("{n}이(가) 따라나섰다",{n:PETS[type].n}),'big');refreshSlots();}
function petJump(pt,x,y){particle(pt.x,pt.y-4,PETS[pt.type].col,4,30,0.3);pt.x=x;pt.y=y;pt.hold=0.4;particle(x,y-4,PETS[pt.type].col,6,40,0.35);}
const petStageF=s=>1+0.18*s-0.008*s*s;
const pdmg=(pt,b)=>b*(1+0.3*(pt.lv-1))*petStageF(G.stage)*G.P.might;
const prng=(pt,r)=>r*(1+0.07*(pt.lv-1));
const PETSK={
 tiger:{
  a(pt){const tg=nearest(pt.x,pt.y,150);if(!tg)return false;const n=pt.lv>=5?3:1;for(let i=0;i<n;i++)qpush({t:i*0.15,f:()=>{const e=i?randomEnemy(100):tg;if(!e||e.dead)return;petJump(pt,e.x+6,e.y);aoe(e.x,e.y,prng(pt,20),pdmg(pt,30));G.fx.push({t:'slash',x:e.x,y:e.y,a:Math.random()*TAU,r:16,life:0.15,max:0.15,delay:0,half:0.7,col:'#ffd08a'});snd(400,0.05,'triangle',0.03);}});return true;},
  h(pt){const big=pt.lv>=6,R0=prng(pt,big?90:60);G.fx.push({t:'ring',x:pt.x,y:pt.y,r:4,maxR:R0,col:'#d8862a',life:0.4,max:0.4});for(const e of near(pt.x,pt.y,R0,TMP2).slice()){hurt(e,pdmg(pt,15),30,pt.x,pt.y);if(!e.boss)e.frz=Math.max(e.frz,big?2.5:1.5);}snd(110,0.3,'sawtooth',0.05);if(meta.set.shake)G.shake=Math.max(G.shake,2);return true;},
  u(pt){if(!randomEnemy())return false;const big=pt.lv>=8,n=big?8:5;if(big)pt.white=n*0.16+0.3;toast(big?_t("범 · 백호 현신"):_t("범 · 산군 강림"));
   for(let i=0;i<n;i++)qpush({t:i*0.16,f:()=>{const e=randomEnemy();if(!e)return;petJump(pt,e.x,e.y);aoe(e.x,e.y,prng(pt,24),pdmg(pt,110));G.fx.push({t:'ring',x:e.x,y:e.y,r:3,maxR:prng(pt,24),col:big?'#efe6d2':'#d8862a',life:0.25,max:0.25});snd(160,0.12,'sawtooth',0.04);}});return true;}},
 bear:{
  a(pt){const P=G.P,tg=nearest(P.x,P.y,70);if(!tg)return false;const big=pt.lv>=5,R0=prng(pt,big?34:26);petJump(pt,(pt.x+tg.x)/2,(pt.y+tg.y)/2);aoe(pt.x,pt.y,R0,pdmg(pt,big?45:35),90);G.fx.push({t:'ring',x:pt.x,y:pt.y,r:3,maxR:R0,col:'#b0702e',life:0.25,max:0.25});snd(90,0.12,'square',0.04);return true;},
  h(pt){const big=pt.lv>=6,R0=prng(pt,big?100:70);let any=false;for(const e of near(pt.x,pt.y,R0,TMP2).slice()){any=true;const dx=pt.x-e.x,dy=pt.y-e.y,d=Math.hypot(dx,dy)||1;if(!e.boss){e.kx+=dx/d*170;e.ky+=dy/d*170;e.frz=Math.max(e.frz,big?3:2);}hurt(e,pdmg(pt,20),0,0,0,true);}
   if(!any)return false;G.fx.push({t:'ring',x:pt.x,y:pt.y,r:R0,maxR:6,col:'#efe6d2',life:0.4,max:0.4});snd(140,0.3,'triangle',0.05);return true;},
  u(pt){const big=pt.lv>=8,k=big?4:3;toast(big?_t("반달곰 · 대지진"):_t("반달곰 · 산 무너뜨리기"));if(big)G.petGuard=5;
   for(let i=0;i<k;i++)qpush({t:i*0.35,f:()=>{G.fx.push({t:'wave',x:pt.x,y:pt.y,r:4,maxR:prng(pt,110),dmg:pdmg(pt,120),hit:new Set(),life:9,kb:120,frz:1,col:'#b0702e'});if(meta.set.shake)G.shake=Math.max(G.shake,3);snd(60,0.25,'sawtooth',0.05);}});return true;}},
 falcon:{
  a(pt){const tg=nearest(G.P.x,G.P.y,180);if(!tg)return false;const n=pt.lv>=5?3:1;for(let i=0;i<n;i++)qpush({t:i*0.18,f:()=>{const e=i?randomEnemy():tg;if(!e||e.dead)return;petJump(pt,e.x,e.y-8);aoe(e.x,e.y,prng(pt,12),pdmg(pt,45));particle(e.x,e.y,'#c8c4cc',5,40);snd(900,0.05,'triangle',0.03);}});return true;},
  h(pt){const tg=randomEnemy();if(!tg)return false;const big=pt.lv>=6;zone({x:tg.x,y:tg.y,r:prng(pt,big?60:40),dmg:pdmg(pt,8),tick:0.3,life:big?4:3,col:'#bfe0ff',slow:1,hold:1,kind:'gust'});petJump(pt,tg.x,tg.y-14);snd(500,0.3,'triangle',0.03);return true;},
  u(pt){if(!randomEnemy())return false;const big=pt.lv>=8,n=big?14:8;toast(big?_t("해동청 · 천리 해동청"):_t("해동청 · 해동청 폭풍"));
   for(let i=0;i<n;i++)qpush({t:i*0.1,f:()=>{const e=randomEnemy();if(!e)return;petJump(pt,e.x,e.y-8);aoe(e.x,e.y,prng(pt,16),pdmg(pt,90));G.fx.push({t:'beam',x:e.x,y:e.y-60,a:Math.PI/2,len:60,w:3,col:'#efe6d2',life:0.12,max:0.12});}});return true;}}};
function petUpd(dt){for(const q of G.petQ){q.t-=dt;if(q.t<=0&&!q.done){q.done=1;CUR_SRC=q.src;const f0=G.fx.length,m0=G.movers.length;q.f();if(q.src)tagNew(f0,m0,q.src);}}G.petQ=G.petQ.filter(q=>!q.done);CUR_SRC=G.pet?'pet:'+G.pet.type:null;
 G.petGuard=Math.max(0,(G.petGuard||0)-dt);const pt=G.pet;if(!pt)return;const P=G.P;pt.ph+=dt;pt.white=Math.max(0,pt.white-dt);
 const fy=pt.type==='falcon';if(pt.hold>0)pt.hold-=dt;else{const tx=P.x+(fy?Math.cos(pt.ph*1.5)*22:-14*P.face),ty=P.y+(fy?-18+Math.sin(pt.ph*1.5)*8:-1);pt.vx=tx-pt.x;pt.x+=(tx-pt.x)*Math.min(1,4*dt);pt.y+=(ty-pt.y)*Math.min(1,4*dt);}
 pt.cdA-=dt;pt.cdH-=dt;pt.cdU-=dt;const SK=PETSK[pt.type];
 if(pt.cdA<=0)pt.cdA=SK.a(pt)?PET_CD.a:0.5;
 if(pt.lv>=2&&pt.cdH<=0)pt.cdH=SK.h(pt)?PET_CD.h:1;
 if(pt.lv>=4&&pt.cdU<=0)pt.cdU=SK.u(pt)?PET_CD.u:1;}
function drawPet(){const pt=G.pet;if(!pt)return;const s=PSPR[pt.type],fy=pt.type==='falcon';
 const pk=entK();if(fy){shadow(pt.x,pt.y+14,3*pk);}else shadow(pt.x,pt.y,5*pk);
 const bob=fy?Math.sin(pt.ph*8)*1.5:(Math.sin(pt.ph*10)>0?-1:0);const flip=(pt.vx||0)>0;
 drawSpr(s,pt.x,pt.y+bob,flip,pt.white>0,pk);
 if(G.petGuard>0){b.strokeStyle='rgba(176,112,46,0.7)';b.lineWidth=1;b.beginPath();b.ellipse(G.P.x,G.P.y-6*pk,12*pk,13*pk,0,0,TAU);b.stroke();}}
function damagePlayer(dmg){const P=G.P;if(G.over)return;if(G.guardT>0){P.iframe=0.3;return;}
 if(P.shieldCd&&P.shieldT<=0){P.shieldT=P.shieldCd;P.iframe=0.5;particle(P.x,P.y-6,'#8fd3ff',10,40);snd(500,0.1,'triangle',0.04);
  if(duoOn('suhwa')){G._dg=1;aoe(P.x,P.y,50*P.area,(30+20*G.stage)*P.might,140);for(const e of near(P.x,P.y,50*P.area,TMP2)){e.dotSrc=HSRC||CUR_SRC||e.dotSrc,e.dot=Math.max(e.dot||0,6*P.might);e.dotT=2.5;}G.fx.push({t:'ring',x:P.x,y:P.y,r:3,maxR:50*P.area,col:'#ff7a3a',life:0.3,max:0.3});G._dg=0;}return;}
 const jb=G.jwBuff>0;const d=Math.max(1,Math.round((dmg-P.armor-(jb?5:0))*G.mods.dmgIn*(G.dkC==='frail'?1.25:1)*(1-P.dmgRed)*(jb?0.7:1)*(G.petGuard>0?0.7:1)*(G.seongT>0?0.3:1)));P.hp-=d;addCall(2);P.iframe=0.4+P.iframeB;if(meta.set.shake)G.shake=2;snd(160,0.08,'sawtooth',0.04);
 if(P.hp<=0){
  const hs=G.weapons.find(w=>w.id==='hoesaeng'&&w.t<=0);
  if(hs){hs.t=L5(hs,[120,105,90,80,70]);P.hp=P.maxHp*0.6;P.iframe=2;toast(_t("회생"),'big');flash('150,255,180',0.4);if(hs.lv>=5)G.fx.push({t:'wave',x:P.x,y:P.y,r:4,maxR:150,dmg:120*P.might,hit:new Set(),life:9,col:'#9af0b0',kb:160});return;}
  if(P.revive>0){P.revive--;P.hp=P.maxHp*0.5;P.iframe=2;toast(_t("혼백 부적이 타오른다 · 부활"),'big');for(const e of G.enemies)if(!e.boss){const a=Math.atan2(e.y-P.y,e.x-P.x);e.kx+=Math.cos(a)*300;e.ky+=Math.sin(a)*300;}G.ebul.length=0;G.warns=G.warns.filter(w=>w.friendly);return;}
  endGame(false);}}
function gainXp(v){const P=G.P;P.xp+=v*P.xpGain*(1+0.1*cbTier());snd(900+Math.random()*300,0.03,'triangle',0.012);
 while(P.xp>=P.next){P.xp-=P.next;P.lvl++;P.next=xpNeed(P.lvl);G.rs.maxLevel=Math.max(G.rs.maxLevel,P.lvl);petGrow();G.queue.push(P.lvl%10===0&&P.lvl<=50?'adv':AWK_LV.includes(P.lvl)?'awk':P.lvl===ULT_LV?'ult':'lvl');
  if(duoOn('gataek')){G.base.maxHp+=2;recompute();heal(15);}}}

