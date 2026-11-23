// v22.1 조정 3: 견습은 보스 초당 상한을 퇴마사와 따로 가진다(Lv·댕기에 따라 퇴마사 상한의 10%~). 퇴마사가 상한을 다 써도 견습 피해는 들어간다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
{
if(typeof apStart!=='function'){ok(false,'apStart 없음');}else{
newGame('jangsu','gilil',0,'normal','normal');show(null);god();G.north=true;G.stage=10;G.enemies.length=0;apStart('girl');
spawnBoss(STAGES[10].boss,false);const b=G.boss;b.hp=b.maxHp=100000;
hurt(b,1e9,0,0,0,true);const afterP=b.hp;ok(100000-afterP<=b.maxHp*BOSS_CAP+1,'퇴마사 상한 '+(100000-afterP));
HSRC='ap:saechong';hurt(b,1e9,0,0,0,true);HSRC=null;const apD=afterP-b.hp;
ok(apD>0,'퇴마사가 상한을 다 써도 견습 피해 들어감 ('+apD+')');
ok(Math.abs(apD-b.maxHp*BOSS_CAP*0.1)<=2,'견습 Lv1 상한 = 퇴마사 상한의 10% ('+apD+')');
HSRC='ap:saechong';hurt(b,1e9,0,0,0,true);HSRC=null;ok(afterP-b.hp===apD,'같은 1초 안엔 더 안 들어감');
G.ap.w.lv=5;G.ap.p={id:'daenggi',lv:5};ok(Math.abs(apBossCapF()-0.1*2*1.6)<1e-9,'Lv5·댕기5 → 0.32 ('+apBossCapF()+')');
// 보스전 조력자: 보스가 사거리 안이면 보스를 먼저 노림(졸개가 더 가까워도)
for(const kid of ['boy','girl']){
 newGame('jangsu','gilil',0,'normal','normal');show(null);god();G.north=true;G.stage=10;G.enemies.length=0;G.weapons=[];apStart(kid);
 spawnBoss(STAGES[10].boss,false);const bb=G.boss;bb.hp=bb.maxHp=1e9;bb.spd=0;bb.x=G.P.x+40;bb.y=G.P.y;
 const m=spawnEnemy(STAGES[10].early[0],G.ap.x+6,G.ap.y);m.hp=m.maxHp=1e9;m.spd=0;
 let tb=0,tm=0;const f0=apFire;apFire=function(A,tg){if(tg===bb)tb++;else tm++;return f0.apply(this,arguments);};
 for(let k=0;k<6*60;k++){step(1/60);G.P.hp=G.P.maxHp;bb.x=G.P.x+40;bb.y=G.P.y;}apFire=f0;
 ok(tb>0&&tb>=tm,kid+' 보스를 먼저 노림 (보스 '+tb+' · 졸개 '+tm+')');
}
}
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS ap_boss');
if(fails.length)process.exitCode=1;
