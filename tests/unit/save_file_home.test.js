// v20.7 저장 파일 · 홈 화면에 추가(설정의 「저장」·「홈 화면에 추가」 상자)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
{
// ---- 저장 파일: 내용은 저장 코드 그대로, 이름에 날짜 ----
ok(typeof saveFileName==='function'&&saveFileName(new Date(2026,10,6))==='조선퇴마록-저장-2026-11-06.txt','파일 이름 = 조선퇴마록-저장-YYYY-MM-DD.txt ('+(typeof saveFileName==='function'?saveFileName(new Date(2026,10,6)):'-')+')');
meta.coins=4321;meta.stats.kills=55;
const txt=typeof saveFileText==='function'?saveFileText():'';
ok(txt.trim()===saveCode(),'파일 내용 = 지금 저장 코드');
const back=typeof saveFileRead==='function'?saveFileRead(txt):null;
ok(back&&back.coins===4321&&back.stats.kills===55,'파일을 다시 읽으면 같은 진행');
// 메모 앱을 거쳐 앞뒤에 글이 붙거나 줄이 나뉜 파일도 읽음
const code=saveCode();
ok(typeof saveFileRead==='function'&&saveFileRead('조선퇴마록 저장\r\n'+code.slice(0,30)+'\r\n'+code.slice(30)+'\r\n')!==null,'앞에 글·줄바꿈(CRLF)이 섞여도 읽음');
ok(typeof saveFileRead==='function'&&saveFileRead('﻿'+code)!==null,'BOM이 붙어도 읽음');
for(const bad of ['','아무 글','JTM1:@@@','{"coins":1}'])ok(typeof saveFileRead==='function'&&saveFileRead(bad)===null,'엉뚱한 파일은 거름: '+JSON.stringify(bad));
// 가져오기는 불러오기와 같은 흐름(확인 → 바꿈, 앞 진행은 되돌리기 칸에). 다시 시작은 단추 쪽에서 'ok'일 때만
const before=localStorage.getItem(SAVE_KEY);
let asked='';const cf=globalThis.confirm;globalThis.confirm=m=>{asked=m;return false;};
const r1=typeof saveLoadFlow==='function'?saveLoadFlow(code):'-';
ok(/4321/.test(asked)&&r1==='cancel'&&localStorage.getItem(SAVE_KEY)===before,'확인 창에 엽전 수 · 아니요면 그대로 ('+r1+')');
const r2=typeof saveLoadFlow==='function'?saveLoadFlow('JTM1:@@@'):'-';
ok(r2==='bad'&&localStorage.getItem(SAVE_KEY)===before,'깨진 파일이면 안내만 · 진행 그대로 ('+r2+')');
globalThis.confirm=()=>true;
const r3=typeof saveLoadFlow==='function'?saveLoadFlow(code):'-';
ok(r3==='ok'&&saveParse(localStorage.getItem(SAVE_KEY)).coins===4321&&localStorage.getItem(SAVE_UNDO)!==null,'예면 바꾸고 앞 진행은 되돌리기 칸에 ('+r3+')');
globalThis.confirm=cf;
}
{
// ---- 홈 화면에 추가: 기기 판별 ----
const IOS_SAF='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
 IOS_CRI='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0 Mobile/15E148 Safari/604.1',
 IOS_KAKAO='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.8.0',
 IPAD_MAC='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
 AND='Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36',
 PC='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const hk=(ua,o)=>typeof homeKind==='function'?homeKind({ua,standalone:false,prompt:false,touch:0,...(o||{})}):'-';
ok(hk(IOS_SAF)==='ios-safari','아이폰 사파리 → 세 단계 안내 ('+hk(IOS_SAF)+')');
ok(hk(IOS_CRI)==='ios-other'&&hk(IOS_KAKAO)==='ios-other','아이폰 크롬·카카오톡 안 → 사파리로 열어 달라고 ('+hk(IOS_CRI)+','+hk(IOS_KAKAO)+')');
ok(hk(IPAD_MAC,{touch:5})==='ios-safari'&&hk(IPAD_MAC,{touch:0})!=='ios-safari','맥처럼 보이는 아이패드(터치 있음)는 사파리 안내 · 진짜 맥은 아님');
ok(hk(AND,{prompt:true})==='prompt'&&hk(PC,{prompt:true})==='prompt','설치 창을 띄울 수 있으면 한 번 누르기');
ok(hk(AND)==='manual','안드로이드인데 설치 창이 아직 없으면 브라우저 메뉴 안내 ('+hk(AND)+')');
ok(hk(IOS_SAF,{standalone:true})==='app'&&hk(AND,{standalone:true,prompt:true})==='app','이미 홈 화면 앱이면 「실행 중」');
// ---- 오프라인 표시 ----
const of=(o)=>typeof offlineState==='function'?offlineState({proto:'https:',host:'x.github.io',sw:true,ready:false,...o}):'-';
ok(of({ready:true})==='ready'&&of({})==='wait','https: 캐시 준비되면 ready, 아니면 wait');
ok(of({proto:'file:'})==='none'&&of({sw:false})==='none','파일로 열었거나 지원 안 하면 none');
ok(of({proto:'http:',host:'localhost',ready:true})==='ready','localhost도 됨');
}
{
// ---- 화면 틀에 같은 id가 둘 없음(v20.7 만들 때 「본부로」 단추와 id가 겹쳐 그 단추를 덮어쓴 것을 막음) ----
const ids={};for(const m of html.split('<script>')[0].matchAll(/\sid="([^"]+)"/g))ids[m[1]]=(ids[m[1]]||0)+1;
const dup=Object.keys(ids).filter(k=>ids[k]>1);ok(dup.length===0,'겹친 id 없음: '+dup.join(','));
}
if(fails.length){console.log('FAIL save_file_home\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS save_file_home');
