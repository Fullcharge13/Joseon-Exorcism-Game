// 저장된 진하기 값: 0.7은 그대로, 엉뚱한 값(0 등)은 진하게(1)로 바로잡는다. 다른 설정은 건드리지 않는다.
const want=+process.env.WANT;
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
ok(meta.set.fxA===want,`진하기는 ${want}여야 함 (지금: ${meta.set.fxA})`);
ok(meta.set.vol===40,'효과음 크기 설정은 그대로여야 함');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS fx_alpha_save '+want);
if(fails.length)process.exitCode=1;
