// v22.2 견습 다듬기: ① 떡 반씩 나누기 ② 움직이는 범위 +50% ③ 무기 고르기·바꾸기 없음 ④ 상태창 「견습」 단추
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
{
if(typeof apStart!=='function'){ok(false,'apStart 없음');}else{
const clean=()=>{G.enemies.length=0;G.ebul.length=0;G.ezones.length=0;G.warns.length=0;G.items.length=0;G.gems.length=0;G.boss=null;G.mid=null;};
// ---- ① 떡 ----
newGame('seonbi','gilil',0,'normal','normal');show(null);G.north=true;G.stage=10;apStart('boy');clean();
const eat=()=>{const P=G.P;dropItem('tteok',P.x,P.y);const it=G.items[G.items.length-1];it.x=P.x;it.y=P.y;G.spawnT=1e9;for(let i=0;i<3;i++){update(STEP);G.enemies.length=0;}};
const P=G.P;P.hp=P.maxHp*0.3;G.ap.hp=G.ap.maxHp*0.3;
let h0=P.hp,a0=G.ap.hp;eat();const dP1=P.hp-h0,dA1=G.ap.hp-a0;
ok(dA1>0,'떡: 견습도 회복 (지금 +'+dA1.toFixed(1)+')');
P.hp=P.maxHp*0.3;G.ap.hp=G.ap.maxHp;h0=P.hp;eat();const dP2=P.hp-h0;
ok(dP1>0&&Math.abs(dP1/dP2-0.5)<0.05,'떡: 나눌 때 퇴마사는 절반 (나눔 '+dP1.toFixed(1)+' / 혼자 '+dP2.toFixed(1)+')');
ok(Math.abs(dA1-15*P.tteokM)<0.6,'떡: 견습 몫 = 떡 회복의 절반 (지금 '+dA1.toFixed(1)+', 기대 '+(15*P.tteokM).toFixed(1)+')');
P.hp=P.maxHp*0.3;G.ap.hp=0;G.ap.down=true;h0=P.hp;eat();
ok(Math.abs((P.hp-h0)-dP2)<0.6&&G.ap.hp===0,'떡: 기절한 견습은 못 먹고 퇴마사가 다');
G.ap.down=false;G.ap.hp=G.ap.maxHp*0.3;G.ap.hidden=true;P.hp=P.maxHp*0.3;h0=P.hp;eat();
ok(Math.abs((P.hp-h0)-dP2)<0.6,'떡: 숨은 견습은 못 먹고 퇴마사가 다');
// ---- ② 범위 ----
newGame('seonbi','gilil',0,'normal','normal');show(null);G.north=true;G.stage=10;apStart('boy');clean();
const Q=G.P;Q.x=0;Q.y=0;G.ap.x=-16;G.ap.y=4;
// 요괴 하나를 퇴마사에서 100 떨어진 곳에(예전 범위 70 밖, 새 범위 105 안)
const mk=(x,y)=>({x,y,r:6,hp:1e9,maxHp:1e9,spd:0,dmg:0,kind:'test',dead:false,vx:0,vy:0,ai:'none'});
let foe=mk(100,0);G.enemies.push(foe);
let maxD=0;for(let i=0;i<90;i++){apTick(STEP);maxD=Math.max(maxD,Math.hypot(G.ap.x-Q.x,G.ap.y-Q.y));}
ok(Math.hypot(G.ap.x-foe.x,G.ap.y-foe.y)<20,'복돌: 퇴마사 100 거리 요괴를 쫓아감 (지금 요괴까지 '+Math.hypot(G.ap.x-foe.x,G.ap.y-foe.y).toFixed(0)+')');
ok(maxD<=91,'복돌: 퇴마사에서 90 안 (지금 최대 '+maxD.toFixed(0)+')');
foe.x=200;for(let i=0;i<90;i++)apTick(STEP);
ok(Math.hypot(G.ap.x-Q.x,G.ap.y-Q.y)<=91,'복돌: 먼 요괴(200)는 90에서 멈춤');
newGame('seonbi','gilil',0,'normal','normal');show(null);G.north=true;G.stage=10;apStart('girl');clean();
const R0=G.P;R0.x=0;R0.y=0;for(let i=0;i<90;i++)apTick(STEP);
const gd=Math.hypot(G.ap.x-R0.x,G.ap.y-R0.y);ok(gd>24&&gd<32,'연이: 곁 27 남짓에 섬 (지금 '+gd.toFixed(1)+')');
// ---- ③ 무기 고르기 · 바꾸기 없음 ----
let last=[];const _op=openPick;openPick=(eye,t,l,c)=>{last=c;return _op(eye,t,l,c);};
meta.ending={seen:true,epi:Object.keys(CHARS)};meta.north={seen:true,clear:0,ending:true};meta.ap={seen:true};
newGame('seonbi','gilil',0,'normal','normal');show(null);G.stage=ACT1_END;G.bossDone=true;openTavern();pickFns[0]();
ok(modal==='pick'&&last.length===2,'견습 고르기 창');pickFns[1]();
ok(modal==='pick'&&last.length===3&&last.every(c=>/새총|활|물총/.test(c.name)),'연이 무기 고르기 창 3개 ('+last.map(c=>c.name).join('/')+')');
if(pickFns.length>=3)pickFns[2]();ok(G.ap&&G.ap.w.id==='mulchong'&&G.ap.w.lv===1,'고른 무기 물총 Lv1 (지금 '+(G.ap&&G.ap.w.id)+')');
ok(modal==='tavern','무기 고른 뒤 주막 (지금 '+modal+')');
show(null);
// 보패 없을 때: 견습 카드 둘 다 새 보패
for(let t=0;t<10;t++){const a=genOptions().filter(x=>/^ap/.test(x.k));if(!(a.length===2&&a.every(x=>x.k==='app')&&a[0].id!==a[1].id)){ok(false,'보패 없을 땐 견습 카드 둘 다 서로 다른 새 보패 ('+a.map(x=>x.k+':'+x.id).join(',')+')');break;}}
applyOpt(decorate({k:'app',id:'daenggi'}));
// 그 뒤: 바꾸기 없음
for(let t=0;t<20;t++){const a=genOptions().filter(x=>/^ap/.test(x.k));if(a.length!==2||a.some(x=>(x.k==='apw'&&x.id!=='mulchong')||(x.k==='app'&&x.id!=='daenggi'))){ok(false,'고른 뒤엔 물총·댕기 올리기만 ('+a.map(x=>x.k+':'+x.id).join(',')+')');break;}}
ok(!apOpts(new Set()).some(x=>(x.k==='apw'&&x.id!=='mulchong')||(x.k==='app'&&x.id!=='daenggi')),'apOpts에 바꾸기 없음');
G.ap.w.lv=5;let a2=apOpts(new Set());ok(a2.length&&a2.every(x=>x.k==='app'||x.k==='aptr')&&a2.some(x=>x.k==='app'),'무기 최대면 보패 올리기');
G.ap.p.lv=5;a2=apOpts(new Set());ok(a2.length===1&&a2[0].k==='aptr','모두 최대면 단련만');
// ---- ④ 상태창 ----
ok(!!$('#tabStA'),'상태창 견습 단추 있음');
if($('#tabStA')){
  newGame('seonbi','gilil',0,'normal','normal');show(null);openStatus();
  ok($('#tabStA').hidden===true,'견습 없으면 단추 숨김');show(null);
  G.north=true;G.stage=10;apStart('boy');G.ap.downs=1;openStatus();
  ok($('#tabStA').hidden===false,'견습 있으면 단추 보임');
  stTab='a';renderStatus();const h=$('#stBody').innerHTML;
  ok(/복돌/.test(h)&&/목검/.test(h)&&/1\s*\/\s*3/.test(h)&&/체력/.test(h),'견습 탭: 이름·무기·기절 1/3·체력');
  stTab='w';show(null);
  newGame('seonbi','gilil',0,'normal','normal');show(null);stTab='a';openStatus();
  ok(!/복돌|연이/.test($('#stBody').innerHTML),'견습 없는 판에서 견습 탭이면 무기 탭으로');stTab='w';show(null);
}
}
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS ap_v222');
if(fails.length)process.exitCode=1;
