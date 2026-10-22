// 오디오 되살리기: 브라우저가 resume()을 거절해도(약속 거절) 처리되지 않은 오류가 남지 않는다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
let unhandled=0;process.on('unhandledRejection',()=>{unhandled++;});
let calls=0;AC={state:'suspended',resume:()=>{calls++;return Promise.reject(new Error('not allowed'));}};
initAudio();if(typeof resumeAudio==='function')resumeAudio();
setImmediate(()=>{setImmediate(()=>{
 ok(calls>=1,'멈춘 오디오를 되살리려 함 (호출 '+calls+')');
 ok(unhandled===0,'거절돼도 처리되지 않은 오류가 없어야 함 ('+unhandled+'건)');
 console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS audio_resume');
 if(fails.length)process.exitCode=1;});});
