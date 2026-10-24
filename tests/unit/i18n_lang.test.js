// 언어 고르기(v18.0): 저장 없음이면 기기 언어(zh로 시작하면 간체), 저장값이 우선, 바꿔도 진행 저장은 그대로, 표 덧씌우기와 되돌리기
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const nav=l=>{Object.defineProperty(navigator,'language',{value:l,configurable:true,writable:true});};   // Node의 navigator.language는 읽기 전용이라 덮어씀
delete meta.set.lang;nav('zh-CN');ok(detectLang()==='zh','zh-CN → 간체');nav('zh-TW');ok(detectLang()==='zh','zh-TW도 zh로 시작 → 간체');
nav('ko-KR');ok(detectLang()==='ko','ko-KR → 한국어');nav('en-US');ok(detectLang()==='ko','en-US → 한국어');nav(undefined);ok(detectLang()==='ko','언어 없음 → 한국어');
meta.set.lang='ko';nav('zh-CN');ok(detectLang()==='ko','저장값이 기기보다 우선');meta.set.lang='xx';ok(detectLang()==='zh','엉뚱한 저장값은 무시');
const coins=meta.coins,ups=JSON.stringify(meta.up);
const z0=I18N.zh,n0=WD.meok.name,d0=WD.meok.desc[1];I18N.zh={[n0]:'墨弹',[d0]:'墨弹数量+1'};
setLang('zh');ok(LANG==='zh'&&meta.set.lang==='zh','간체로 바꾸고 저장');ok(WD.meok.name==='墨弹'&&WD.meok.desc[1]==='墨弹数量+1','표 덧씌우기 (이름·설명 배열)');
ok(meta.coins===coins&&JSON.stringify(meta.up)===ups,'진행 저장은 그대로');
setLang('ko');ok(WD.meok.name===n0&&WD.meok.desc[1]===d0,'한국어로 되돌림');
setLang('zh');setLang('zh');setLang('ko');ok(WD.meok.name===n0,'여러 번 바꿔도 원문이 지켜짐');
I18N.zh=z0;ok(typeof LANG_ZH_PUBLIC!=='undefined'&&LANG_ZH_PUBLIC===true,'v18.1: 중국어 단추 공개');
if(fails.length){console.log('FAIL i18n_lang\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS i18n_lang');
