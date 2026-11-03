// v19.4 작업 4: 도감 63 · 새 엘리트 다섯 종 설명에 출처 이름과 「게임 속 각색」 · 도감 화면에 실림 · 「도감 완성」 목표는 v19.5까지 58
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const NEW=['gaekgwi','juktong','beomnam','gomnaru','gildal'];
ok(DOGAM_IDS.length===63,'도감 63종: '+DOGAM_IDS.length);
for(const id of NEW){const e=EN[id];ok(e&&DOGAM_IDS.includes(id),id+' 도감에 있음');
 ok(e&&/출처: 한국민족문화대백과사전 「[^」]+」/.test(e.d)&&/게임 속 각색/.test(e.d),id+' 설명에 출처·각색: '+(e&&e.d));
 ok(e&&e.c==='e'&&STAGES[e.st-1].elite2===id,id+' 엘리트 · 막 번호 맞음');}
const t=TASKS.find(t=>t.id==='dogam58');ok(t&&t.need===58,'도감 완성 목표 58 그대로(v19.5에서 68)');
for(const id of NEW)meta.seen[id]={s:1,k:2};codexTab='dogam';let err='',h='';try{openCodex('title');codexTab='dogam';renderCodex();h=$('#codexBody').innerHTML;}catch(e){err=e.message;}
ok(!err,'도감 화면 오류 없음 '+err);ok(NEW.every(id=>h.includes(EN[id].n)),'도감 화면에 다섯 이름');ok(/한국민족문화대백과사전/.test(h),'도감 안내 글에 새 엘리트 출처');
if(fails.length){console.log('FAIL elite2_codex\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS elite2_codex');
