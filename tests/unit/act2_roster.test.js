// v22.0 2부 요괴: 11~15막 칸의 모든 요괴가 표·그림에 있고, 보스·중간 보스는 혼자서도 퇴마사에게 피해를 주며,
// 엘리트2 행동이 저마다 효과를 낸다. 새 장판은 6초 넘게 남지 않는다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
{
const S2=STAGES.slice(10);
ok(S2.length===5,'2부 막 다섯');
for(const s of S2){
  for(const id of [...s.early,...s.late,s.elite,s.elite2,s.mid,s.boss])ok(EN[id]&&ESPR[id],s.sub+' '+id+' 표·그림');
  for(const id of [s.mid,s.boss])ok(BOSS[id]&&BOSS[id].skills.every(k=>BSK[k]),s.sub+' '+id+' 보스 기술');
  ok(EN[s.elite2]&&ELITE_AI[EN[s.elite2].eai],s.sub+' 엘리트2 행동 '+s.elite2);
  ok(/산해경/.test(EN[s.boss].d),s.sub+' 보스 설명에 출처');
}
ok(STAGE_VFX.length===15&&BOSS_HP.length===15,'막 분위기·보스 체력 15칸');
const setup=si=>{newGame('jangsu','gilil',0,'normal','normal');show(null);G.north=true;G.stage=si;G.st=STAGE_T+5;G.enemies.length=0;G.mods.dmgIn=0.05;G.P.iframe=0;};
let taken=0;const tick=()=>{const h=G.P.hp;step(1/60);taken+=Math.max(0,h-G.P.hp);G.P.hp=G.P.maxHp;G.P.iframe=0;};
let zMax=0;const zLife=()=>{for(const z of G.ezones)zMax=Math.max(zMax,z.max||z.life);};
for(let si=10;si<15;si++){
  const s=STAGES[si];
  for(const mid of [true,false]){
    setup(si);const id=mid?s.mid:s.boss;const e=spawnBoss(id,mid)||G.enemies.find(q=>q.kind===id);
    if(e){e.hp=e.maxHp=1e9;}
    taken=0;let err=null;
    try{for(let k=0;k<20*60&&!G.over;k++){tick();zLife();}}catch(x){err=x;}
    ok(!err,id+' 20초 오류 없음 '+(err&&err.message));
    ok(taken>0&&!G.over,id+' 20초 안에 피해를 줌 ('+taken.toFixed(0)+(G.over?' 쓰러짐':'')+')');
    if(!mid&&e){killBoss();try{step(1);}catch(x){ok(false,id+' 쓰러진 뒤 오류 '+x.message);}}
  }
  // 엘리트2
  setup(si);G.midDone=true;spawnElite();const el=G.enemies.find(q=>q.elite);
  ok(el&&el.kind===s.elite2,s.sub+' 중간 보스 뒤 엘리트는 '+s.elite2+' (지금 '+(el&&el.kind)+')');
  if(el){el.hp=el.maxHp=1e9;el.x=G.P.x+60;el.y=G.P.y;
    for(let i=0;i<6;i++)spawnEnemy(s.early[0],G.P.x+50+i*4,G.P.y+10);
    const sp0=G.enemies.filter(q=>!q.elite).map(q=>q.spd);
    taken=0;let slowed=0,hasted=0,err=null;
    try{for(let k=0;k<14*60;k++){tick();if(G.P.slowT>0)slowed++;if(G.enemies.some(q=>q.hasteT>0))hasted++;zLife();if(k%60===0){el.x=G.P.x+40;el.y=G.P.y;}}}catch(x){err=x;}
    ok(!err,s.elite2+' 오류 없음 '+(err&&err.message));
    const ai=EN[s.elite2].eai;
    if(ai==='puddle')ok(slowed>0,'영어 웅덩이에 느려짐');
    else if(ai==='warcry')ok(hasted>0,'주염 북돋움');
    else ok(taken>0,s.elite2+' 피해를 줌');
    if(ai==='warcry'){kill(el);step(5);ok(G.enemies.every(q=>!(q.hasteT>0)&&!q.haste0),'주염이 쓰러져도 북돋움은 풀림');}
  }
}
ok(zMax<=6,'새 장판은 6초 넘게 남지 않음 (지금 '+zMax+')');
// 물웅덩이: 피해 없이 느려짐만
setup(10);G.enemies.length=0;const hp1=G.P.hp;G.ezones.push({x:G.P.x,y:G.P.y,r:20,life:2,max:2,dmg:0,slow:1,col:'#3a7aa0'});step(0.5);
ok(G.P.hp===hp1&&G.P.slowT>0,'웅덩이: 피해 0 · 느려짐');
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS act2_roster');
if(fails.length)process.exitCode=1;
