// v19.4 새 검토자 지적(심각 1 · 중요 5) — 고치기 전에 실패해야 함
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const set=(st,mode)=>{newGame('seonbi',null,0,'normal',mode||'normal');G.queue.length=0;show(null);G.stage=st;G.midDone=true;G.mid=null;G.enemies.length=0;G.weapons.length=0;G.P.hp=G.P.maxHp=1e9;};
const step=(n,each)=>{for(let i=0;i<n;i++){G.P.hp=G.P.maxHp;G.P.xp=0;G.queue.length=0;if(modal)show(null);G.eliteT=999;G.spawnT=999;G.potT=999;if(each)each(i);update(1/60);}};
{   /* 전역 이름(b·c·d 등)과 겹치지 않게 한 묶음 안에 */
// ① 심각: 실제처럼(무적을 지우지 않고) 서 있어도 객귀가 실제로 들러붙는다(5초 안)
set(0);spawnElite();const g=G.enemies.find(x=>x.elite);g.x=G.P.x+40;g.y=G.P.y;let clung=false;step(300,()=>{if(g.clT>0&&playerMoveMul()<0.99)clung=true;});ok(clung,'객귀가 실제 판에서 들러붙음');
// ② 중요: 들러붙은 객귀가 쓰러지면 느려짐도 바로 풀림 · 다음 막으로 넘어가도 남지 않음
set(0);spawnElite();const g2=G.enemies.find(x=>x.elite);g2.x=G.P.x+40;g2.y=G.P.y;step(300,()=>{});let k=false;for(let i=0;i<400&&!k;i++){step(1);if(g2.clT>0){kill(g2);k=true;}}
step(2);ok(k&&Math.abs(playerMoveMul()-1)<1e-9,'객귀가 쓰러지면 느려짐 풀림 '+playerMoveMul());
G.P.clingT=2;nextStage();ok(!(G.P.clingT>0),'다음 막에 느려짐 남지 않음');
// ③ 중요: 얼린 엘리트는 행동하지 않음(범 도약·길달 순간이동)
set(2);spawnElite();const b=G.enemies.find(x=>x.elite);b.x=G.P.x+60;b.y=G.P.y;b.inv=true;b.pT=0;step(5);const bx=b.x,by=b.y;b.frz=5;step(120,()=>{b.frz=5;});ok(Math.hypot(b.x-bx,b.y-by)<1,'얼린 범은 도약하지 않음 '+Math.hypot(b.x-bx,b.y-by).toFixed(1));
set(4);spawnElite();const d=G.enemies.find(x=>x.elite);d.x=G.P.x+100;d.y=G.P.y;d.inv=true;d.frz=9;const dx0=d.x;step(500,()=>{d.frz=9;});ok(Math.abs(d.x-dx0)<1,'얼린 길달은 순간이동하지 않음');
// ④ 중요: 웅크리던 범이 쓰러지면 덮치는 피해도 없음
set(2);spawnElite();const c=G.enemies.find(x=>x.elite);c.x=G.P.x+60;c.y=G.P.y;c.pT=0;G.P.maxHp=G.P.hp=1000;step(3);let crouched=c.eact==='crouch';kill(c);
let dmg=0;for(let i=0;i<120;i++){G.queue.length=0;if(modal)show(null);G.eliteT=999;G.spawnT=999;G.P.iframe=0;const h=G.P.hp;update(1/60);dmg+=Math.max(0,h-G.P.hp);}ok(crouched&&dmg===0,'쓰러진 범은 덮치지 않음 '+dmg);
// ⑤ 중요: 도감 화면 카드 수 = 도감 수(보조물 카드 없음)
let cards=0;{const h=(()=>{openCodex('title');codexTab='dogam';renderCodex();return $('#codexBody').innerHTML;})();cards=(h.match(/<div class="(unk)?"><img/g)||[]).length;}ok(cards===DOGAM_IDS.length,'도감 카드 '+cards+' = '+DOGAM_IDS.length);
// ⑥ 결정: 설화 출정은 막의 기존 엘리트 그대로(이야기 막의 짜임을 바꾸지 않음)
{const tid=TALE_IDS[0];meta.tale.frag[tid]=3;taleStart(tid);G.queue.length=0;show(null);ok(pickEliteId()===curStg().elite,'설화 출정은 기존 엘리트 '+pickEliteId());}
// 사소(같이 고침): 보조물은 변종이 되지 않음 · 도움말 막 표에 새 엘리트
set(1);G.curse=10;G.loop=3;const r0=Math.random;Math.random=()=>0.001;let vr=false;try{for(let i=0;i<20;i++){const h=spawnEnemy('juknyeo');if(h.vr)vr=true;}}finally{Math.random=r0;}ok(!vr,'대통 여인은 변종 안 됨');
meta.seen.gaekgwi={s:1,k:1};meta.seen.gildal={s:1,k:1};openHelp('title');helpTab='foe';renderHelp();const hh=$('#helpBody').innerHTML;ok(/객귀/.test(hh)&&/길달/.test(hh),'도움말 막 표에 새 엘리트');
}
if(fails.length){console.log('FAIL elite2_fix\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS elite2_fix');
