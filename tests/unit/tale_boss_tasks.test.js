// 설화 출정에서 쓰러뜨린 보스도 본편 보스 과업에 센다 (예: 『전우치전』 1막 구미호 → 「여우 사냥」)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
meta.tale.frag={woochi:3,jiha:3,bari:3};meta.done=meta.done.filter(d=>d!=='b_fox');const before=meta.stats.boss_gumiho||0;
taleStart('woochi');step(1);god();G.tale.force=true;step(TALE_T+1);
ok(G.boss&&G.boss.bossKind==='gumiho','1막 보스 구미호');killBoss();
endGame(false);step(2,{pick:false});
ok((meta.stats.boss_gumiho||0)===before+1,'구미호 처치 기록 +1 (지금 '+meta.stats.boss_gumiho+')');
ok(meta.done.includes('b_fox'),'과업 「여우 사냥」 이룸');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS tale_boss_tasks');
if(fails.length)process.exitCode=1;
