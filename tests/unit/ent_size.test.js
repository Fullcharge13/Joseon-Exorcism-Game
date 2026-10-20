// 캐릭터·요괴 크기(v17.1): 설정 값 · 2배 정밀 그리기 판 · 그림 배율. (SAVE를 주면 그 저장으로 시작)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
// --- 작업 1: 설정 값 ---
ok(meta.set.ent===1,'옛 저장·엉뚱한 값이면 ent=1 (지금 '+JSON.stringify(meta.set.ent)+')');
const fix=v=>{meta.set.ent=v;normSet();return meta.set.ent;};
ok(fix(3)===1&&fix(0)===1&&fix('2')===1&&fix(1.5)===1&&fix(2)===2,'1·2 말고는 1로(1.5배는 2026-10-20 결정으로 뺌)');
openSettings('title');const se=$('#setEnt');ok(typeof se.onchange==='function','설정 화면에 캐릭터·요괴 크기 고르기');
entOff=true;se.value='2';se.onchange({target:se});ok(meta.set.ent===2&&entOff===false,'2를 고르면 ent=2, 느려짐으로 꺼 둔 것도 풀림');
// --- 작업 2: 2배 정밀 그리기 판 ---
const setEnt=v=>{meta.set.ent=v;entOff=false;resize();};
setEnt(1);const W1=W,H1=H,S1=S;ok(buf.width===W&&buf.height===H&&!hdOn(),'기본: 그리기 판 = 보이는 넓이 ('+buf.width+'x'+buf.height+' / '+W+'x'+H+')');
setEnt(2);ok(hdOn()&&buf.width===2*W&&buf.height===2*H,'2배: 그리기 판 2배 ('+buf.width+'x'+buf.height+')');
ok(W===W1&&H===H1&&S===S1,'보이는 넓이·화면 배율은 그대로');
meta.set.perf='low';applyPerf();resize();ok(!hdOn()&&buf.width===W,'절약 모드면 2배 정밀 꺼짐');meta.set.perf='auto';applyPerf();resize();
setEnt(2);entOff=true;resize();ok(!hdOn()&&buf.width===W,'느려짐으로 끈 상태면 꺼짐');entOff=false;resize();
// 그리기 시작에 2배 변환
let tf=null;const st0=b.setTransform;b.setTransform=(...a)=>{if(!tf)tf=a;};newGame('seonbi','gilil',0,'normal');step(0.1);render();ok(tf&&tf[0]===2&&tf[3]===2,'2배 정밀이면 그리기 판에 2배 변환 ('+JSON.stringify(tf)+')');
setEnt(1);tf=null;render();ok(tf&&tf[0]===1,'기본이면 1배 변환');b.setTransform=st0;
// --- 작업 3: 그림 배율 ---
const rec=[];const di0=b.drawImage;b.drawImage=function(...a){rec.push(a);};
let __sd=1;const __mr=Math.random;Math.random=()=>{__sd=(__sd*1103515245+12345)%2147483648;return __sd/2147483648;};
function frameAt(k,setup){__sd=7;setEnt(k);newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);god();G.enemies.length=0;G.items.length=0;G.projs&&(G.projs.length=0);setup();rec.length=0;render();return rec.slice();}
const ps=()=>charSpr(playerLook());
const wOf=(calls,imgs)=>{const c=calls.find(a=>imgs.includes(a[0])&&a.length>=5);return c?c[3]:null;};
const heroImgs=()=>{const s=ps();return [s.n,s.f,s.h,s.hf];};
// 플레이어
for(const k of [1,2]){const c=frameAt(k,()=>{});const w=wOf(c,heroImgs());ok(Math.abs(w-ps().w*k)<1e-6,`플레이어 그림 폭 ×${k} (지금 ${w} / 기본 ${ps().w})`);}
// 일반 요괴·보스·이무기
const nid=Object.keys(EN).find(id=>EN[id].c==='n'&&ESPR[id]);
const eImgs=id=>{const s=ESPR[id];return [s.n,s.f,s.h,s.hf];};
for(const k of [1,2]){const c=frameAt(k,()=>{spawnEnemy(nid,G.P.x+30,G.P.y);});const e=G.enemies[0];const w=wOf(c,eImgs(e.spr||nid));
 ok(Math.abs(w-ESPR[e.spr||nid].w*e.sc*k)<1e-6,`요괴 그림 폭 ×${k} (지금 ${w})`);}
