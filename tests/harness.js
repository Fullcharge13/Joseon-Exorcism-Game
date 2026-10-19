// 화면 없는 자동 실행 틀 (조선퇴마록 sim 하네스를 일반화)
// 사용: node tests/harness.js <게임.html> <시험스크립트.js>
//  - 게임 HTML 속 <script>들을 꺼내 가짜 화면(DOM) 위에서 실행한 뒤,
//    같은 범위에서 시험 스크립트를 실행한다(게임의 함수·표를 그대로 쓸 수 있음).
//  - 게임 파일을 고칠 때마다 다시 꺼내므로 옛 코드를 읽는 실수가 없다.
//  - 저장을 미리 넣고 싶으면 환경 변수 SAVE에 JSON 파일 경로를 준다.
const fs=require('fs');
const [,,gamePath,testPath]=process.argv;
if(!gamePath||!testPath){console.error('사용: node tests/harness.js <게임.html> <시험.js>');process.exit(2);}
const noop=()=>{};
// 가짜 붓: 모르는 기능은 아무 일도 안 하는 함수로 답하고, 투명도(globalAlpha)는 진짜 붓처럼 원형(prototype)의 접근자로 둔다.
class FakeCtx{get globalAlpha(){return this._ga===undefined?1:this._ga;}set globalAlpha(v){this._ga=v;}}
Object.setPrototypeOf(FakeCtx.prototype,new Proxy({},{get:(t,k)=>k==='createRadialGradient'||k==='createLinearGradient'?()=>({addColorStop:noop}):k==='measureText'?()=>({width:0}):k==='createPattern'?()=>({}):noop}));
global.CanvasRenderingContext2D=FakeCtx;
const ctxP=new FakeCtx();
function el(){return {getContext:()=>ctxP,width:0,height:0,toDataURL:()=>'data:',style:{},hidden:false,innerHTML:'',textContent:'',children:[],appendChild:noop,addEventListener:noop,setAttribute:noop,querySelector:()=>el(),querySelectorAll:()=>[],onclick:null,click(){this.onclick&&this.onclick()},setPointerCapture:noop,getBoundingClientRect:()=>({left:0,top:0,right:0,bottom:0,width:0,height:0}),classList:{toggle:noop,add:noop,remove:noop,contains:()=>false},dataset:{},remove:noop,value:0,checked:false};}
const els={};
global.document={createElement:()=>el(),querySelector:s=>els[s]||(els[s]=el()),querySelectorAll:()=>[],getElementById:s=>els['#'+s]||(els['#'+s]=el()),addEventListener:noop,hidden:false,body:el(),documentElement:el()};
global.window=global;global.innerWidth=800;global.innerHeight=600;global.devicePixelRatio=1;
global.addEventListener=noop;global.requestAnimationFrame=noop;global.performance={now:()=>Date.now()};
const store={};global.localStorage={getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];},clear:()=>{for(const k in store)delete store[k];}};
if(process.env.SAVE){store['joseon-toema-v1']=fs.readFileSync(process.env.SAVE,'utf8');}
global.setTimeout=(f)=>{f();return 0;};global.clearTimeout=noop;global.navigator={userAgent:'node',maxTouchPoints:0};
global.__els=els;
const html=fs.readFileSync(gamePath,'utf8');
const game=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const test=fs.readFileSync(testPath,'utf8');
// 게임과 시험을 한 범위에서 실행(게임의 const/function을 시험이 바로 씀)
eval(game+'\n;\n'+test);
