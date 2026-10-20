// 설화 출정 저장(saveVer 13): 옛 저장은 빈 설화 기록을 받고, 엉뚱한 값은 바로잡힌다. 다른 저장 값은 그대로.
// (엽전은 불러올 때 이뤄지는 기존 과업 보상이 더해질 수 있어 줄지 않는지만 본다)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const want=process.env.WANT;
ok(meta.saveVer===13,`saveVer는 13이어야 함 (지금: ${meta.saveVer})`);
ok(meta.tale&&meta.tale.frag&&meta.tale.done&&meta.tale.skin,'meta.tale 세 칸이 있어야 함');
ok(meta.ending&&Array.isArray(meta.ending.epi),'meta.ending.epi가 배열이어야 함');
for(const id of ['woochi','jiha','bari'])ok(Number.isInteger(meta.tale.frag[id])&&meta.tale.frag[id]>=0&&meta.tale.frag[id]<=3,`조각 ${id}는 0~3 정수여야 함 (지금: ${meta.tale.frag[id]})`);
if(want==='v12'){
  ok(meta.tale.frag.woochi===0&&meta.tale.frag.jiha===0&&meta.tale.frag.bari===0,'옛 저장은 조각 0에서 시작');
  ok(meta.ending.seen===false,'옛 저장은 결말을 보지 않은 상태');
  ok(meta.coins>=512&&meta.up.hp===2&&meta.stats.kills===1234&&meta.stats.maxStage===6,'엽전·수련·기록은 그대로');
  ok(meta.unl.includes('char:mudang')&&meta.done.includes('k1')&&meta.anom.a1===1,'해금·과업·괴이는 그대로');
  ok(meta.set.vol===40&&meta.set.fxA===0.7,'설정은 그대로');
}
if(want==='bad'){
  ok(meta.tale.frag.woochi===3,'3보다 큰 조각은 3으로');
  ok(meta.tale.frag.jiha===0,'음수 조각은 0으로');
  ok(meta.tale.skin.seonbi===null,'없는 빛깔은 기본(null)으로');
  ok(meta.tale.skin.jangsu===null,'아직 완주하지 않은 설화의 빛깔도 기본으로');
  ok(meta.ending.seen===true&&Array.isArray(meta.ending.epi),'결말 기록은 살리고 빠진 칸만 채움');
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS tale_save '+want);
if(fails.length)process.exitCode=1;