const bid='gumiho';for(const k of [1,2]){const c=frameAt(k,()=>{G.st=STAGE_T+1;G.midDone=true;spawnBoss(bid,false);G.boss.x=G.P.x+40;G.boss.y=G.P.y;});const e=G.boss;const w=wOf(c,eImgs(e.spr||e.kind));
 ok(Math.abs(w-ESPR[e.spr||e.kind].w*e.sc*(k===2?1.5:1))<1e-6,`보스는 2배를 골라도 1.5배 (k ${k}, 지금 ${w})`);}
{let inI=false;const dI=drawImugi;drawImugi=e=>{inI=true;try{return dI(e);}finally{inI=false;}};const fr0=b.fillRect;b.fillRect=function(...a){if(inI)rec.push(['fr',...a]);};const pick=k=>frameAt(k,()=>{G.stage=3;spawnBoss('imugi',false);G.boss.x=G.P.x+40;G.boss.y=G.P.y;}).filter(a=>a[0]==='fr').map(a=>a.slice(1).join(',')).join('|');
 const p1=pick(1);ok(p1===pick(2)&&p1.length>200,'이무기 보스는 그대로');b.fillRect=fr0;drawImugi=dI;}
// 보스의 분신(천년 환영)도 보스처럼 1.5배까지: 보스와 분신의 크기 비율이 기본과 2배에서 같다
{const ratio=k=>{setEnt(k);newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);god();G.st=STAGE_T+1;G.midDone=true;spawnBoss('gumiho',false);const B=G.boss;BSK.clones.start(B);BSK.clones.tick(B,0.01);const c=G.enemies.find(e=>e.clone);return c?(c.sc*entK(c))/(B.sc*entK(B)):NaN;};
 const r1=ratio(1),r2=ratio(2);ok(Math.abs(r1-r2)<1e-6,'분신/보스 크기 비율이 그대로 (기본 '+r1.toFixed(2)+', 2배 '+r2.toFixed(2)+')');}
// 아이템은 그대로
{const pick=k=>frameAt(k,()=>{dropItem('coin',G.P.x+20,G.P.y);}).filter(a=>a[0]===ICS.coin).map(a=>a.length+':'+(a[3]||'')).join('|');ok(pick(1)===pick(2)&&pick(1).length>0,'아이템 그림 크기 그대로 ('+pick(1)+' / '+pick(2)+')');}
// 판정은 그대로
{setEnt(1);newGame('seonbi','gilil',0,'normal');const r1=G.P.r;spawnEnemy(nid,0,0);const er1=G.enemies[0].r;setEnt(2);newGame('seonbi','gilil',0,'normal');spawnEnemy(nid,0,0);
 ok(G.P.r===r1&&G.enemies[0].r===er1,'맞는 범위 값 그대로');
 G.queue.length=0;show(null);G.P.iframe=0;const hp=G.P.hp;const e=G.enemies[0];e.x=G.P.x+G.P.r+e.r+1;e.y=G.P.y;e.spd=0;e.vx=0;
 for(let i=0;i<3;i++){e.x=G.P.x+G.P.r+e.r+1;e.y=G.P.y;update(1/60);}ok(G.P.hp===hp,'그림이 겹쳐 보여도 판정 거리 밖이면 맞지 않음');}
// 표적 표식은 커진 그림 위
{const fr=[];const fr0=b.fillRect;b.fillRect=function(...a){fr.push(a);};frameAt(2,()=>{spawnEnemy(nid,G.P.x+30,G.P.y);G.enemies[0].mark=G.time+5;});
 const e=G.enemies[0],s=ESPR[e.spr||nid];const top=e.y-s.hgt*e.sc*2;const marks=fr.filter(a=>a[2]===2&&a[3]===4);
 const want=R(e.y-s.hgt*e.sc*2-8);ok(marks.some(a=>a[1]===want),'표적 표식이 2배 그림 위 (그림 꼭대기 '+top.toFixed(1)+', 표식 '+marks.map(a=>a[1]).join(',')+')');b.fillRect=fr0;}
b.drawImage=di0;setEnt(1);
Math.random=__mr;
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS ent_size');if(fails.length)process.exitCode=1;
