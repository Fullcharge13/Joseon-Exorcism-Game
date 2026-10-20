// 설화 출정은 본편 진행 기록(최고 막·평정·액운·레벨·전직·막 도달 과업)을 채우지 않는다. 처치 수·도감·보스 퇴치(2026-10-20 사용자 결정: 센다)는 쌓인다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
meta.tale.frag={woochi:3,jiha:3,bari:3};
const st0=JSON.parse(JSON.stringify(meta.stats)),done0=meta.done.slice(),best0=JSON.stringify(meta.best||null);
taleStart('jiha');step(3);god();G.tale.force=true;
for(let a=0;a<3;a++){step(TALE_T+2);killBoss();for(let i=0;i<300&&modal!=='scene';i++)step(1/60,{pick:false});armUntil=0;sceneNext();step(1);}
ok(G.over&&meta.tale.done.jiha,'지하국대적 완주');
const st=meta.stats;
ok((st.maxStage||0)===(st0.maxStage||0),`최고 막 그대로 (전 ${st0.maxStage} → ${st.maxStage})`);
ok((st.clears||0)===(st0.clears||0)&&(st.curseClear||0)===(st0.curseClear||0)&&!st.clear_jangsu,'평정·액운 기록 그대로');
ok(st.boss_jiha===(st0.boss_jiha||0)+1&&st.boss_bulgae===(st0.boss_bulgae||0)+1&&st.boss_baekdusan===(st0.boss_baekdusan||0)+1,'설화 보스도 본편 보스 퇴치로 셈');
ok(st.kills>(st0.kills||0),'처치 수는 쌓임');
ok(!st.tier_jangsu&&!st.br0_jangsu&&(st.maxLevel||0)===(st0.maxLevel||0),'정해진 힘으로 받은 전직·레벨은 본편 기록이 아님');
ok(JSON.stringify(meta.best||null)===best0,'본편 최고 기록 그대로');
const newDone=meta.done.filter(d=>!done0.includes(d)),BAD=TASKS.filter(t=>newDone.includes(t.id)&&(/^maxStage$|^maxLevel$|^tier_|^br[01]_|^clear|^boss_|curse|bestLoop/.test(t.key)));
ok(!BAD.length,'막 도달·평정·보스 과업이 이뤄지면 안 됨: '+BAD.map(t=>t.n).join(', '));
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS tale_stats');
if(fails.length)process.exitCode=1;
