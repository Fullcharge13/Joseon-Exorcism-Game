// v21.2 새 과업: 흉괘(1장·3장 끼고 제10막) · 성난 엘리트(10·50마리) · 흉괘 일곱 가지 모두 끼고 깸 — 집계와 보상
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
{
const TK=id=>TASKS.find(t=>t.id===id);
const want={allchar7:['charN',7],h_one:['hyungClear',1],h_three:['hyungClear',3],h_all:['hyungKinds',7],rage10:['rageKills',10],rage50:['rageKills',50]};
for(const id in want){const t=TK(id);ok(t&&t.key===want[id][0]&&t.need===want[id][1]&&t.n&&t.d&&t.rwText,'과업 '+id+' ('+(t&&[t.key,t.need])+')');}
ok(MAXKEYS.has('hyungClear')&&MAXKEYS.has('hyungKinds'),'흉괘 기록은 최댓값(MAXKEYS)');
// 성난 엘리트를 쓰러뜨리면 이번 판 rageKills +1 → 판이 끝나면 meta.stats로 합쳐짐
newGame('seonbi',[],0,'normal','normal',3);G.queue.length=0;show(null);
const e=spawnEnemy('gaekgwi',G.P.x+90,G.P.y);e.elite=true;e.rage=true;kill(e);
const e2=spawnEnemy('gaekgwi',G.P.x+90,G.P.y);e2.elite=true;kill(e2);
ok(G.rs.rageKills===1,'성난 엘리트만 셈 ('+G.rs.rageKills+')');
const s0=meta.stats.rageKills||0;mergeRun();ok((meta.stats.rageKills||0)===s0+1,'판 끝에 합쳐짐');
// 흉괘 종류: 낀 채로 깬 흉괘 id를 모아 그 수
meta.hyungWon=[];meta.stats.hyungKinds=0;
newGame('seonbi',['yangin','gosin'],0,'normal','normal',3);recordClear();
newGame('seonbi',['yangin','wonjin'],0,'normal','normal',3);recordClear();
ok(meta.stats.hyungKinds===3&&meta.hyungWon.length===3,'흉괘 종류 3 ('+meta.stats.hyungKinds+' / '+meta.hyungWon+')');
// 옛 저장(hyungWon 없음)도 열림
{const m=JSON.parse(JSON.stringify(meta));delete m.hyungWon;ok(typeof migrateMeta!=='function'||Array.isArray((migrateMeta(m)||m).hyungWon||[]),'옛 저장 hyungWon 없음 → 빈 목록');}
}
if(fails.length){console.log('FAIL tasks_v212\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS tasks_v212');
