// 본부 샛길 주인(v17.5): 이름 「패랭이 도깨비」, 그림은 샛길 길잡이 도깨비(GNPC.dokkaebi, 뿔 없음)와 같다
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
ok(NPCS.dokkaebi.n==='패랭이 도깨비','이름 ('+NPCS.dokkaebi.n+')');
ok(typeof NPCS.dokkaebi.spr==='function'&&NPCS.dokkaebi.spr()===GNPC.dokkaebi,'본부 그림이 길잡이 도깨비 도트');
ok(npcPic(NPCS.dokkaebi)===big(GNPC.dokkaebi.n,4),'본부 카드 그림 = 길잡이 도깨비');
for(const id in NPCS)if(id!=='dokkaebi')ok(typeof npcPic(NPCS[id])==='string','다른 식구 그림 '+id);
const all=JSON.stringify(NPCS,(k,v)=>typeof v==='function'?String(v):v);ok(!all.includes('외뿔'),'식구 글에 「외뿔」이 남지 않음');
if(fails.length){console.log('FAIL hub_dokkaebi\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS hub_dokkaebi');
