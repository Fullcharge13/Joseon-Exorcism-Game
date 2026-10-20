// 설화 출정 자동 플레이 봇 (보통 수준). harness 위에서 실행:
//   TALE=woochi RUNS=12 SEED=1 node tests/harness.js index.html tests/sim/tale_bot.js
// 판마다 완주 여부·시간·막별 보스 시간·받은 피해·멈춤·오류를 JSON 한 줄로 낸다(마지막 줄 SUMMARY).
// 봇: 0.1초마다 방향을 정한다. 요괴·탄·붉은 장판에서 멀어지고, 규칙 목표(우물·꽃)·곡식·상자·구슬 쪽으로 간다.
// 창이 뜨면 첫 선택지를 고른다(레벨업 선택지는 섞여 나오므로 사실상 무작위).
const TALE=process.env.TALE||'woochi',RUNS=+(process.env.RUNS||12);let seed=+(process.env.SEED||1);
const UP=JSON.parse(process.env.UP||'{"hp":3,"might":3,"spd":2,"xp":3}');
Math.random=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
document.hidden=true;let errs=0;const cw=console.warn;console.warn=(...a)=>{errs++;if(errs<4)cw(...a);};
meta.up=UP;meta.tale.frag[TALE]=3;meta.set.nums=false;
function pick(){armUntil=0;
  if(modal==='scene')return sceneNext(),1;if(modal==='levelup')return pickOpt(0),1;if(modal==='adv'&&advPick.length)return advPick[0](),1;
  if(modal==='bless'&&blessPick.length)return blessPick[0](),1;if(modal==='petpick'&&petPick.length)return petPick[0](),1;
  if(modal==='pick'&&pickFns.length)return pickFns[0](),1;if(modal==='chest')return $('#chestOk').onclick(),1;if(modal==='tavern')return $('#tavGo').onclick(),1;if(modal==='over')return 0;return 0;}
function steer(){const P=G.P;let vx=0,vy=0;
  for(const e of G.enemies){if(e.dead||e.prop)continue;const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1;const lim=e.boss?110:70;if(d<lim){const w=(e.boss?3:1)*(lim-d)/lim/d;vx+=dx*w;vy+=dy*w;}}
  for(const u of G.ebul){const dx=P.x-u.x,dy=P.y-u.y,d=Math.hypot(dx,dy)||1;if(d<36){const w=1.5*(36-d)/36/d;vx+=dx*w;vy+=dy*w;}}
  for(const w0 of G.warns){if(w0.friendly)continue;const dx=P.x-w0.x,dy=P.y-w0.y,d=Math.hypot(dx,dy)||1,r=(w0.r||10)+8;if(d<r){vx+=dx/d*4;vy+=dy/d*4;}}
  for(const z of G.ezones){const dx=P.x-z.x,dy=P.y-z.y,d=Math.hypot(dx,dy)||1,r=(z.r||10)+6;if(d<r){vx+=dx/d*3;vy+=dy/d*3;}}
  const dang=Math.hypot(vx,vy);
  let tg=null;const tr=G.mode==='tale'?taleRule():null;const goal=tr&&tr.goal&&tr.goal(G.tale.R);if(goal)tg=goal;
  if(!tg){let best=1e9;for(const it of G.items){if(it.k==='tteok'&&P.hp>P.maxHp*0.7)continue;const d=Math.hypot(it.x-P.x,it.y-P.y);if(d<best&&d<260){best=d;tg=it;}}}
  if(!tg&&G.shrine)tg=G.shrine;
  if(!tg){let best=1e9;for(const g of G.gems){const d=Math.hypot(g.x-P.x,g.y-P.y);if(d<best&&d<150){best=d;tg=g;}}}
  if(tg){const dx=tg.x-P.x,dy=tg.y-P.y,d=Math.hypot(dx,dy)||1;const pull=goal?(dang>1.2?0.4:1.2):0.6;vx+=dx/d*pull;vy+=dy/d*pull;}
  else{vx+=Math.cos(G.time*0.3)*0.3;vy+=Math.sin(G.time*0.3)*0.3;}
  const l=Math.hypot(vx,vy);if(l<0.05){joy=null;return;}joy={id:1,active:true,ox:0,oy:0,x:vx/l*40,y:vy/l*40};}
