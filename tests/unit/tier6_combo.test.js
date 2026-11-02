// v19.0 6차 기술과 부가 시스템: 각 기술에 나올 수 있는 오의 각성(awkTypes)과 한계 돌파 +5가 실제로 효과가 있는지(피해가 2% 넘게 달라짐)
// 인장·담금질은 무기(type 'w') 전용이라 직업 기술에는 나오지 않는다(sealSlots·openTemper)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tier6_helpers.js
const SHOWN=[];const IDS=[];for(const c in CHARS)for(const b of CHARS[c].branches)if(b.tiers[5])IDS.push(b.tiers[5].skill);
ok(IDS.length>=6,'6차 기술 '+IDS.length+'개');
for(const id of IDS){const base=skillRun(id,5,20);ok(!base.err&&base.dmg>0,id+' 기본 '+(base.err||Math.round(base.dmg)));
 ok(sealSlots({id})===0,id+' 인장 칸 없음(직업 기술)');
 for(const t of awkTypes(id)){const r=skillRun(id,5,20,{w:{awk:t}});SHOWN.push(id+' '+t+' '+Math.round(base.dmg)+'→'+Math.round(r.dmg));ok(!r.err&&Math.abs(r.dmg-base.dmg)>base.dmg*0.02,`${id} 각성 ${t}: ${Math.round(base.dmg)} → ${Math.round(r.dmg)} ${r.err||''}`);}
 const lb=skillRun(id,5,20,{w:{lb:5}});ok(!lb.err&&lb.dmg>base.dmg*1.02,`${id} 한계 돌파 +5: ${Math.round(base.dmg)} → ${Math.round(lb.dmg)}`);}
if(fails.length){console.log('FAIL tier6_combo ('+fails.length+')\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS tier6_combo ('+IDS.length+'개 기술)');if(typeof process!=='undefined'&&process.env.SHOW)console.log(SHOWN.join('\n'));
