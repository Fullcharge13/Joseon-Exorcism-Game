// 설화 막 규칙 9가지: 효과와 보스가 나오는 조건(값은 설계 3-2).
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
meta.tale.frag={woochi:3,jiha:3,bari:3};
const tick=(sec,f)=>{for(let i=0;i<Math.round(sec*60);i++){if(f)f();__t+=1000/60;if(modal)autoPick();frame(__t);}};
function goAct(id,i){taleStart(id);step(3);for(let a=0;a<i;a++){G.tale.force=true;god();step(TALE_T+1);killBoss();for(let k=0;k<600&&G.tale.act===a;k++)step(1/60);}ok(G.tale.act===i,id+' '+(i+1)+'막에 들어감 (지금 '+(G.tale.act+1)+'막)');/* 보스 뒤 레벨업 창이 먼저 뜰 수 있어 창은 골라 넘기고, 다음 막이 될 때까지 */G.tale.force=false;god();G.P.regen=0;G.enemies.length=0;}
// 전우치 1막: 전우치가 막 내내 곁에
goAct('woochi',0);tick(60);ok(G.helper,'jwAlly: 60초 뒤에도 전우치가 곁에 있음');
// 전우치 2막: 곡식 20섬
goAct('woochi',1);ok(G.tale.act===1,'2막');
G.st=TALE_T+1;tick(0.5);ok(!G.boss,'grain: 20섬 전에는 보스 없음');
for(let i=0;i<300;i++){const e=spawnEnemy('dungap',G.P.x+200,G.P.y);kill(e);}
ok(G.items.some(it=>it.k==='grain')&&!G.items.some(it=>it.k==='tteok'),'grain: 떡 대신 곡식 섬이 떨어짐');
G.tale.R.grain=19;dropItem('grain',G.P.x,G.P.y);tick(0.3);ok(G.tale.R.grain===20,'grain: 주우면 하나 늘어남 (지금 '+G.tale.R.grain+')');
tick(0.5);ok(G.boss,'grain: 20섬이면 보스 등장');ok(/곡식/.test(taleRule().hud(G.tale.R)),'grain: 진행 글');
// 전우치 3막: 분신 그림자
goAct('woochi',2);tick(12);ok(G.enemies.some(e=>e.kind==='jwshade'),'clones: 도술 그림자가 섞여 나옴');
// 지하국 1막: 어두움
goAct('jiha',0);tick(1);ok(G.dark>0,'dark: 굴이 어두움');
// 지하국 2막: 힘내는 물
goAct('jiha',1);const W0=G.tale.R.well;ok(W0,'well: 우물이 있음');
tick(10,()=>{G.P.x=W0.x;G.P.y=W0.y;});ok(Math.abs(G.taleMight-0.6)<0.011,'well: 곁 10초 → +60%에서 멈춤 (지금 '+G.taleMight+')');
tick(3,()=>{G.P.x=W0.x+200;G.P.y=W0.y;});ok(Math.abs(G.taleMight-0.3)<0.03,'well: 떨어져 3초 → +30% (지금 '+G.taleMight+')');
{const P=G.P,m=P.might;G.taleMight=0.5;let seen=0;const w0=G.weapons.find(w=>w.id!==CHARS[G.cid].start&&!w.seals),d=WD[w0.id],u=d.upd;d.upd=(w,dt,PP)=>{seen=PP.might;};tick(1/60);d.upd=u;ok(Math.abs(seen/m-1.5)<0.01&&Math.abs(P.might-m)<1e-9,`well: 무기에만 잠깐 곱해지고 되돌아감 (무기 ${seen}, 원래 ${m}, 뒤 ${P.might})`);}
// 지하국 3막: 회복 아이템 없음
goAct('jiha',2);for(let i=0;i<400;i++){const e=spawnEnemy('jomagu',G.P.x+200,G.P.y);kill(e);}for(let i=0;i<60;i++)kill({prop:true,x:G.P.x+200,y:G.P.y});
ok(!G.items.some(it=>it.k==='tteok'),'noHeal: 떡이 나오지 않음');
{G.gems.length=0;G.queue.length=0;G.items.length=0;const h=G.P.maxHp;G.P.hp=h*0.5;G.P.regen=1;tick(1,()=>{G.gems.length=0;G.P.xp=0;G.P.regen=1;});/* 레벨업 고르기가 능력치를 다시 계산해 회복이 0이 되지 않게 */ok(G.P.hp>h*0.5,'noHeal: 초당 회복은 그대로');G.P.regen=0;}
// 바리 1막: 역병
goAct('bari',0);{G.gems.length=0;const P=G.P;P.maxHp=200;P.hp=200;tick(10);ok(P.hp<200&&P.hp>190,'plague: 초당 0.4% 잃음 (지금 '+P.hp.toFixed(1)+')');
 G.jw.cd20=G.jw.cd50=1e9;P.hp=2;G.mods.noTteok=true;tick(5,()=>{G.items.length=0;});G.mods.noTteok=false;/* 떡을 주우면 체력이 오르므로 막는다(같은 걸음에 떨어져 주워질 수 있음) */ok(P.hp>=1&&P.hp<1.05&&!G.over,'plague: 체력 1에서 멈춤 (지금 '+P.hp+' regen '+P.regen+')');}
// 바리 2막: 우물 셋을 차례로
goAct('bari',1);const WS=G.tale.R.wells;ok(WS&&WS.length===3,'wells3: 우물 셋');G.st=TALE_T+1;
tick(7,()=>{G.P.x=WS[1].x;G.P.y=WS[1].y;});ok(G.tale.R.wi===0,'wells3: 순서 밖 우물은 진행 안 함');
for(let k=0;k<3;k++)tick(6.2,()=>{G.P.x=WS[k].x;G.P.y=WS[k].y;});ok(G.tale.R.wi===3,'wells3: 차례로 6초씩 → 셋 (지금 '+G.tale.R.wi+')');
tick(0.5);ok(G.boss,'wells3: 셋 뒤 보스');
// 바리 3막: 꽃 세 송이
goAct('bari',2);G.st=TALE_T+1;for(let k=0;k<3;k++){tick(0.2);ok(!G.boss,`flowers: ${k}송이에서는 보스 없음`);const f=G.tale.R.fl;ok(f,'flowers: 꽃이 있음');if(!f)break;tick(0.3,()=>{G.P.x=f.x;G.P.y=f.y;});}
ok(G.tale.R.got===3,'flowers: 세 송이 (지금 '+G.tale.R.got+')');tick(0.5);ok(G.boss,'flowers: 세 송이 뒤 보스');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS tale_rules');
if(fails.length)process.exitCode=1;
