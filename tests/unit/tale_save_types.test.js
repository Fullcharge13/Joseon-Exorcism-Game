// 저장 값의 「모양」이 틀어져도(문자열·숫자·배열·참거짓) 게임이 열리고, 설화 기록은 빈 값으로 바로잡히며,
// 설화를 끝까지 해도 멈추지 않는다. (SAVE=틀어진 저장 WANT=str|mix|arr)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
const want=process.env.WANT;
const plain=o=>o&&typeof o==='object'&&!Array.isArray(o);
ok(plain(meta.tale)&&plain(meta.tale.frag)&&plain(meta.tale.done)&&plain(meta.tale.skin),'meta.tale과 세 칸이 객체 (지금 '+JSON.stringify(meta.tale)+')');
ok(plain(meta.ending)&&typeof meta.ending.seen==='boolean'&&Array.isArray(meta.ending.epi),'meta.ending 모양 (지금 '+JSON.stringify(meta.ending)+')');
for(const id in meta.tale.done){const d=meta.tale.done[id];ok(plain(d)&&Number.isFinite(d.best)&&Number.isFinite(d.n),'완주 기록 '+id+'는 숫자 best·n ('+JSON.stringify(d)+')');}
if(want==='mix')ok(meta.tale.done.bari&&meta.tale.done.bari.best===250&&!meta.tale.done.woochi&&!meta.tale.done.jiha,'올바른 완주 기록만 남김 ('+JSON.stringify(meta.tale.done)+')');
const cards=taleCards();ok(!cards.some(c=>/NaN|undefined/.test(c.sub)),'설화 목록에 NaN·undefined 없음');
// 다시 저장했다 불러도 조각이 남는다
meta.tale.frag.woochi=3;saveMeta();const back=JSON.parse(localStorage.getItem(SAVE_KEY));
ok(back.tale&&back.tale.frag&&back.tale.frag.woochi===3,'저장에 조각이 남음 ('+JSON.stringify(back.tale)+')');
// 끝까지 한 판
taleStart('woochi');step(1);god();G.tale.force=true;
for(let a=0;a<3;a++){step(TALE_T+1);killBoss();for(let i=0;i<300&&!G.over;i++){if(modal==='scene'){armUntil=0;sceneNext();}else step(1/60);}}
ok(G.over&&meta.tale.done.woochi&&meta.tale.done.woochi.n>=1,'설화 끝까지 완주 기록 (over '+G.over+', done '+JSON.stringify(meta.tale.done.woochi)+')');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS tale_save_types '+want);
if(fails.length)process.exitCode=1;
