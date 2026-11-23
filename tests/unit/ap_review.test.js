// v22.1 검토 지적 고침: 봉인해도 견습 카드는 둘 · 견습 보패 id가 퇴마사 것과 안 겹침 · 무적 중엔 탄을 지우지 않음 ·
// 견습이 처치해 생긴 덤 피해는 견습 몫이 아님 · 깨어남 알림 조사 · 장면 그림은 그 퇴마사
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
{
if(typeof apStart!=='function'){ok(false,'apStart 없음');}else{
newGame('seonbi','gilil',0,'normal','normal');show(null);god();G.north=true;G.stage=10;apStart('girl');G.bn=5;
// 1) 봉인해도 둘
for(let t=0;t<10;t++){G.banned=new Set();curOpts=genOptions();   /* 봉인 한 번씩(모두 봉인해 남는 게 없으면 엽전이 맞음) */const i=curOpts.findIndex(o=>/^ap/.test(o.k));banMode=true;pickOpt(i);const n=curOpts.filter(o=>/^ap/.test(o.k)).length;if(n!==2){ok(false,'봉인 뒤에도 견습 카드 둘 (지금 '+n+')');break;}G.bn=5;}
// 2) id 겹침 없음
G.banned=new Set();curOpts=[decorate({k:'app',id:'bangul'}),decorate({k:'app',id:'jipsin'})];banMode=true;G.bn=5;pickOpt(0);banMode=true;pickOpt(1);
ok(!G.banned.has('bangul')&&!G.banned.has('jipsin'),'견습 보패 봉인이 퇴마사 방울·짚신을 막지 않음 ('+[...G.banned].join(',')+')');
G.banned=new Set(['jipsin','bangul']);let seen=0;for(let t=0;t<100;t++)if(apOpts(G.banned).some(o=>o.id==='jipsin'||o.id==='bangul'))seen++;
ok(seen>0,'퇴마사 짚신·방울을 봉인해도 견습 것은 나옴');G.banned=new Set();
// 3) 무적 중엔 탄을 지우지 않음
G.enemies.length=0;G.ebul.length=0;G.ap.iT=1;G.ap.x=G.P.x+40;G.ap.y=G.P.y;const q={x:G.ap.x,y:G.ap.y,vx:0,vy:0,r:3,life:5,dmg:10};G.ebul.push(q);
apTick(1/60);ok(q.life>0,'무적 중엔 탄이 그대로 지나감');
// 4) 견습 처치 덤 피해는 견습 몫 아님(kill 안에서 HSRC 없음)
let hsInKill='x';const k0=kill;kill=function(e){const r=k0.apply(this,arguments);return r;};kill=k0;
const pc=particle;particle=function(){if(hsInKill==='x')hsInKill=HSRC;return pc.apply(this,arguments);};
const e=spawnEnemy(STAGES[10].early[0],G.ap.x+5,G.ap.y);e.hp=1;HSRC='ap:saechong';hurt(e,50,0,0,0,true);HSRC=null;particle=pc;
ok(hsInKill===null,'처치 덤 효과 때 HSRC 비움 (지금 '+hsInKill+')');
// 5) 깨어남 알림 조사 · 장면 그림
ok(/깨어났다/.test(_t('{n:이} 깨어났다',{n:'복돌'}))&&_t('{n:이} 깨어났다',{n:'복돌'})==='복돌이 깨어났다','깨어남 알림 조사');
const src=apTick.toString();ok(/\{n:이\} 깨어났다/.test(src),'깨어남 알림이 조사 꼴을 씀');
ok(!/ch:seonbi/.test(JSON.stringify(ENDING.apprentice)),'견습 장면 그림이 선비로 고정되지 않음');
// 6) 단련 카드가 둘 겹치지 않음
G.ap.w.lv=5;G.ap.p={id:'daenggi',lv:5};const B=new Set(['ap:mulchong','ap:daehwal','ap:jipsin','ap:bangul','ap:bokjumeoni']);
const two=apPick2(B);ok(two.filter(o=>o.k==='aptr').length<=1,'단련 카드는 하나만 ('+two.map(o=>o.k).join(',')+')');
}
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS ap_review');
if(fails.length)process.exitCode=1;
