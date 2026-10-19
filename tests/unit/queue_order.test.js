// 보상 창 순서 (실제 프레임 함수 frame()으로 확인)
// 1) 대기열에 전직이 있으면 쌓인 레벨업 카드보다 전직 창이 먼저 뜬다.
// 2) 5차 전직이 늦게 열려도 그 사이 들어온 「오의 각성」이 일반 레벨업으로 바뀌어 사라지지 않는다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
let now=1000;performance.now=()=>now;
const step=()=>{now+=16;frame(now);};
const closeAll=()=>{show(null);};

// 1) 레벨 10에 이르렀는데 앞에 레벨업 카드 둘이 쌓여 있음
newGame('seonbi','gilil',0,'normal');G.P.lvl=10;
G.queue.length=0;G.queue.push('lvl','lvl','adv');modal=null;step();
ok(modal==='adv','쌓인 레벨업보다 전직 창이 먼저 떠야 함 (지금: '+modal+')');

// 2) 4차까지 마친 상태에서 레벨 54: 대기열에 [레벨업, 각성, 5차 전직] (5차 전직이 늦게 처리되는 경우)
newGame('seonbi','gilil',0,'normal');
for(let t=0;t<4;t++){G.P.lvl=(t+1)*10;openAdv();if(t===0){grantTier(0);petPick[0]();}else advPick[0]();}
closeAll();G.P.lvl=54;G.queue.length=0;G.queue.push('lvl','awk','adv');
const seen=[];
for(let i=0;i<8&&(G.queue.length||modal);i++){
 if(!modal){step();if(modal)seen.push(modal==='pick'?$('#pickEye').textContent:modal);continue;}
 if(modal==='adv')advPick[0]();else if(modal==='levelup')pickOpt(0);else if(modal==='pick')pickFns[0]();else closeAll();}
ok(G.P.tier===5,'5차 전직이 되어야 함 (지금 '+G.P.tier+'차) 본 창: '+seen.join(' → '));
ok(G.awkN===1,'오의 각성이 한 번 이루어져야 함 (지금 '+G.awkN+') 본 창: '+seen.join(' → '));

console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS queue_order');
if(fails.length)process.exitCode=1;
