// 씨앗 난수(v20.1): 같은 씨앗이면 그리기 여부·기기 빠르기와 상관없이 판이 똑같이 흘러간다.
// (절약 모드는 요괴 수 상한 CAP.e를 300→200으로 낮추는 설계라 판이 달라질 수 있다 — 같은 모드끼리만 같다. 화면 크기도 등장 거리를 바꾼다)
// 그리기·소리·잔상(파티클)처럼 보이기만 하는 것은 따로 된 난수를 써서 판의 난수를 건드리지 않아야 한다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
function pick(){
  if(modal==='levelup')return pickOpt(0),1;
  if(modal==='adv'&&advPick.length)return advPick[0](),1;
  if(modal==='bless'&&blessPick.length)return blessPick[0](),1;
  if(modal==='petpick'&&petPick.length)return petPick[0](),1;
  if(modal==='pick'&&pickFns.length)return pickFns[0](),1;
  if(modal==='chest')return $('#chestOk').onclick(),1;
  if(modal==='tavern')return $('#tavGo').onclick(),1;
  if(modal==='scene')return sceneNext(),1;
  return 0;}
// opts.draw: 매 장면 그림 · opts.step: performance.now 한 번에 흐르는 ms(기기 빠르기) · opts.low: 절약 모드
const META0=JSON.stringify(meta);   // 판에서 얻은 과업·엽전·해금이 다음 판에 이어지지 않게 매번 처음 저장으로
function run(seed,opts){
  meta=JSON.parse(META0);
  const pn=performance.now;let wall=0;performance.now=()=>(wall+=opts.step);
  meta.set.perf=opts.low?'low':'high';autoLow=false;applyPerf();document.hidden=!opts.draw;
  try{
    newGame('seonbi',['gilil'],2,'normal','normal',seed);
    let t=1000;last=t;
    for(let i=0;i<30*90&&!G.over;i++){
      if(modal){if(!pick())break;continue;}
      G.P.hp=G.P.maxHp;G.P.x=Math.sin(i/40)*60;G.P.y=Math.cos(i/55)*40;   // 쓰러지지 않게 · 같은 길로 걷기
      t+=1000/30;frame(t);}
    return JSON.stringify({seed:G.seed,time:+G.time.toFixed(4),kills:G.kills,coins:G.coins,lvl:G.P.lvl,xp:G.P.xp,stage:G.stage,
      weapons:G.weapons.map(w=>[w.id,w.lvl]),passives:G.passives,bless:G.bless,
      enemies:G.enemies.map(e=>[e.kind,Math.round(e.x*1000),Math.round(e.y*1000),Math.round(e.hp*1000)]),
      gems:G.gems.length,items:G.items.map(it=>it.k)});
  }finally{performance.now=pn;document.hidden=false;}}
const ra=run(12345,{draw:true,step:1,low:false});
const rb=run(12345,{draw:false,step:100,low:false});
const rl=run(12345,{draw:false,step:100,low:true}),rl2=run(12345,{draw:true,step:1,low:true});   // 절약 모드끼리
const rc=run(777,{draw:true,step:1,low:false});
const A=JSON.parse(ra),B=JSON.parse(rb);
ok(A.seed===12345,'G.seed에 씨앗이 남음 ('+A.seed+')');
ok(A.kills>20&&A.time>60,`판이 실제로 흘러감 (처치 ${A.kills}, ${A.time}초)`);
ok(ra===rb,'같은 씨앗 → 그림·빠르기가 달라도 같은 판'+(ra===rb?'':` (처치 ${A.kills}/${B.kills}, 요괴 ${A.enemies.length}/${B.enemies.length}, 레벨 ${A.lvl}/${B.lvl})`));
ok(rl===rl2,'절약 모드끼리도 그림·빠르기와 상관없이 같은 판');
ok(ra!==rc,'다른 씨앗 → 다른 판');
// 씨앗을 주지 않으면 판마다 새 씨앗
newGame('seonbi',[],0,'normal','normal');const s1=G.seed;newGame('seonbi',[],0,'normal','normal');
ok(Number.isInteger(s1)&&s1!==G.seed,'씨앗 없이 시작하면 판마다 다른 씨앗 ('+s1+', '+G.seed+')');
console.log(fails.length?'FAIL rng_det | '+fails.join(' | '):'PASS rng_det');
if(fails.length)process.exitCode=1;
