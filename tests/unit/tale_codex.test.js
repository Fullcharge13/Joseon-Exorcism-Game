// 설화록 탭 순서·내용, 새 과업 3개(한 번씩만), 출정 일지·명예록의 설화 기록.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
meta.tale.frag={woochi:2,jiha:0,bari:0};meta.tale.done={};meta.ending={seen:false,epi:[]};
let h=taleCodexHTML();
const pos=s=>h.indexOf(s);
ok(pos('본편 결말')>=0&&pos('전우치전')>pos('본편 결말'),'본편 결말이 먼저, 그다음 설화');
ok(/이 퇴마사로 제10막을 평정하면 열린다/.test(h)&&!h.includes(ENDING.common[0].t),'결말을 못 보면 글을 숨김');
ok(h.includes(TALES.woochi.frags[0].t)&&h.includes(TALES.woochi.frags[1].t)&&!h.includes(TALES.woochi.frags[2].t),'얻은 조각만 글이 보임');
ok(!h.includes(TALES.woochi.end),'완주 전에는 설화 결말을 숨김');
ok(h.includes(TALES.woochi.url)&&h.includes(TALES.jiha.url)&&h.includes(TALES.bari.url),'출처는 늘 보임');
ok(!h.includes(TALES.jiha.frags[0].t),'조각이 없는 설화는 글이 없음');
meta.ending={seen:true,epi:['seonbi']};meta.tale.done.woochi={best:200,n:1};meta.tale.frag.woochi=3;h=taleCodexHTML();
ok(h.includes(ENDING.common[3].t)&&h.includes(ENDING.epi.seonbi)&&!h.includes(ENDING.epi.mudang),'본 결말·맺음말만 보임');
ok(h.includes(TALES.woochi.end),'완주한 설화의 결말');
// 과업
meta.tale.frag={woochi:0,jiha:0,bari:0};meta.tale.done={};meta.ending={seen:false,epi:[]};meta.done=meta.done.filter(d=>!['t_frag1','t_tale1','t_ending'].includes(d));
const c0=meta.coins;
newGame('seonbi','gilil',0,'normal');show(null);G.st=G.traceAt;updTrace(1/60);for(let i=0;i<200&&G.trace;i++){G.P.x=G.trace.x;G.P.y=G.trace.y;updTrace(1/60);}
checkTasks();ok(meta.done.includes('t_frag1'),'첫 설화 조각 과업');
const n1=meta.done.filter(d=>d==='t_frag1').length;checkTasks();endGame(false);checkTasks();
ok(meta.done.filter(d=>d==='t_frag1').length===1&&n1===1,'과업은 한 번만');
meta.tale.frag.woochi=3;taleStart('woochi');step(3);god();G.tale.force=true;for(let a=0;a<3;a++){step(TALE_T+2);killBoss();for(let i=0;i<300&&modal!=='scene';i++)step(1/60,{pick:false});armUntil=0;sceneNext();step(1);}
ok(meta.done.includes('t_tale1'),'첫 설화 완주 과업');
newGame('seonbi','gilil',0,'normal');show(null);G.stage=9;G.bossDone=true;openTavern();for(let i=0;i<8&&modal==='scene';i++){armUntil=0;sceneNext();}
ok(meta.done.includes('t_ending'),'본편 결말 과업');
ok(meta.coins>=c0+230,'엽전 보상 30+100+100 (늘어난 엽전 '+(meta.coins-c0)+')');
// 기록관
const r=meta.arch.runs.find(r=>r.mode==='tale');ok(r&&r.tale==='woochi'&&r.win,'출정 일지에 설화 기록');
ok(r&&/전우치전/.test(runLine(r).res),'일지 문구 (지금 '+(r&&runLine(r).res)+')');
ok(meta.arch.rec.tale&&meta.arch.rec.tale.r.tale==='woochi','명예록 「가장 빠른 설화」');
ok(!meta.arch.rec.fast||meta.arch.rec.fast.r.mode!=='tale','「가장 빠른 새벽」에는 설화가 들지 않음');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS tale_codex');
if(fails.length)process.exitCode=1;
