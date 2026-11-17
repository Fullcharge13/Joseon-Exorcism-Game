// v21.2 새 퇴마사 백정: 자료가 다 있고, 무기·진화·전직 기술·합공·궁극기가 오류 없이 피해를 준다
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tier6_helpers.js
{
const C=typeof CHARS==='object'&&CHARS.baekjeong;
ok(C&&C.name==='백정'&&C.seal==='衡'&&C.start==='neokal','백정 기본('+(C&&[C.name,C.seal,C.start])+')');
ok(C&&C.branches.length===2&&C.branches.every(b=>b.tiers.length===6),'두 갈래 × 6차');
const W4=['neokal','galgori','gorideot','jeoulchu'],P3=['sutdol','soegajuk','beodeul'];
for(const id of W4)ok(WD[id]&&WD[id].type==='w'&&WD[id].job==='baekjeong'&&WD[id].desc.length===5&&PD[WD[id].evo]&&WD[id].evoName,'직업 무기 '+id+'(진화 짝 '+(WD[id]&&WD[id].evo)+')');
ok(WD.jeoulchu&&WD.jeoulchu.lock,'저울추는 1차 전직 과업으로 해금');
for(const id of P3)ok(PD[id]&&PD[id].job==='baekjeong'&&PD[id].max===5,'직업 보패 '+id);
const SK=C?C.branches.flatMap(b=>b.tiers.map(t=>t.skill)):[];
ok(SK.length===12&&new Set(SK).size===12,'전직 기술 12개, 겹침 없음');
for(const id of SK)ok(WD[id]&&WD[id].type==='c'&&WD[id].max===5&&WD[id].desc.length===5&&!PD[id]&&!EN[id],'전직 기술 '+id);
const six=C?C.branches.map(b=>b.tiers[5]):[];
ok(six[0]&&six[0].name==='의적 임꺽정'&&/encykorea\.aks\.ac\.kr\/Article\/E0047411/.test(six[0].src||''),'6차 임꺽정·출처');
ok(six[1]&&six[1].name==='형평사 장지필'&&six[1].who&&six[1].src&&!/진주의 백정/.test(six[1].who),'6차 장지필·출처(출처에 없는 출신지는 쓰지 않음)');
ok(ULT.baekjeong&&ULT.baekjeong.g==='衡','궁극기 형평');
ok(STORY.baekjeong&&STORY.baekjeong.length===4,'이야기 네 줄');ok(ENDING.epi&&ENDING.epi.baekjeong&&ENDING.epi.baekjeong.length>20,'결말');
ok(JOBTASK.baekjeong&&JOBTASK.baekjeong.length===5,'직업 과업 다섯');
const TK=id=>TASKS.find(t=>t.id===id);
ok(TK('c_baekjeong')&&TK('c_baekjeong').key==='elites'&&TK('c_baekjeong').need===20&&TK('c_baekjeong').rw.unlock==='char:baekjeong','해금 과업: 엘리트 20');
ok(TK('t_baekjeong')&&TK('t_baekjeong').rw.unlock==='w:jeoulchu'&&TK('t5_baekjeong'),'1차·5차 전직 과업');
ok(TK('j_k_baekjeong'),'직업 과업이 자동으로 생김');
const FU=Object.values(FUSE);ok(FU.some(f=>f.a==='neokal'&&f.b==='galgori')&&FU.some(f=>f.a==='gorideot'&&f.b==='jeoulchu'),'합공 둘');
for(const id of [...W4,...P3])ok(ICON[id],'아이콘 '+id);
// 무기 Lv1·Lv5·진화, 기술 Lv1·Lv5: 오류 없음·피해 > 0
for(const id of W4){for(const [lv,evo] of [[1,false],[5,false],[5,true]]){const r=skillRun(id,lv,8,{cid:'baekjeong',w:{evo}});
  ok(!r.err,`${id} Lv${lv}${evo?' 진화':''} 오류 없음 ${r.err||''}`);ok(r.dmg>0,`${id} Lv${lv}${evo?' 진화':''} 피해 ${Math.round(r.dmg)}`);}}
for(const id of SK){const r1=skillRun(id,1,10,{cid:'baekjeong'}),r5=skillRun(id,5,10,{cid:'baekjeong'});
  ok(!r1.err&&!r5.err,`${id} 오류 없음 ${r1.err||r5.err||''}`);ok(r1.dmg>0&&r5.dmg>r1.dmg,`${id} 피해 Lv1 ${Math.round(r1.dmg)} < Lv5 ${Math.round(r5.dmg)}`);}
// 출정 → 전직 1~6차 → 궁극기
{let err=null;try{newGame('baekjeong',[],0,'normal','normal',4);G.queue.length=0;show(null);
  ok(G.P.maxHp===110&&G.P.crit>=0.08,'체력 110·치명타 +8% ('+G.P.maxHp+', '+G.P.crit+')');
  ok(G.weapons[0]&&G.weapons[0].id==='neokal','넓적칼로 시작');
  for(let i=0;i<600;i++){G.queue.length=0;update(1/60);}
  if(typeof castUlt==='function'){castUlt();for(let i=0;i<120;i++){G.queue.length=0;update(1/60);}}
 }catch(e){err=e.message;}ok(!err,'출정·궁극기 오류 없음 '+(err||''));}
}
if(fails.length){console.log('FAIL baekjeong\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS baekjeong');
