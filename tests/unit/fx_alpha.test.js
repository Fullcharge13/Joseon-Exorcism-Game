// 「내 기술 효과 진하기」 설정
// 1) 옛 저장(설정 없음)은 「진하게」(1)로 시작한다.
// 2) 진하기 < 1이면 내 장판·투사체·순간 효과를 그릴 때 실제 투명도에 진하기가 곱해진다.
// 3) 요괴 탄은 내 순간 효과보다 나중에(위에) 그리고, 언제나 진하기 1로 그린다.
// 4) 피해 숫자는 흐려지지 않는다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};

ok(meta.set.fxA===1,'옛 저장의 처음 값은 진하게(1)이어야 함 (지금: '+meta.set.fxA+')');

// 그리기 기록: 모든 캔버스가 같은 가짜 붓을 쓰므로, 호출 순서와 그때의 진하기를 남긴다.
let log=[];
const GA=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'globalAlpha');
const real=()=>GA.get.call(b);
const rec=name=>function(){log.push({op:name,a:real(),fill:b.fillStyle,stroke:b.strokeStyle,arg0:arguments[0],text:name==='fillText'?arguments[0]:undefined});};
for(const k of ['fillRect','fill','stroke','drawImage','fillText'])b[k]=rec(k);

function scene(fxA){
 meta.set.fxA=fxA;
 newGame('seonbi','gilil',0,'normal');
 const P=G.P;
 G.enemies.length=0;G.projs.length=0;G.fx.length=0;G.ebul.length=0;G.zones.length=0;
 G.projs.push({x:P.x+20,y:P.y,vx:1,vy:0,kind:'ink',r:3,life:1,hit:new Set()});
 G.fx.push({t:'slash',x:P.x,y:P.y,a:0,r:20,life:0.18,max:0.18,delay:0,half:1,col:'#abcdef'});
 G.fx.push({t:'num',x:P.x,y:P.y-10,v:'77',life:0.5,max:0.5});
 G.ebul.push({x:P.x-20,y:P.y,col:'#ff5a8a'});
 log=[];b.globalAlpha=1;render();
 return log;}

// 진하게(1): 베기는 그대로(1), 요괴 탄은 베기 효과 뒤에.
{const L=scene(1);
 const iSlash=L.findIndex(e=>e.op==='stroke'&&e.stroke==='#abcdef');
 const iBul=L.findIndex(e=>e.op==='fillRect'&&e.fill==='#ff5a8a');
 ok(iSlash>=0&&iBul>=0,'진하게: 베기와 요괴 탄이 그려져야 함');
 ok(iBul>iSlash,'진하게: 요괴 탄이 내 베기 효과보다 위(나중)에 그려져야 함');
 ok(iSlash>=0&&L[iSlash].a===1,'진하게: 베기 효과는 진하기 1');}

// 흐리게(0.4): 내 효과(베기·먹탄)는 실제 투명도 0.4, 요괴 탄과 피해 숫자는 1.
{const L=scene(0.4);
 const sl=L.filter(e=>e.op==='stroke'&&e.stroke==='#abcdef');
 ok(sl.length>0&&sl.every(e=>Math.abs(e.a-0.4)<1e-9),'흐리게: 베기 효과의 실제 투명도는 0.4 (지금 '+sl.map(e=>e.a)+')');
 const ink=L.filter(e=>e.op==='fill'&&e.fill==='#0a080c');
 ok(ink.length>0&&ink.every(e=>Math.abs(e.a-0.4)<1e-9),'흐리게: 먹탄의 실제 투명도는 0.4 (지금 '+ink.map(e=>e.a)+')');
 const iBul=L.findIndex(e=>e.op==='fillRect'&&e.fill==='#ff5a8a');
 ok(iBul>=0&&L[iBul].a===1,'흐리게: 요괴 탄은 진하기 1이어야 함');
 const nums=L.filter(e=>e.op==='fillText'&&e.text==='77');
 ok(nums.length>0&&nums.every(e=>e.a>0.99),'흐리게: 피해 숫자는 흐려지지 않아야 함');
 ok(real()===1,'그린 뒤 붓의 투명도는 1로 돌아와야 함 (지금 '+real()+')');
 ok(!Object.getOwnPropertyDescriptor(b,'globalAlpha'),'그린 뒤 붓에 덧씌운 것이 남으면 안 됨');}

// 5) 장판 위 기술 아이콘도 같은 진하기, 보스 장판 표식은 언제나 또렷하게
{meta.set.fxA=0.4;EMQ.length=0;emblem('meok',10,10,1);emblem('boss',10,10,1);
 ok(Math.abs(EMQ[3]-0.4)<1e-9,'흐리게: 내 장판 아이콘의 진하기는 0.4여야 함 (지금 '+EMQ[3]+')');
 ok(EMQ[7]===1,'흐리게: 보스 장판 표식은 1이어야 함 (지금 '+EMQ[7]+')');
 meta.set.fxA=1;EMQ.length=0;emblem('meok',10,10,1);
 ok(EMQ[3]===1,'진하게: 내 장판 아이콘은 1이어야 함');}

console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS fx_alpha');
if(fails.length)process.exitCode=1;
