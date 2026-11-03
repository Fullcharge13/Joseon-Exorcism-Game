// 시간 나누기(v20.2): 느린 기기(한 장면이 1/30초보다 길 때)에서도 게임 시간이 실제 시간만큼 흐른다.
// 긴 장면은 1/30초 이하 조각으로 나눠 update를 여러 번 부른다. 한 장면은 0.25초까지만 따라잡는다(멈췄다 돌아온 경우).
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const about=(a,b,e=0.02)=>Math.abs(a-b)<=e;
// fps로 sec초 동안 frame을 부르고 흐른 게임 시간을 돌려준다(레벨업 창은 바로 고름, 쓰러지지 않게)
function play(fps,sec,seed=7){
  newGame('seonbi',[],0,'normal','normal',seed);document.hidden=true;
  let t=1000;last=t;const t0=G.time;let steps=0;const u0=update;update=d=>{steps++;ok(d<=1/30+1e-9,`한 조각 ${d.toFixed(4)}초 ≤ 1/30초`);return u0(d);};
  try{for(let i=0;i<Math.round(fps*sec);i++){if(modal==='levelup')pickOpt(0);G.P.hp=G.P.maxHp;t+=1000/fps;frame(t);}}
  finally{update=u0;document.hidden=false;}
  return {time:G.time-t0,steps};}
const f60=play(60,5),f30=play(30,5),f10=play(10,5),f5=play(5,5),f2=play(2,5);
ok(about(f60.time,5),`60fps 5초 → 게임 ${f60.time.toFixed(3)}초`);
ok(about(f30.time,5)&&f30.steps<=150+2,`30fps 5초 → 게임 ${f30.time.toFixed(3)}초, 조각 ${f30.steps}(장면마다 1번)`);
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
