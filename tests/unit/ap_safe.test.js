// v22.1 견습 내구(사용자 결정: 보스에게서 거리 두기 + 받는 피해 절반): 경고 장판에서 빠져나와 맞지 않고, 보스 몸에서 떨어져 있으며(보스가 나온 뒤 1초부터 잼), 받는 피해는 0.15배.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
{
if(typeof apStart!=='function'){ok(false,'apStart 없음');}else{
ok(AP_TAKE===0.15,'받는 피해 배율 0.15 (지금 '+AP_TAKE+')');
for(const kid of ['boy','girl']){
  newGame('jangsu','gilil',0,'normal','normal');show(null);god();G.north=true;G.stage=10;G.enemies.length=0;G.weapons=[];apStart(kid);
  const A=G.ap;A.x=G.P.x+10;A.y=G.P.y;step(0.2);
  warn({x:A.x,y:A.y,r:20,t:0.9,dmg:500,col:'#f00'});const hp=A.hp;
  for(let k=0;k<60;k++)step(1/60);
  ok(A.hp===hp&&!A.down,kid+' 경고 장판에서 빠져나와 맞지 않음 (체력 '+Math.round(A.hp)+'/'+Math.round(hp)+')');
  // 보스 곁 10초: 쓰러짐 1번 이하, 보스와 거리
  spawnBoss(STAGES[10].boss,false);const b=G.boss;b.hp=b.maxHp=1e9;let minD=1e9;
  for(let k=0;k<10*60;k++){step(1/60);b.x=G.P.x+30;b.y=G.P.y;G.P.hp=G.P.maxHp;const d=Math.hypot(A.x-b.x,A.y-b.y);if(!A.down&&k>=60)minD=Math.min(minD,d);}
  ok(A.downs<=1,kid+' 11막 보스 곁 10초 쓰러짐 1번 이하 (지금 '+A.downs+')');
  ok(minD>=b.r+8,kid+' 보스 몸과 거리 '+minD.toFixed(1)+' ≥ '+(b.r+8));
}
}
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS ap_safe');
if(fails.length)process.exitCode=1;
