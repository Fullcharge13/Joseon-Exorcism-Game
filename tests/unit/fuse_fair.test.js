// v21.2.1 합공 공정성: 모든 합공을 같은 장면(요괴 30·엘리트 1, 10초)에 두고 준 피해를 잰다.
// 실제 판(사용자 저장 2026-11-17)에서 백정 합공 둘이 피해의 80%를 차지 → 백정 합공은 다른 합공 중앙값의 1.25배를 넘지 않아야 한다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tier6_helpers.js
{
const kid=id=>({id,lv:5,evo:true,t:0.2,on:false,pos:[]});
const R={};
for(const f of FUSE){const r=skillRun(f.id,5,10,{cid:f.job||'seonbi',w:{evo:true,kids:[kid(f.a),kid(f.b)]}});
 ok(!r.err,f.id+' 오류 없음 '+(r.err||''));R[f.id]=Math.round(r.dmg);}
const others=Object.keys(R).filter(k=>!['f_kalgori','f_gorichu'].includes(k)).map(k=>R[k]).sort((a,b)=>a-b);
const med=others[others.length>>1];
console.log('합공 피해(10초):',JSON.stringify(R),'· 다른 합공 중앙값',med);
for(const id of ['f_kalgori','f_gorichu'])ok(R[id]<=med*1.25,`${id} ${R[id]} ≤ 중앙값 ${med}×1.25 = ${Math.round(med*1.25)}`);
// 진화 무기: 백정 진화 무기 넷이 모든 진화 무기 중앙값의 1.5배 이하(합공 안에서도 그대로 돌기 때문)
{const E={};for(const id in WD){const w=WD[id];if(w.type!=='w'||!w.evo||w.fuse)continue;E[id]=Math.round(skillRun(id,5,10,{cid:w.job||'seonbi',w:{evo:true}}).dmg);}
 const v=Object.values(E).sort((a,b)=>a-b),em=v[v.length>>1];
 console.log('백정 진화 무기(10초):',JSON.stringify({neokal:E.neokal,galgori:E.galgori,gorideot:E.gorideot,jeoulchu:E.jeoulchu}),'· 진화 무기 중앙값',em);
 for(const id of ['neokal','galgori','gorideot','jeoulchu'])ok(E[id]<=em*1.5&&E[id]>=em*0.5,`진화 ${id} ${E[id]}: 중앙값 ${em}의 0.5~1.5배`);}
}
if(fails.length){console.log('FAIL fuse_fair\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS fuse_fair');
