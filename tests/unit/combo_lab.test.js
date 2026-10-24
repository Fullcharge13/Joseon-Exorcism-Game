// 조합 시험장(?combo, v17.4): 32가지 조합 모두 「시작 → 상자 → 진화됨」, 저장은 건드리지 않는다
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
const before=localStorage.getItem(SAVE_KEY);
LAB=true;const L=labList();
ok(L.length===Object.values(WD).filter(d=>d.evo&&d.type==='w').length,'목록 수 '+L.length);
for(const it of L){labStart(it.wid,'evo');const w=G.weapons.find(w=>w.id===it.wid);
 ok(G.cid===it.cid&&w&&w.lv===WD[it.wid].max&&(G.passives[it.pid]||0)>0,it.wid+' 시작 상태');
 ok(G.items.some(i=>i.kind==='chest'||i.k==='chest'||i.type==='chest'),it.wid+' 상자 놓임');
 const ch=G.items.find(i=>i.k==='chest');if(ch){G.P.x=ch.x;G.P.y=ch.y;}   // 플레이어가 한 걸음 걸어 상자를 줍는다
 let opened=false;for(let i=0;i<600&&!opened;i++){if(modal==='chest'){opened=true;break;}if(modal){armUntil=0;autoPick();}else{__t+=1000/60;frame(__t);}}
 ok(opened&&w.evo,it.wid+' 상자 열어 진화 ('+WD[it.wid].evoName+')');if(modal==='chest')$('#chestOk').onclick();
 labStart(it.wid,'card');ok(modal==='levelup'&&curOpts.some(o=>o.k==='pnew'&&o.id===it.pid&&o.pair),it.wid+' 카드 보기: 짝 보패 카드가 강조되어 나옴');
}
ok(localStorage.getItem(SAVE_KEY)===before,'시험장은 저장을 바꾸지 않음');
if(fails.length){console.log('FAIL combo_lab ('+fails.length+')\n  '+fails.slice(0,10).join('\n  '));process.exitCode=1;}else console.log('PASS combo_lab ('+L.length+' 조합)');
