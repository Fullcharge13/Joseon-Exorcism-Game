// 시간 나누기(v20.2): 느린 기기(한 장면이 1/30초보다 길 때)에서도 게임 시간이 실제 시간만큼 흐른다.
// 긴 장면은 1/30초 이하 조각으로 나눠 update를 여러 번 부른다. 한 장면은 0.25초까지만 따라잡는다(멈췄다 돌아온 경우).
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const about=(a,b,e=0.02)=>Math.abs(a-b)<=e;
// fps로 sec초 동안 frame을 부르고 흐른 게임 시간을 돌려준다(레벨업 창은 바로 고름, 쓰러지지 않게)
function play(fps,sec,seed=7){
  newGame('seonbi',[],0,'normal','normal',seed);document.hidden=true;
  let t=1000;last=t;const t0=G.time;let steps=0;const u0=update;update=d=>{steps++;ok(Math.abs(d-1/60)<1e-12,`진행 한 번 ${d.toFixed(5)}초 = 1/60초(v20.3)`);return u0(d);};
  try{for(let i=0;i<Math.round(fps*sec);i++){if(modal==='levelup')pickOpt(0);G.P.hp=G.P.maxHp;t+=1000/fps;frame(t);}}
  finally{update=u0;document.hidden=false;}
  return {time:G.time-t0,steps};}
const f60=play(60,5),f30=play(30,5),f10=play(10,5),f5=play(5,5),f2=play(2,5);
const f144=play(144,5);
ok(about(f60.time,5),`60fps 5초 → 게임 ${f60.time.toFixed(3)}초`);
ok(about(f144.time,5)&&f144.steps<=301,`144fps 5초 → 게임 ${f144.time.toFixed(3)}초, 진행 ${f144.steps}번(장면마다 0~1번, v20.3)`);
// v20.3: 긴 판에서 부동소수가 쌓여도 진행 횟수가 어긋나지 않음
{newGame('seonbi',[],0,'normal','normal',7);show(null);document.hidden=true;const u0=update;let n=0;update=()=>{n++;};let t=1000;last=t;   /* 게임은 돌리지 않고 진행 횟수만 셈(창에 막히지 않게) */
 try{for(let i=0;i<60*600;i++){t+=1000/60;frame(t);}}finally{update=u0;document.hidden=false;}
 ok(Math.abs(n-36000)<=1,`60fps 600초 → 진행 ${n}번(36,000)`);
 n=0;update=()=>{n++;};t=1000;last=t;try{for(let i=0;i<144*600;i++){t+=1000/144;frame(t);}}finally{update=u0;}
 ok(Math.abs(n-36000)<=1,`144fps 600초 → 진행 ${n}번(36,000)`);}
// v20.3: 화면을 떠났다 돌아오면 모아 둔 시간을 버림
newGame('seonbi',[],0,'normal','normal',7);last=1000;frame(1000+1000/144);const ACC=()=>typeof stepAcc==='undefined'?undefined:stepAcc;ok(ACC()>0,'1/144초 장면 뒤 모아 둔 시간이 있음 ('+ACC()+')');
if(typeof onVisibility==='function')onVisibility();ok(ACC()===0,`화면을 떠났다 오면 모아 둔 시간 0 (${ACC()})`);
ok(about(f30.time,5)&&Math.abs(f30.steps-300)<=1,`30fps 5초 → 게임 ${f30.time.toFixed(3)}초, 진행 ${f30.steps}번(장면마다 2번, v20.3)`);
ok(about(f10.time,5),`10fps 5초 → 게임 ${f10.time.toFixed(3)}초 (예전에는 2.5초로 느려짐)`);
ok(about(f5.time,5),`5fps 5초 → 게임 ${f5.time.toFixed(3)}초`);
ok(about(f2.time,2.5),`2fps(장면 0.5초)는 장면마다 0.25초까지만 → 게임 ${f2.time.toFixed(3)}초`);
// 창이 열리면 남은 조각은 버린다(레벨업 창 뒤로 시간이 더 흐르지 않음)
newGame('seonbi',[],0,'normal','normal',7);document.hidden=true;let tt=1000;last=tt;
G.P.xp=G.P.next-0.001;G.gems.push({x:G.P.x,y:G.P.y,v:5,k:'xp'});
const u1=update;let after=0;update=d=>{const r=u1(d);if(modal)after++;return r;};
try{tt+=200;frame(tt);}finally{update=u1;document.hidden=false;}
ok(modal==='levelup',`그 장면에서 레벨업 창이 열림 (${modal})`);
ok(after<=1,`창이 열린 뒤 update ${after}번(그 장면에서 멈춤)`);
console.log(fails.length?'FAIL timestep | '+[...new Set(fails)].join(' | '):'PASS timestep');
if(fails.length)process.exitCode=1;
