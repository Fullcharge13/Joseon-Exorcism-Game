// 설화 흔적 조사를 마치는 바로 그 걸음에 보물 상자를 주워도, 조각 장면 창이 상자 창에 덮이지 않는다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
meta.tale.frag={woochi:2,jiha:0,bari:0};
newGame('seonbi','gilil',0,'normal');step(1);god();G.queue.length=0;G.enemies.length=0;
G.traceId='woochi';spawnTrace();ok(!!G.trace,'흔적 생김');
G.P.x=G.trace.x;G.P.y=G.trace.y;G.trace.prog=G.trace.need-0.001;dropItem('chest',G.P.x,G.P.y);
step(1/60,{pick:false});
ok(meta.tale.frag.woochi===3,'조각 3');
ok(modal==='scene'&&/3\/3/.test($('#sceneEye').textContent),'조각 장면이 열려 있음 (지금 '+modal+')');
armUntil=0;sceneNext();step(1/60,{pick:false});
ok(modal==='chest','장면을 닫으면 상자는 그다음에 열림 (지금 '+modal+')');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS trace_overlap');
if(fails.length)process.exitCode=1;
