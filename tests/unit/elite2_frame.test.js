// v19.4 막별 엘리트 틀(설계 docs/specs/2026-11-03-막별-엘리트.md 2·4장):
// 중간 보스 전 = 기존 엘리트, 뒤 = 새 엘리트(elite2, 없으면 기존) · 장면 바꾸기(걷기 2장 0.25초 + 행동 1장) · 보조물(helper)은 도감·상자·엘리트 수에서 빠짐
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
ok(typeof pickEliteId==='function'&&typeof addElite2==='function'&&typeof eliteFrame==='function'&&typeof ELITE_AI==='object','pickEliteId·addElite2·eliteFrame·ELITE_AI');
const G12=(ch)=>Array.from({length:16},()=>ch.repeat(12));
if(typeof addElite2==='function'){
 addElite2('__t',{n:'시험 엘리트',c:'e',st:1,A:'#888888',B:'#444444',d:'시험',frames:[G12('A'),G12('B'),G12('w')]});
 addElite2('__h',{n:'시험 보조',c:'n',st:1,A:'#888888',helper:1,hp:10,frames:[Array.from({length:12},()=>'AAAAAAAA')]});
 ok(EN.__t&&ESPR.__t&&ESPR2.__t&&ESPR2.__t.length===3&&ESPR2.__t[0].w===12&&ESPR2.__t[0].hgt===16,'새 엘리트 세 장 12×16');
 ok(DOGAM_IDS.includes('__t')&&!DOGAM_IDS.includes('__h'),'보조물은 도감에서 빠짐');
 // ① 나오는 때
 newGame('seonbi',null,0,'normal');G.queue.length=0;show(null);const s0=STAGES[0],had=s0.elite2;s0.elite2='__t';
 G.midDone=false;G.mid=null;ok(pickEliteId()===s0.elite,'중간 보스 전: 기존');
 G.midDone=true;G.mid={};ok(pickEliteId()===s0.elite,'중간 보스가 살아 있으면: 기존');
 G.mid=null;ok(pickEliteId()==='__t','중간 보스를 쓰러뜨린 뒤: 새 엘리트');
 G.loop=1;ok(pickEliteId()==='__t','끝없는 밤 두 바퀴째도 같은 규칙');G.loop=0;
 const sN=STAGES.findIndex(s=>!s.elite2);if(sN>=0){G.stage=sN;ok(pickEliteId()===STAGES[sN].elite,'elite2 없는 막은 기존');}G.stage=0;
 G.enemies.length=0;spawnElite();const el=G.enemies.find(e=>e.elite);ok(el&&el.kind==='__t'&&Math.abs(el.maxHp-spawnEnemy('__t').maxHp*10)<1e-6,'spawnElite가 새 엘리트를 체력 ×10으로');
 // 어려움: 중간 보스와 함께 나오는 엘리트는 기존
 newGame('seonbi',null,0,'hard');G.queue.length=0;show(null);G.enemies.length=0;G.midDone=true;G.mid=null;spawnBoss(s0.mid,true);ok(G.enemies.some(e=>e.elite&&e.kind===s0.elite),'어려움 eliteWithMid는 기존 엘리트');
 // 설화 막에서도 오류 없음
 let terr='';try{const tid=TALE_IDS[0];meta.tale.frag[tid]=3;taleStart(tid);G.queue.length=0;show(null);G.midDone=true;G.mid=null;spawnElite();for(let i=0;i<120;i++){G.P.hp=G.P.maxHp;G.queue.length=0;if(modal)show(null);update(1/60);}}catch(e){terr=e.message;}ok(!terr,'설화 막 새 엘리트 오류 없음 '+terr);
 // ② 장면 바꾸기
 newGame('seonbi',null,0,'normal');G.queue.length=0;show(null);G.enemies.length=0;const e=spawnEnemy('__t',G.P.x+60,G.P.y);e.elite=true;
 G.time=0.1;const f0=eliteFrame(e);G.time=0.35;const f1=eliteFrame(e);G.time=0.6;const f2=eliteFrame(e);ok(f0!==f1&&f0===f2&&[0,1].includes(f0),'걷기 0.25초마다 0↔1: '+[f0,f1,f2]);
 e.eact='x';ok(eliteFrame(e)===2,'행동 중 2');
 let rerr='';try{render();e.frz=2;render();kill(e);render();}catch(x){rerr=x.message;}ok(!rerr,'행동 그림인 채 얼림·쓰러짐 그리기 오류 없음 '+rerr);
 ok(eliteFrame({kind:'geolgwi'})===0,'장면 없는 요괴는 0');
 // ③ 보조물: 도감 만남·상자·엘리트 수 없음, 퇴치 수는 셈
 newGame('seonbi',null,0,'normal');G.queue.length=0;show(null);G.enemies.length=0;const k0=G.kills,el0=G.rs.elites,it0=G.items.filter(i=>i.k==='chest').length;
 const h=spawnEnemy('__h',G.P.x+60,G.P.y);ok(!G.rs.seen.__h,'보조물은 만남에 안 셈');kill(h);
 ok(G.kills===k0+1&&G.rs.elites===el0&&G.items.filter(i=>i.k==='chest').length===it0&&!G.rs.seen.__h,'보조물: 퇴치 수만 셈');
 s0.elite2=had;delete EN.__t;delete EN.__h;DOGAM_IDS.splice(DOGAM_IDS.indexOf('__t'),1);
}
if(fails.length){console.log('FAIL elite2_frame\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS elite2_frame');
