// v22.1 견습 기절: 원 밖이면 치료가 멈추고(줄지 않음), 안에서 5초면 체력 50%로 일어남. 한 막 세 번째 기절은 숨겨 주기(피해 0) → 다음 막에 가득·0번.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
{
if(typeof apStart!=='function'){ok(false,'apStart 없음');}else{
newGame('seonbi','gilil',0,'normal','normal');show(null);god();G.north=true;G.stage=10;G.enemies.length=0;G.st=10;apStart('boy');
const A=G.ap;const tick=s=>{for(let k=0;k<Math.round(s*60);k++){step(1/60);G.enemies.length=0;G.ebul.length=0;G.warns=[];G.ezones=[];}};
apHit(9999);ok(A.down&&A.downs===1&&A.hp===0,'체력 0 → 기절 1번');
A.x=G.P.x+200;A.y=G.P.y;tick(1);ok(A.rev===0,'원 밖이면 치료 안 참 ('+A.rev+')');
A.x=G.P.x+5;A.y=G.P.y;tick(2.5);const r1=A.rev;ok(r1>0.4&&r1<0.6,'안에서 2.5초 → 절반 ('+r1.toFixed(2)+')');
A.x=G.P.x+200;tick(1);ok(Math.abs(A.rev-r1)<1e-6,'밖으로 나가면 멈춤(줄지 않음)');
A.x=G.P.x+5;tick(2.7);ok(!A.down&&Math.abs(A.hp-A.maxHp*0.5)<1,'5초 → 체력 50%로 일어남');
apHit(9999);A.x=G.P.x+5;A.y=G.P.y;tick(5.2);apHit(9999);ok(A.downs===3&&A.hidden,'세 번째 기절 → 숨겨 주기');
const hp=A.hp;apHit(50);ok(A.hp===hp,'숨은 동안 피해 없음');
let shots=0;const hb=hurt;hurt=function(){if(HSRC&&/^ap:/.test(HSRC))shots++;return hb.apply(this,arguments);};spawnEnemy(STAGES[10].early[0],G.P.x+10,G.P.y);for(let k=0;k<120;k++)step(1/60);hurt=hb;ok(shots===0,'숨은 동안 공격 없음');
nextStage();ok(!A.hidden&&!A.down&&A.downs===0&&A.hp===A.maxHp,'다음 막: 나타남·0번·체력 가득');
// 맞은 뒤 무적
apHit(10);const h2=A.hp;apHit(10);ok(A.hp===h2,'맞은 뒤 잠깐 무적');
}
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS ap_down');
if(fails.length)process.exitCode=1;
