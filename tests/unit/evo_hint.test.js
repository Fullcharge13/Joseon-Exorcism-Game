// 레벨업 카드의 진화 짝 강조(v17.4): 진화 무기 32종 × 쓸 수 있는 퇴마사 × 상태 4가지(짝 없음 / 짝 있음 / 진화 준비 / 진화 완료)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
let n=0;
const reset=cid=>{newGame(cid,null,0,'normal');G.weapons=[];G.passives={};};
const give=(wid,lv)=>{addWeapon(wid);G.weapons.find(w=>w.id===wid).lv=lv;};
for(const wid in WD){const d=WD[wid];if(!d.evo||d.type!=='w')continue;const pid=d.evo,pn=PD[pid].name,wn=d.name;
 for(const cid in CHARS){reset(cid);if(!jobOk(d)||!jobOk(PD[pid]))continue;n++;const tag=`${cid}/${wn}+${pn}`;
  // 1) 짝 없음: 무기 새 카드에 짝 이름·진화 이름, 「아직 없음」. 보패 카드에는 무기가 흐리게(가진 것 아님)
  let c=decorate({k:'wnew',id:wid});
  ok(c.desc.includes(pn)&&c.desc.includes(d.evoName)&&c.desc.includes('아직 없음'),tag+' 무기 새 카드: 짝·진화 이름·아직 없음');
  ok(!c.pair,tag+' 무기 새 카드는 강조 아님');
  c=decorate({k:'pnew',id:pid});const s0=evoState({k:'pnew',id:pid});
  ok(!c.pair&&(wUnlocked(wid)?s0&&s0.rows.some(r=>r.wid===wid&&!r.own):!(s0&&s0.rows.some(r=>r.wid===wid))),tag+' 보패 카드: 안 가진 무기는 흐리게(잠긴 무기는 숨김), 강조 아님');
  // 2) 짝 있음: 무기 LV3을 가지면 보패 카드 강조 + 「보유 LV 3」
  give(wid,3);c=decorate({k:'pnew',id:pid});
  ok(c.pair&&c.bc.includes('pair')===false&&c.desc.includes('ep own')&&c.desc.includes(wn)&&c.desc.includes('LV 3'),tag+' 보패 카드 강조·보유 LV 3');
  c=decorate({k:'wup',id:wid});
  ok(!c.pair&&c.desc.includes('아직 없음'),tag+' 무기 강화 카드: 짝 아직 없음');
  // 반대로 보패를 먼저 가지면 무기 카드 강조
  G.passives[pid]=1;c=decorate({k:'wup',id:wid});
  ok(c.pair&&c.desc.includes('보유'),tag+' 보패를 가지면 무기 카드 강조·보유');
  // 3) 진화 준비: 무기 LV4 → 이번에 LV5 → 상자 안내 / 무기 LV5인데 보패가 없으면 보패 카드에 상자 안내
  G.weapons.find(w=>w.id===wid).lv=d.max-1;c=decorate({k:'wup',id:wid});
  ok(evoState({k:'wup',id:wid}).ready&&c.desc.includes('보물상자'),tag+' 무기 LV'+(d.max-1)+'→'+d.max+': 상자 안내');
  delete G.passives[pid];G.weapons.find(w=>w.id===wid).lv=d.max;c=decorate({k:'pnew',id:pid});
  ok(c.pair&&c.desc.includes('보물상자'),tag+' 무기 LV'+d.max+' + 보패 새 카드: 상자 안내');
  // 4) 진화 완료: 그 무기는 보패 카드에서 사라짐
  G.passives[pid]=1;G.weapons.find(w=>w.id===wid).evo=true;
  const s4=evoState({k:'pup',id:pid});
  ok(!(s4&&s4.rows.some(r=>r.wid===wid)),tag+' 진화한 무기는 보패 카드에 표시 안 함');
  // 다른 퇴마사의 전용 무기는 보패 카드에 나오지 않음
  reset(cid);const s5=evoState({k:'pnew',id:pid});
  for(const r of (s5?s5.rows:[]))ok(jobOk(WD[r.wid]),tag+' 다른 퇴마사 전용 무기 '+WD[r.wid].name+'이(가) 나옴');
 }}
// 짝이 둘인 보패: 가진 쪽만 강조(호리병: 가야금 보유, 약탕 안 가짐 → 가야금 own, 약탕 dim)
reset('gisaeng');give('gayageum',2);const s=evoState({k:'pnew',id:'horibyeong'});
ok(s&&s.rows.find(r=>r.wid==='gayageum').own,'호리병: 가야금 보유로 강조');
ok(!s.rows.find(r=>r.wid==='yaktang')||!s.rows.find(r=>r.wid==='yaktang').own,'호리병: 약탕은 안 가짐');
// 합공·직업 기술 카드엔 짝 표시가 없음
for(const id in WD){if(WD[id].type==='c'){reset(WD[id].job||'seonbi');if(!jobOk(WD[id]))continue;addWeapon(id);ok(!evoState({k:'wup',id}),'직업 기술 '+WD[id].name+'에 짝 표시');break;}}
ok(n>=31,'검사한 조합 수 '+n);
if(fails.length){console.log('FAIL evo_hint ('+fails.length+')\n  '+fails.slice(0,15).join('\n  '));process.exitCode=1;}else console.log('PASS evo_hint ('+n+' 조합 × 4 상태)');
