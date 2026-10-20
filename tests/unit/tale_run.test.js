// 설화 출정 한 판: 정해진 힘으로 시작 → 막마다 90초 뒤 보스(중간 보스 없음) → 막 사이 장면 → 3막 뒤 결말·빛깔·기록.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
meta.tale.frag={woochi:3,jiha:3,bari:3};meta.tale.done={};meta.tale.skin={};const coins0=meta.coins;
taleStart('woochi');
ok(G.mode==='tale'&&G.tale&&G.tale.id==='woochi'&&G.tale.act===0,'설화 출정 상태');
ok(G.cid==='seonbi'&&G.P.branch===1&&G.P.tier===1&&G.P.lvl===12,`선비 · 감찰의 길 1차 · Lv12 (지금 ${G.cid} ${G.P.branch} ${G.P.tier} ${G.P.lvl})`);
const wl=id=>{const w=G.weapons.find(w=>w.id===id);return w?w.lv:0;};
ok(wl('meok')===3&&wl('buchae')===2&&wl('mapae')===1,`먹탄 3 · 합죽선 2 · 전직 기술 1 (지금 ${G.weapons.map(w=>w.id+w.lv).join(',')})`);
ok(G.diff==='normal'&&!G.curse&&!G.card&&!G.ks,'난이도 보통 · 액운·패·정표 없음');
ok(!G.pet&&modal==='scene','펫 고르기 없이 시작 장면');
step(5);ok(modal===null||modal==='levelup','시작 장면을 넘기면 싸움 시작');
god();
step(70);ok(!G.mid,'60초가 지나도 중간 보스는 없음');ok(!G.boss,'90초 전에는 막 보스 없음');
step(25);ok(G.boss&&G.boss.bossKind==='gumiho'&&G.boss.taleN==='천서를 찾는 여우',`90초 뒤 1막 보스 (지금 ${G.boss&&G.boss.bossKind})`);
const sawTav=()=>['tavern','chest','path'].includes(modal)||(modal==='pick'&&/갈림길|도깨비/.test($('#pickTitle').textContent));
let bad=false;killBoss();
for(let i=0;i<240;i++){if(sawTav())bad=true;if(modal==='scene')break;step(1/60,{pick:false});}
ok(!bad,'보스 뒤 주막·상자·갈림길이 열리지 않음');
ok(modal==='scene'&&/2막/.test($('#sceneEye').textContent),'막 사이 장면 (지금 '+modal+' '+$('#sceneEye').textContent+')');
step(1);ok(G.tale.act===1&&G.stage===TALES.woochi.acts[1].eq&&G.tale.st===TALES.woochi.acts[1].st&&G.st<2,'2막 시작');
// 2·3막: 규칙 조건은 작업 6에서 시험. 여기서는 보스를 바로 불러 흐름만 본다
G.tale.force=true;god();step(TALE_T+1);ok(G.boss&&G.boss.bossKind==='dokchief','2막 보스');killBoss();step(4);step(1);
ok(G.tale.act===2,'3막 시작');god();step(TALE_T+1);ok(G.boss&&G.boss.bossKind==='jwclone','3막 보스 전우치의 분신');
const t0=G.time-G.tale.t0;killBoss();
for(let i=0;i<240&&modal!=='scene';i++)step(1/60,{pick:false});
ok(modal==='scene'&&$('#sceneText').textContent===TALES.woochi.end,'설화 결말 장면');
ok(/쪽빛 도포/.test($('#sceneFoot').textContent),'처음 완주 → 쪽빛 도포 알림');
armUntil=0;sceneNext();step(1,{pick:false});
ok(G.over,'완주하면 출정이 끝남');
const D=meta.tale.done.woochi;ok(D&&D.n===1&&Math.abs(D.best-t0)<2,`완주 기록 (지금 ${JSON.stringify(D)}, 기대 ${t0.toFixed(1)})`);
ok(meta.tale.skin.seonbi==='jjok','처음 얻은 빛깔은 바로 입혀 둠');
ok(meta.coins>coins0,'엽전은 본편과 같은 계산으로 들어옴');
ok(/전우치전/.test($('#overTitle').textContent),'결과 화면 제목 (지금 '+$('#overTitle').textContent+')');
// 두 번째, 더 느린 완주는 최고 기록 그대로, 횟수 +1
const best=D.best;taleStart('woochi');step(3);god();G.tale.force=true;
for(let a=0;a<3;a++){step(TALE_T+20);killBoss();for(let i=0;i<300&&!(modal==='scene');i++)step(1/60,{pick:false});armUntil=0;sceneNext();step(1);}
ok(meta.tale.done.woochi.n===2&&meta.tale.done.woochi.best===best,`느린 두 번째 완주: 횟수 2, 최고 기록 그대로 (지금 ${JSON.stringify(meta.tale.done.woochi)})`);
// 실패·그만두기
taleStart('jiha');step(3);ok(G.cid==='jangsu'&&G.P.lvl===14,'지하국대적은 장수 Lv14');
G.P.hp=1;G.P.iframe=0;G.P.revive=0;endGame(false);ok(!meta.tale.done.jiha,'쓰러지면 완주 기록 없음');ok(meta.tale.frag.jiha===3,'조각은 그대로');
taleStart('bari');step(3);$('#quitBtn').onclick();ok(G.over&&!meta.tale.done.bari,'그만두기도 기록 없음');
// 다시 하기는 같은 설화
taleStart('bari');step(2);endGame(false);$('#againBtn').onclick();ok(G.mode==='tale'&&G.tale.id==='bari','다시 하기는 같은 설화로');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS tale_run');
if(fails.length)process.exitCode=1;