// 보스 시간은 등장·퇴치 함수를 감싸 잰다
let bT0=null,bRec=null;{const sb=spawnBoss,bd=bossDown;spawnBoss=(id,mid)=>{const r=sb(id,mid);if(!mid)bT0=G.time;return r;};bossDown=e=>{if(!e.mid&&bT0!==null&&bRec&&G.tale)bRec[G.tale.act]=+(G.time-bT0).toFixed(1);bT0=null;return bd(e);};}
if(TALE.startsWith('main:')){const cid=TALE.slice(5);let t=performance.now();const out=[];
  for(let run=0;run<RUNS;run++){newGame(cid,null,0,'normal');let dec=0,lv=[],st=-1;
   for(let i=0;i<30*60*40&&!G.over;i++){if(modal){if(!pick())break;continue;}dec-=1/30;if(dec<=0){dec=0.1;steer();}t+=1000/30;frame(t);if(G.stage!==st){st=G.stage;lv.push(G.P.lvl+'@'+Math.round(G.time));}if(G.stage>=6)break;}
   out.push({run,stage:G.stage+1,lvAtStage:lv,weapons:G.weapons.length,pass:Object.keys(G.passives).length,over:G.over});console.log(JSON.stringify(out[out.length-1]));if(!G.over)endGame(false);}
  throw 'done';}
let bdT=0,lastEv='';{const tc=taleCleared,ta=taleAct,os=openScene,sh=show;taleCleared=()=>{lastEv+='|cleared@'+G.time.toFixed(1)+' modal='+modal;return tc();};taleAct=(i,h)=>{lastEv+='|act'+i;return ta(i,h);};openScene=(p,d)=>{lastEv+='|scene';return os(p,d);};show=id=>{if(G&&G.mode==='tale')lastEv+='|show:'+id;return sh(id);};}
const res=[];let t=performance.now();   // 판이 바뀌어도 시각은 앞으로만 간다
for(let run=0;run<RUNS;run++){
  bRec=null;lastEv='';bdT=0;taleStart(TALE);let dec=0,stuck=0,lastT=-1,dmg=[0,0,0],hp0=G.P.hp,actBoss=[null,null,null],maxLv=G.P.lvl;
  bRec=actBoss;bT0=null;const hurtSpy=()=>{if(G.P.hp<hp0)dmg[G.tale.act]+=hp0-G.P.hp;hp0=G.P.hp;};
  for(let i=0;i<60*60*20;i++){
    if(G.over)break;
    if(modal){if(!pick()){stuck++;if(stuck>200)break;}else stuck=0;hp0=G.P.hp;continue;}
    dec-=1/30;if(dec<=0){dec=0.1;steer();}
    t+=1000/30;frame(t);hurtSpy();maxLv=Math.max(maxLv,G.P.lvl);
    if(G.time===lastT&&!modal)stuck++;else stuck=0;lastT=G.time;if(stuck>300)break;
    if(G.bossDone&&G.clearT===undefined&&!modal&&!G.over){bdT=(bdT||0)+1/30;if(bdT>5){console.log('DONE-STUCK act='+G.tale.act+' time='+G.time.toFixed(1)+' boss='+!!G.boss+' q='+G.queue.join()+' scene='+(typeof scenePages)+' last='+lastEv);stuck=999;break;}}else bdT=0;
    if(G.st>600){console.log('ACT-STUCK act='+G.tale.act+' st='+G.st.toFixed(0)+' boss='+(G.boss&&G.boss.bossKind)+' bossDone='+G.bossDone+' clearT='+G.clearT+' R='+JSON.stringify(G.tale.R)+' en='+G.enemies.length+' kills='+G.kills+' items='+G.items.length+' grainItems='+G.items.filter(i=>i.k==='grain').length+' over='+G.over+' modal='+modal+' bossEn='+G.enemies.filter(e=>e.boss).map(e=>e.bossKind+(e.dead?'†':'')+(e.mid?'m':'')).join(','));stuck=999;break;}}
  const win=!!(G.over&&meta.tale.done[TALE]&&G.tale.time);
  if(!G.over)console.log('STUCK modal='+modal+' errN='+errN+' queue='+G.queue.join(','));
  res.push({run,win,time:+(G.time-G.tale.t0).toFixed(1),act:G.tale.act+1,boss:actBoss,dmg:dmg.map(Math.round),maxHp:Math.round(G.P.maxHp),lvl:maxLv,tier:G.P.tier,stuck:!G.over,kills:G.kills});
  console.log(JSON.stringify(res[res.length-1]));
  meta.tale.done={};}
const med=a=>{a=a.filter(x=>x!=null&&x>=0).sort((x,y)=>x-y);return a.length?a[a.length>>1]:null;};
const WINS=res.filter(r=>r.win);
console.log('SUMMARY '+JSON.stringify({tale:TALE,runs:RUNS,winRate:+(WINS.length/RUNS).toFixed(2),medTime:med(WINS.map(r=>r.time)),medBoss:[0,1,2].map(i=>med(res.map(r=>r.boss[i]))),medDmg:[0,1,2].map(i=>med(res.map(r=>r.dmg[i]))),medLvl:med(res.map(r=>r.lvl)),failAct:res.filter(r=>!r.win).map(r=>r.act),stuck:res.filter(r=>r.stuck).length,errs:errs+errN}));
