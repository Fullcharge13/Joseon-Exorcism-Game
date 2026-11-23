// v22.1 견습 무기 6종이 저마다 요괴를 때리고(출처 ap:id 기록), 보스 초당 상한을 지킨다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
{
if(typeof apStart!=='function'){ok(false,'apStart 없음');}else{
const ids=['mokgeom','dorikkae','jangdae','saechong','daehwal','mulchong'];
ok(ids.every(id=>AWD[id])&&Object.keys(APD).length===4,'무기 6 · 보패 4');
for(const id of ids){
  newGame('jangsu','gilil',0,'normal','normal');show(null);god();G.north=true;G.stage=10;G.enemies.length=0;G.st=10;
  apStart(AWD[id].kid);G.ap.w={id,lv:3};G.ap.x=G.P.x;G.ap.y=G.P.y;
  for(let i=0;i<10;i++){const e=spawnEnemy(STAGES[10].early[0],G.P.x+20+i*4,G.P.y+(i%3)*6-6);e.hp=e.maxHp=1e6;e.spd=0;}
  G.rs.dmg={};let err=null;try{for(let k=0;k<5*60;k++){step(1/60);G.spawnT=99;}}catch(x){err=x;}
  ok(!err,id+' 오류 없음 '+(err&&err.message));
  ok((G.rs.dmg['ap:'+id]||0)>0,id+' 피해 기록 '+Math.round(G.rs.dmg['ap:'+id]||0));
}
// 보스 상한: 견습 피해도 hurt를 거침
newGame('jangsu','gilil',0,'normal','normal');show(null);god();G.north=true;G.stage=10;G.enemies.length=0;apStart('boy');G.ap.w={id:'mokgeom',lv:5};
spawnBoss(STAGES[10].boss,false);const b=G.boss;b.x=G.P.x+15;b.y=G.P.y;b.spd=0;const h0=b.hp;
G.rs.dmg={};for(let k=0;k<60;k++)step(1/60);
ok((G.rs.dmg['ap:mokgeom']||0)>0&&h0-b.hp<=b.maxHp*BOSS_CAP*1.05+1,'보스에게도 피해, 초당 상한 안');
}
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS ap_fight');
if(fails.length)process.exitCode=1;
