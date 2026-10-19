// 「다음 목표」 안내
//  nextGoals(n): 아직 못 이룬 과업 가운데 진행률(지금÷목표)이 높은 순으로 n개.
//    - 잠긴 퇴마사의 전용 과업은 빼고, 셋 가운데 한 칸은 퇴마사·무기 해금 과업으로 채운다.
//  runGoals(): 이번 출정에서 수치가 움직인 과업(전→후)과 이번에 이룬 과업.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const ids=a=>a.map(g=>g.t.id);
function fresh(stats,done){meta.stats=stats||{};meta.done=done||[];meta.unl=['char:seonbi'];meta.seen={};meta.anom={};G=null;}

ok(typeof nextGoals==='function','nextGoals 함수가 있어야 함');
ok(typeof runGoals==='function','runGoals 함수가 있어야 함');
if(typeof nextGoals==='function'&&typeof runGoals==='function'){

// 1) 진행률 순 + 해금 한 칸
fresh({kills:4500,mids:2,shrines:0,tavern:0});
// k5000 90%(엽전 아님: 산통) · c_jangsu 2/3=67%(장수 해금) · k1000/k100 은 이미 넘었으니 이룬 것으로 둔다
meta.done=['k100','k1000'];
let g=nextGoals(3);
ok(g.length===3,'셋을 골라야 함 (지금 '+g.length+')');
ok(g[0]&&g[0].t.id==='k5000','진행률이 가장 높은 「이름난 퇴마사」(4,500/5,000)가 첫째여야 함 → '+ids(g));
ok(g.some(x=>x.t.id==='c_jangsu'),'해금 과업 「장수의 부름」(2/3)이 들어가야 함 → '+ids(g));
ok(g.every(x=>!meta.done.includes(x.t.id)),'이룬 과업은 빠져야 함');
ok(g.every((x,i)=>i===0||x.ratio<=g[i-1].ratio||x.unlockSlot),'진행률 순(해금 칸 제외)이어야 함');

// 2) 해금 과업이 진행률로 셋 안에 못 들어도 한 칸은 해금 과업
fresh({kills:4900,pots:29,tteok:0,tavern:0,shrines:0,mids:0,maxStage:1},['k100','k1000']);
meta.stats.graze=99;meta.stats.combo=0;
g=nextGoals(3);
const un=g.filter(x=>x.t.rw.unlock&&/^(char|w):/.test(x.t.rw.unlock));
ok(un.length>=1,'해금 과업이 적어도 한 칸 있어야 함 → '+ids(g));

// 3) 잠긴 퇴마사 전용 과업은 나오지 않음 (선비만 열림)
fresh({kills_sangin:2999,kills_seonbi:10,tier_uiwon:0},['k100']);
g=nextGoals(10);
ok(!g.some(x=>/_(uiwon|mudang|jangsu|gisaeng|sangin)$/.test(x.t.key)||x.t.key==='evo:chim'),'잠긴 퇴마사의 과업이 나오면 안 됨 → '+ids(g));
meta.unl.push('char:sangin');g=nextGoals(3);
ok(g[0]&&g[0].t.id==='j_k_sangin','상인이 열리면 「셈이 맞는 장사」(2,999/3,000)가 첫째 → '+ids(g));

// 4) 모두 이루면 빈 목록
fresh({},TASKS.map(t=>t.id));meta.unl=Object.keys(CHARS).map(c=>'char:'+c);
ok(nextGoals(3).length===0,'모두 이루면 빈 목록이어야 함');

// 5) 이번 출정의 전→후, 이번에 이룬 과업
fresh({kills:950,mids:1},['k100']);
newGame('seonbi','gilil',0,'normal');
G.rs.kills=40;G.kills=40;G.rs.mids=1;
endGame(false);
const R=runGoals();
const m=Object.fromEntries(R.moved.map(x=>[x.t.id,x]));
ok(m.c_jangsu&&m.c_jangsu.from===1&&m.c_jangsu.to===2,'「장수의 부름」은 1 → 2 (지금 '+JSON.stringify(m.c_jangsu&&[m.c_jangsu.from,m.c_jangsu.to])+')');
ok(m.k1000&&m.k1000.from===950&&m.k1000.to===990,'「손에 익은 퇴마」는 950 → 990');
ok(R.moved[0]&&R.moved[0].t.id==='k1000','움직인 과업도 진행률 순(990/1,000이 첫째) → '+ids(R.moved));
ok(R.moved.length<=3,'움직인 과업은 셋까지');
ok(R.done.length===0,'이번에 이룬 과업은 없어야 함');
// 이번에 이룸
fresh({kills:990},['k100']);
newGame('seonbi','gilil',0,'normal');G.rs.kills=20;G.kills=20;endGame(false);
const R2=runGoals();
ok(R2.done.some(t=>t.id==='k1000'),'1,000마리를 넘기면 「손에 익은 퇴마」가 이번에 이룬 과업에 있어야 함');
ok(!R2.moved.some(x=>x.t.id==='k1000'),'이룬 과업은 움직인 목록에 겹쳐 나오면 안 됨');

// 6) 결과 화면 글: 「지금 → 바뀐 뒤」와 보상, 퇴마록 바로가기
const html=goalsHTML(R);
ok(/1\/3 → 2\/3/.test(html),'결과 화면에 「1/3 → 2/3」이 보여야 함');
ok(/950 → 990 \/ 1,000/.test(html),'큰 수는 쉼표와 함께 「950 → 990 / 1,000」');
ok(html.includes('장수 해금')&&html.includes('의원 해금'),'보상 글이 보여야 함');
ok(html.includes('goalsMore'),'퇴마록 바로가기가 있어야 함');
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS next_goals');
if(fails.length)process.exitCode=1;
