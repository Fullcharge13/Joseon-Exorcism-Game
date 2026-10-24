// 멈춤 기록 장치(v17.3): 멈춤·창 없음·오류를 한 번씩만 기록, 20건까지, 저장 실패에도 안전, 지난 실행의 게임 중 끊김 판단.
// DIAG_SAVE=... WANT=unclean|hidden 로 「다시 켰을 때」 판단도 본다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
const want=process.env.WANT;
if(want==='unclean'){ok(DIAG.log.length===1&&/게임 중 끊김/.test(DIAG.log[0].kind)&&DIAG.log[0].st&&DIAG.log[0].st.stage===3,'지난 실행이 게임 중에 끝났으면 1건 ('+JSON.stringify(DIAG.log)+')');}
else if(want==='hidden'){ok(DIAG.log.length===0,'앱 전환으로 숨겨진 뒤 끝난 것은 기록하지 않음 ('+DIAG.log.length+')');}
else{
 ok(DIAG.log.length===0,'처음엔 기록 0');
 const kinds=()=>DIAG.log.map(e=>e.kind);
 // 진행 멈춤: 게임 시간이 흐르지 않음
 newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);god();
 const up0=update;update=function(){};step(5);update=up0;
 ok(kinds().filter(k=>k==='진행 멈춤').length===1,'진행 멈춤 1건 ('+kinds()+')');
 const e0=DIAG.log.find(e=>e.kind==='진행 멈춤');ok(e0&&e0.st&&e0.st.cid==='seonbi'&&e0.ver&&e0.at,'상태·버전·시각이 담김');
 update=function(){};step(10);update=up0;ok(kinds().filter(k=>k==='진행 멈춤').length===1,'같은 판에서는 다시 적지 않음');
 // 정지 창이 떠 있으면 멈춤이 아님
 const n0=DIAG.log.length;newGame('seonbi','gilil',0,'normal');G.queue.length=0;openPause();update=function(){};step(5,{pick:false});update=up0;show(null);
 ok(DIAG.log.length===n0,'정지 중에는 기록하지 않음');
 // 창 없음
 newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);modal='levelup';$('#levelup').hidden=true;
 for(let i=0;i<150;i++){__t+=1000/60;frame(__t);}modal=null;$('#levelup').hidden=false;
 ok(kinds().includes('창 없음'),'창 상태인데 보이는 창이 없으면 기록 ('+kinds()+')');
 // 그리기 오류: 반복돼도 한 번
 const r0=render;render=function(){throw new Error('그리기 시험 오류');};show(null);step(1,{pick:false});render=r0;
 const errs=DIAG.log.filter(e=>e.kind==='오류'&&/그리기 시험 오류/.test(e.msg));ok(errs.length===1,'그리기 오류 1건 ('+errs.length+')');
 // 페이지 오류
 for(const f of (__ev.error||[]))f({message:'페이지 시험 오류',filename:'index.html',lineno:1});
 for(const f of (__ev.unhandledrejection||[]))f({reason:new Error('약속 시험 거절')});
 ok(DIAG.log.some(e=>/페이지 시험 오류/.test(e.msg))&&DIAG.log.some(e=>/약속 시험 거절/.test(e.msg)),'페이지 오류·처리되지 않은 거절 기록');
 // 20건 상한
 for(let i=0;i<30;i++)diagNote('시험','항목 '+i);ok(DIAG.log.length===20&&DIAG.log[19].msg==='항목 29','최근 20건만 ('+DIAG.log.length+')');
 // 저장 실패에도 안전
 const si=localStorage.setItem;localStorage.setItem=()=>{throw new Error('quota');};let thrown=false;try{diagNote('시험','저장 실패');}catch(e){thrown=true;}localStorage.setItem=si;ok(!thrown,'저장 실패에도 오류 없음');
 // 글로 옮기기
 const tx=diagText();ok(tx.includes(GAME_VER)&&/항목 29/.test(tx)&&/node/i.test(tx),'복사용 글에 버전·내용·브라우저 정보');
 // 지우기
 diagClear();ok(DIAG.log.length===0&&JSON.parse(localStorage.getItem('joseon-toema-diag')).log.length===0,'지우기');
 // 5초마다 마지막 상태, 숨기면 표시
 newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);step(6);const hb=JSON.parse(localStorage.getItem('joseon-toema-diag')).hb;
 ok(hb&&hb.playing===true&&hb.st&&hb.st.cid==='seonbi','게임 중 마지막 상태를 남김 ('+JSON.stringify(hb)+')');
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS diag '+(want||'base'));
if(fails.length)process.exitCode=1;
