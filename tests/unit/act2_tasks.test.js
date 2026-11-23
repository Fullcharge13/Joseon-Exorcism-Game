// v22.0 2부 과업: 11막 도달·15막 평정·2부 결말·끝없는 밤·도감 95. 옛 과업(도감 68, 10막 평정)은 그대로.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
{
const ids=['n_enter','n_kaesong','n_clear','n_ending','n_loop','n_clear3','dogam95'];
for(const id of ids)ok(TASKS.some(t=>t.id===id),'과업 '+id);
ok(TASKS.find(t=>t.id==='dogam58').need===68,'옛 도감 과업 68 그대로');
ok(new Set(TASKS.map(t=>t.id)).size===TASKS.length,'과업 id 겹침 없음');
meta.done=meta.done.filter(i=>!ids.includes(i));meta.north={seen:true,clear:0,ending:false};meta.ending={seen:true,epi:Object.keys(CHARS)};
newGame('seonbi','gilil',0,'normal','normal');show(null);
G.stage=ACT1_END;G.bossDone=true;openTavern();pickFns[0]();show(null);nextStage();checkTasks();
ok(meta.done.includes('n_enter'),'11막 도달 → n_enter');
G.stage=ACT2_END;G.bossDone=true;openTavern();let m=0;while(modal==='scene'&&m<8){armUntil=0;sceneNext();m++;}
checkTasks();ok(meta.done.includes('n_clear')&&meta.done.includes('n_ending'),'15막 평정·2부 결말 과업');
pickFns[0]();checkTasks();ok(meta.done.includes('n_loop'),'15막 뒤 끝없는 밤 → n_loop');
ok(!meta.done.includes('n_clear3'),'세 번 평정은 아직');
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS act2_tasks');
if(fails.length)process.exitCode=1;
