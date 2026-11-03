// v19.7: 제5막 손각시가 쏘는 요괴가 됨(5막에만 쏘는 요괴가 없어 4막보다 쉬웠음)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
{
ok(EN.songaksi.ai==='shoot','손각시 ai = shoot (본 값 '+EN.songaksi.ai+')');
ok(/출처: 한국민족문화대백과사전 「손각시」/.test(EN.songaksi.d)&&/게임 속 각색/.test(EN.songaksi.d),'도감 설명에 출처·각색 표시');
ok(EN.songaksi.hp===30&&EN.songaksi.spd===26&&EN.songaksi.dmg===10,'체력·속도·피해 그대로');
// 다른 막 구성 그대로: 쏘는 요괴가 있는 막
const sh=STAGES.map((s,i)=>[...s.early,...s.late].some(id=>EN[id].ai==='shoot')?i+1:0).filter(Boolean);
ok(JSON.stringify(sh)==='[3,4,5,6,8,10]','쏘는 요괴가 있는 막 '+JSON.stringify(sh));
// 실제로 쏨: 5막, 퇴마사 120 떨어진 곳 손각시 하나 → 2.8초 간격
newGame('seonbi',null,0,'normal');G.queue.length=0;show(null);G.stage=4;G.enemies.length=0;G.weapons.length=0;G.P.hp=G.P.maxHp=1e9;
const e=spawnEnemy('songaksi',G.P.x+120,G.P.y,{novr:1});let shots=[];   /* 속도 0이면 행동도 멈추므로 자리는 매 프레임 고정 */
for(let i=0;i<60*12;i++){G.P.hp=G.P.maxHp;G.P.xp=0;G.queue.length=0;if(modal)show(null);G.eliteT=999;G.spawnT=999;G.potT=999;const n=G.ebul.length;e.x=G.P.x+120;e.y=G.P.y;update(1/60);if(G.ebul.length>n)shots.push(i/60);}
const gaps=shots.slice(1).map((t,i)=>t-shots[i]);
ok(shots.length>=3&&gaps.every(g=>Math.abs(g-2.8)<0.1),'2.8초마다 쏨 '+gaps.map(g=>g.toFixed(2)));
}
if(fails.length){console.log('FAIL songaksi_shoot\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS songaksi_shoot');
