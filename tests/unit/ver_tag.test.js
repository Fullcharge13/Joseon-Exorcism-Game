// v20.2.1: 시작 화면 판 표시(verTag)가 GAME_VER와 같다 — v20.0.1 뒤로 화면에 v19.7이 남아 「옛 판이 뜬다」로 보였음
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
{
const m=html.match(/<p class="ver" id="verTag">([^<]*)<\/p>/);
ok(m,'시작 화면에 verTag 한 줄');
ok(m&&m[1]===GAME_VER,'시작 화면 판 표시 '+(m&&m[1])+' = GAME_VER '+GAME_VER);
}
if(fails.length){console.log('FAIL ver_tag\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS ver_tag');
