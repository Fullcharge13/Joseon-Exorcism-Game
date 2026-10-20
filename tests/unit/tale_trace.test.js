// 본편의 설화 흔적: 관련 막에서 조각이 3개 미만일 때만 한 번 나타나고, 2.5초 조사하면 조각 하나를 준다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const stand=(sec)=>{for(let i=0;i<Math.round(sec*60);i++){G.P.x=G.trace.x;G.P.y=G.trace.y;updTrace(1/60);if(!G.trace)break;}};
meta.tale.frag={woochi:0,jiha:0,bari:0};meta.tale.done={};
for(let k=0;k<30;k++){newGame('seonbi','gilil',0,'normal');
  if(!(G.traceAt>=25&&G.traceAt<=85)){fails.push('흔적 시각은 25~85초 (지금 '+G.traceAt+')');break;}
  if(G.anomAt!==undefined&&Math.abs(G.traceAt-G.anomAt)<15){fails.push(`괴이(${G.anomAt})와 15초 이상 떨어져야 함 (흔적 ${G.traceAt})`);break;}}
ok(G.traceId==='woochi','제1막의 흔적은 전우치전');
nextStage();ok(G.traceAt===undefined,'흔적이 없는 막(제2막)에는 예약 없음');
// 퇴마 원정 · 끝없는 밤 두 바퀴째에는 없음
newGame('seonbi','gilil',0,'normal','rush');ok(G.traceAt===undefined,'퇴마 원정에는 흔적 없음');
newGame('seonbi','gilil',0,'normal');G.loop=1;G.stage=-1;nextStage();ok(G.traceAt===undefined,'끝없는 밤 두 바퀴째에는 흔적 없음');
// 조각 3개면 없음
meta.tale.frag.woochi=3;newGame('seonbi','gilil',0,'normal');ok(G.traceAt===undefined,'조각이 다 모인 설화는 흔적 없음');
// 조사
meta.tale.frag.woochi=0;newGame('seonbi','gilil',0,'normal');show(null);
G.st=G.traceAt;updTrace(1/60);ok(G.trace&&G.trace.id==='woochi','예약 시각에 흔적이 나타남');
const tr=G.trace;const o={x:tr.x,y:tr.y,r:10};pushOut(o,10);ok(Math.hypot(o.x-tr.x,o.y-tr.y)<2,'장애물 속에 생기지 않음');
G.P.x=tr.x+100;G.P.y=tr.y;for(let i=0;i<120;i++)updTrace(1/60);ok(G.trace&&meta.tale.frag.woochi===0,'멀리 있으면 조사되지 않음');
stand(1.0);ok(G.trace&&meta.tale.frag.woochi===0,'1초로는 부족');
stand(2.0);ok(!G.trace&&meta.tale.frag.woochi===1,'2.5초 머물면 조각 하나 (지금 '+meta.tale.frag.woochi+')');
ok(modal==='scene'&&/설화 조각 1\/3/.test($('#sceneEye').textContent),'장면 창에 「설화 조각 1/3」');
ok($('#sceneText').textContent===TALES.woochi.frags[0].t,'첫 조각 글');
ok(G.traceAt===undefined,'한 막에 한 번만');
armUntil=0;sceneNext();
// 저장에 남음
ok(JSON.parse(localStorage.getItem(SAVE_KEY)).tale.frag.woochi===1,'조각은 바로 저장됨');
// 세 번째 조각 → 열림 알림 두 곳
meta.tale.frag.woochi=2;newGame('seonbi','gilil',0,'normal');show(null);G.st=G.traceAt;updTrace(1/60);__els['#ach'].children=[];let note=null;__els['#ach'].appendChild=d=>{note=d;};
stand(2.6);ok(meta.tale.frag.woochi===3,'세 번째 조각');
ok(/설화 출정 『전우치전』이 열렸다/.test($('#sceneFoot').textContent),'장면 창 끝 알림 (지금 '+$('#sceneFoot').textContent+')');
ok(note&&/전우치전/.test(note.innerHTML),'과업 알림 자리에도 알림');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS tale_trace');
if(fails.length)process.exitCode=1;
