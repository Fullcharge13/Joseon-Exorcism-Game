// v21.2 엘리트 성난 행동: 체력 절반 아래(삼두구미는 다시 일어난 뒤) 두 번째 행동, 경고 뒤 피해, 알림 한 번
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
{
const IDS=['gaekgwi','juktong','beomnam','gomnaru','gildal','yeogwi','heukryong','keunmegi','samdugumi','hwama'];
ok(typeof ELITE_RAGE==='object'&&IDS.every(id=>ELITE_RAGE[id]),'ELITE_RAGE 10종 ('+(typeof ELITE_RAGE==='object'?Object.keys(ELITE_RAGE):'없음')+')');
const mk=id=>{newGame('seonbi',[],0,'normal','normal',3);G.queue.length=0;show(null);G.stage=Math.max(0,STAGES.findIndex(s=>s.elite2===id));
  const e=spawnEnemy(id,G.P.x+90,G.P.y);e.elite=true;e.hp=e.maxHp=e.maxHp*10;G.warns.length=0;G.ebul.length=0;G.ezones.length=0;return e;};
const mine=(e,id)=>G.warns.filter(w=>w.own===id).length+G.ebul.filter(b=>b.own===id).length;
const run=(e,s)=>{for(let t=0;t<s;t+=0.05){G.time+=0.05;if(typeof eliteRage==='function')eliteRage(e,0.05,G.P);for(const w of G.warns)w.t-=0.05;}};
for(const id of IDS){
  let e=mk(id);run(e,8);ok(!e.rage&&mine(e,id)===0,id+': 체력이 넉넉하면 성난 행동 없음 ('+mine(e,id)+')');
  e=mk(id);if(id==='samdugumi'){e.hp=e.maxHp*0.4;run(e,6);ok(!e.rage,'삼두구미: 되살아나기 전엔 성내지 않음');e.revived=true;}
  e.hp=e.maxHp*0.4;let toasts=0;const tst=toast;toast=(t,c)=>{if(/성났다/.test(t))toasts++;};
  try{run(e,8);}finally{toast=tst;}
  ok(e.rage===true,id+': 성남');ok(mine(e,id)>0,id+': 8초 안에 성난 행동(경고·탄) ('+mine(e,id)+')');ok(toasts===1,id+': 알림 한 번 ('+toasts+')');
  const hostile=G.warns.filter(w=>w.own===id);ok(hostile.every(w=>w.dmg>0&&w.max>=0.8),id+': 경고는 0.8초 이상·피해 있음');
  e=mk(id);if(id==='samdugumi')e.revived=true;e.hp=e.maxHp*0.4;e.frz=5;run(e,8);ok(mine(e,id)===0,id+': 얼어 있으면 안 함');
}
// 경고 피해가 그 엘리트 몫으로 기록됨
{const e=mk('gaekgwi');G.P.iframe=0;const s=G.rs.taken||{};warn({x:G.P.x,y:G.P.y,r:30,t:0.01,dmg:10,own:'gaekgwi'});G.warns[G.warns.length-1].t=0;resolveWarn(G.warns[G.warns.length-1]);
 ok(JSON.stringify(G.rs).includes('gaekgwi'),'경고 피해가 객귀 몫으로 기록');}
}
if(fails.length){console.log('FAIL elite_rage\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS elite_rage');
