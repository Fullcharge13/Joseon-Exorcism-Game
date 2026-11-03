// v19.4~v19.5: 도감 68 · 새 엘리트 열 종 설명에 출처와 「게임 속 각색」 · 도감 화면에 실림 · 「도감 완성」 목표 68(이미 이룬 저장 그대로) · 「요괴 사냥꾼」 과업
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const NEW=['gaekgwi','juktong','beomnam','gomnaru','gildal','yeogwi','heukryong','keunmegi','samdugumi','hwama'];
ok(DOGAM_IDS.length===68,'도감 68종: '+DOGAM_IDS.length);
for(const id of NEW){const e=EN[id];ok(e&&DOGAM_IDS.includes(id),id+' 도감에 있음');
 ok(e&&/출처: /.test(e.d)&&/게임 속 각색/.test(e.d),id+' 설명에 출처·각색: '+(e&&e.d));
 ok(e&&e.c==='e'&&STAGES[e.st-1].elite2===id,id+' 엘리트 · 막 번호 맞음');}
const t=TASKS.find(t=>t.id==='dogam58');ok(t&&t.need===68&&/68종/.test(t.d),'도감 완성 목표 68 '+(t&&t.need)+' '+(t&&t.d));
const h2=TASKS.find(t=>t.id==='elite2_all');ok(h2&&h2.need===10&&h2.rw&&h2.rw.coins===300,'「요괴 사냥꾼」 과업 10종·엽전 300');
// 「요괴 사냥꾼」: 9종 퇴치면 9, 10종이면 10 (설화 퇴치는 새 엘리트가 없으므로 영향 없음)
for(const id of NEW)meta.seen[id]={s:1,k:0};for(const id of NEW.slice(0,9))meta.seen[id].k=1;ok(V('elite2Kinds')===9,'9종 퇴치 → 9: '+V('elite2Kinds'));meta.seen.hwama.k=2;ok(V('elite2Kinds')===10,'10종 → 10');
// 이미 「도감 완성」을 이룬 옛 저장(58종)은 달성 그대로
if(!meta.done.includes('dogam58'))meta.done.push('dogam58');checkTasks();ok(meta.done.includes('dogam58'),'옛 저장의 도감 완성 유지');
codexTab='dogam';let err='',h='';try{openCodex('title');codexTab='dogam';renderCodex();h=$('#codexBody').innerHTML;}catch(e){err=e.message;}
ok(!err,'도감 화면 오류 없음 '+err);ok(NEW.every(id=>h.includes(EN[id].n)),'도감 화면에 열 이름');ok(/한국민족문화대백과사전/.test(h),'도감 안내 글에 새 엘리트 출처');
if(fails.length){console.log('FAIL elite2_codex\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS elite2_codex');
