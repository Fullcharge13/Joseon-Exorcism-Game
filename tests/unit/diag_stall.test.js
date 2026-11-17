// v21.2.1 「긴 끊김」 가짜 경보: 아이폰 제어 센터·알림·앱 전환은 blur만 오고(일시정지 창) 숨김 알림이 없어,
// 돌아온 첫 장면이 쉬는 동안의 시간을 통째로 잰다(사용자 오류 기록 18건, 모두 창이 열린 상태·57~60프레임).
// 창이 열려 있으면 게임 시간이 흐르지 않으므로 기록하지 않는다. 창이 없는 플레이 중 3초 넘는 장면은 그대로 기록.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
{
newGame('seonbi',[],0,'normal','normal',3);G.queue.length=0;show(null);
const notes=()=>(DIAG.log||DIAG.list||[]).filter(x=>JSON.stringify(x).includes('긴 끊김')).length;
const n0=notes();
for(const m of ['pause','levelup','pick']){show(m);diagWatch(20000);}
ok(notes()===n0,'창이 열린 동안의 긴 장면은 기록하지 않음 ('+(notes()-n0)+'건)');
show(null);diagWatch(20000);
ok(notes()===n0+1,'플레이 중 3초 넘는 장면은 기록 ('+(notes()-n0)+'건)');
}
if(fails.length){console.log('FAIL diag_stall\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS diag_stall');
