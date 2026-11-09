// v20.9 오류 기록: 브라우저가 내용을 감춘 「Script error.」(파일·줄 없음)는 「바깥 스크립트 오류」로 따로 표시 — 게임 코드 오류와 구분
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
{
DIAG.log.length=0;diagSeen.clear();
ok(typeof diagFromEvent==='function','diagFromEvent 있음');
if(typeof diagFromEvent==='function'){
 // 1) 내용이 감춰진 오류(사파리 확장 프로그램 등)
 const [k1,p1]=diagFromEvent({message:'Script error.',filename:'',lineno:0,error:null});
 ok(k1==='바깥 스크립트 오류','감춘 오류의 종류 = 바깥 스크립트 오류 ('+k1+')');
 ok(/게임 밖/.test(String(p1)),'설명에 「게임 밖」 ('+p1+')');
 ok(diagFromEvent({message:'Script error',filename:''})[0]==='바깥 스크립트 오류','마침표 없는 Script error도');
 // 2) 게임 코드 오류는 그대로 「페이지 오류」, 내용 그대로
 const er=new TypeError('x is undefined');
 const [k2,p2]=diagFromEvent({message:'TypeError: x is undefined',filename:'https://a.github.io/game/',lineno:12,error:er});
 ok(k2==='페이지 오류'&&p2===er,'게임 코드 오류는 페이지 오류 + 오류 그대로');
 const [k3,p3]=diagFromEvent({message:'ReferenceError: y',filename:'https://a.github.io/game/',lineno:3,error:null});
 ok(k3==='페이지 오류'&&/ReferenceError: y \(https:\/\/a\.github\.io\/game\/:3\)/.test(p3),'오류 객체가 없으면 글·파일·줄 ('+p3+')');
 // 3) 파일 이름이 있는 Script error(드묾)는 감춘 것이 아니므로 그대로
 ok(diagFromEvent({message:'Script error.',filename:'https://a.github.io/game/',lineno:5})[0]==='페이지 오류','파일·줄이 있으면 페이지 오류');
 // 4) 기록까지: 사건을 그대로 흘리면 DIAG에 바깥 스크립트 오류 1건
 diagErr(...diagFromEvent({message:'Script error.',filename:'',lineno:0,error:null}));
 ok(DIAG.log.length===1&&DIAG.log[0].kind==='바깥 스크립트 오류'&&/게임 밖/.test(DIAG.log[0].msg),'기록에 바깥 스크립트 오류 ('+JSON.stringify(DIAG.log[0]||{}).slice(0,160)+')');
 ok(/바깥 스크립트 오류/.test(diagText()),'보내는 글에도 보임');
}
}
if(fails.length){console.log('FAIL diag_outside\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS diag_outside');
