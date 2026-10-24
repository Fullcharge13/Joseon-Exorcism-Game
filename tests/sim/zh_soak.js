// 간체 자동 플레이 (v18.1). harness 위에서 실행:
//   SECS=600 node tests/harness.js index.html tests/sim/zh_soak.js
// 언어를 간체로 두고 퇴마사 여섯 명으로 한 판씩 돈다. 창이 뜨면 첫 선택지를 고른다.
// 그동안 화면에 넣은 글(innerHTML·textContent·value·title), 알림, 캔버스 글을 모두 모아 한글이 든 것을 찾는다.
// 하나라도 있으면 FAIL. 데이터 표에 없는 글(코드에 박힌 한국어, 불러올 때 한 번 만든 글)을 찾는 것이 목적.
const SECS=+(process.env.SECS||600);let seed=+(process.env.SEED||5);
Math.random=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
document.hidden=true;const HAN=/[가-힣]/,hits=new Map();let nText=0;
const rec=(where,v)=>{if(typeof v!=='string')return;nText++;if(!HAN.test(v))return;const s=v.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
 const m=s.match(/[^ ]*[가-힣][^ ]*/g)||[];for(const w of m){if(w==='한국어')continue;const k=where+': '+w.slice(0,30);if(!hits.has(k))hits.set(k,s.slice(0,90));}};
const inst=e=>{if(!e||typeof e!=='object'||e.__zh)return e;e.__zh=1;for(const p of ['innerHTML','textContent','value','title','innerText']){let v=e[p];
 try{Object.defineProperty(e,p,{get:()=>v,set:x=>{v=x;rec(p,x);},configurable:true});}catch(_){}}return e;};
for(const k in __els)inst(__els[k]);
{const q=document.querySelector,g=document.getElementById,c=document.createElement;document.querySelector=s=>inst(q(s));document.getElementById=s=>inst(g(s));document.createElement=t=>inst(c(t));}
ctxP.fillText=(s)=>rec('canvas',String(s));
{const t0=toast;toast=(m,...r)=>{rec('toast',m);return t0(m,...r);};}
{const e=document.createElement('div');e.innerHTML='시험';toast('시험2');const ok=[...hits.keys()].some(k=>k.startsWith('innerHTML'))&&[...hits.keys()].some(k=>k.startsWith('toast'));hits.clear();if(!ok){console.log('FAIL zh_soak: 글 모으기 장치가 한글을 못 잡음');process.exit(1);}}   // 시험의 시험
setLang('zh',false);meta.set.nums=false;meta.coins=0;
meta.unl=[...new Set([...(meta.unl||[]),...Object.keys(CHARS).map(c=>'char:'+c)])];
function pick(){armUntil=0;
 if(modal==='scene')return sceneNext(),1;if(modal==='levelup')return pickOpt(0),1;if(modal==='adv'&&advPick.length)return advPick[0](),1;
 if(modal==='bless'&&blessPick.length)return blessPick[0](),1;if(modal==='petpick'&&petPick.length)return petPick[0](),1;
 if(modal==='pick'&&pickFns.length)return pickFns[0](),1;if(modal==='chest')return $('#chestOk').onclick(),1;if(modal==='tavern')return $('#tavGo').onclick(),1;return 0;}
let t=100000,errs=0;const cw=console.warn;console.warn=(...a)=>{errs++;if(errs<4)cw(...a);};
const RUNS=[...Object.keys(CHARS).map(c=>[c,'normal']),['seonbi','rush'],['mudang','rush'],...TALE_IDS.map(id=>[id,'tale'])];
for(const [cid,mode] of RUNS){
 if(mode==='tale'){meta.tale.frag[cid]=3;taleStart(cid);}else newGame(cid,'gilil',0,'normal',mode);last=t;G.P.hp=G.P.maxHp=1e9;
 let n=0;while(G.time<SECS&&!G.over&&n<SECS*80){n++;
  if(modal&&modal!=='title'){if(!pick()){if(modal==='over')break;show(null);}}
  joy={id:1,active:true,ox:0,oy:0,x:Math.cos(G.time*0.5)*40,y:Math.sin(G.time*0.7)*40};
  G.P.hp=G.P.maxHp;frame(t+=33);}
 console.log(cid,mode,'시간',Math.round(G.time),'막',G.stage+1,'Lv',G.P.lvl);
 try{openStatus();closeStatus();openPause();show(null);}catch(e){console.log('status',e.message);}
 try{endGame(G.stage>=9);}catch(e){console.log('endGame',e.message);}
 try{renderTitle();openArch('title');renderArch();openHub();}catch(e){console.log('screens',e.message);}}
const out=[...hits].map(([k,v])=>k+'  ⟵ '+v);
if(out.length){console.log('FAIL zh_soak (한글 '+out.length+'곳 / 글 '+nText+')\n  '+out.slice(0,80).join('\n  '));process.exitCode=1;}
else console.log('PASS zh_soak (글 '+nText+'개 모두 한글 없음, 경고 '+errs+')');
