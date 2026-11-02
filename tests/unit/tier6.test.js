// v19.0 6차 전직 뼈대: 5차를 마친 퇴마사가 Lv 60에 6차 전직 창 · 5차 전이면 안 뜸 · Lv 60 넘어 5차를 마치면 바로 대기열 ·
// 6차 칸 없는 갈래는 5에서 멈춤 · 각성 창과 함께 빠짐없이 · 설화 · 과업 · 발밑 고리
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const helpBodyText=()=>{helpTab='basic';renderHelp();return $('#helpBody').innerHTML;};
ok(typeof tierMax==='function'&&typeof TIER6_LV==='number'&&TIER6_LV===60,'tierMax·TIER6_LV=60');
ok(TIER_NAME[6]==='6차','TIER_NAME[6] 6차');
// 시험용: 선비 학문의 길에 6차 칸이 없으면 가짜 칸을 넣는다(작업 2 전에도 돌게)
const BR0=CHARS.seonbi.branches[0].tiers,fake=BR0.length<6;if(fake)BR0.push({name:'시험 6차',skill:'cheonja',bonus:'공격력 +25%',apply:B=>{B.might+=0.25},look:BR0[4].look,who:'시험',src:'https://encykorea.aks.ac.kr/'});
const T6=BR0[5];
const st6=(cid,b,tier,lvl)=>{newGame(cid,'gilil',0,'normal');G.queue.length=0;show(null);G.P.hp=G.P.maxHp=1e9;G.P.branch=b;G.P.tier=tier;G.P.lvl=lvl;G.P.xp=0;G.P.next=xpNeed(lvl);};
const lvUp=n=>{for(let i=0;i<n;i++){G.P.xp=G.P.next;gainXp(0);}};
if(typeof tierMax==='function'){
 ok(tierMax('seonbi',0)===6,'선비 학문 갈래 칸 6');
 // 5차 Lv 59 → 60
 st6('seonbi',0,5,59);lvUp(1);ok(G.queue.filter(q=>q==='adv').length===1,'5차 Lv 60: 대기열에 전직 하나 '+JSON.stringify(G.queue));
 G.queue.length=0;openAdv();ok(modal==='adv'&&/6차/.test($('#advEye').textContent)&&/60/.test($('#advEye').textContent),'전직 창 「6차 · LV 60」: '+$('#advEye').textContent);
 const m0=G.base.might;show(null);grantTier(0);   /* 검토 지적: 함께 받을 수련은 무작위라 빼고 전직만 */
 ok(G.P.tier===6&&G.weapons.some(w=>w.id===T6.skill)&&Math.abs(G.base.might-m0-0.25)<1e-9,'고르면 6차 · 기술 · 보너스');
 // 5차 전 Lv 60
 st6('seonbi',0,4,59);lvUp(1);ok(!G.queue.includes('adv'),'4차 Lv 60: 6차 전직 없음 '+JSON.stringify(G.queue));
 // Lv 63에 5차를 마침 → 바로 대기열
 st6('seonbi',0,4,63);openAdv();advPick[0]();ok(G.P.tier===5&&G.queue.includes('adv'),'Lv 63에 5차 → 6차 전직 대기 '+JSON.stringify(G.queue));
 // 칸 없는 갈래(무당은 v19.0에 6차 없음)
 /* v19.1부터 모든 갈래에 6차가 있으므로 무당 굿의 길의 6차 칸을 잠시 빼고 「칸 없는 갈래」를 검사한다 */
 const MB=CHARS.mudang.branches[0].tiers,held=MB.length>5?MB.pop():null;const noB=['mudang','gisaeng','sangin'].find(c=>tierMax(c,0)===5);
 if(noB){st6(noB,0,5,59);let err='';try{lvUp(11);for(let i=0;i<20&&G.queue.length;i++){const q=takeQueued();if(q==='adv')err+='adv 꺼냄 ';}}catch(e){err+=e.message;}
  ok(!err&&!G.queue.includes('adv')&&G.P.tier===5,`칸 없는 갈래(${noB}) Lv 70: 전직 없음 ${err}`);}
 else ok(false,'6차 칸 없는 갈래를 만들지 못함');
 if(held)MB.push(held);
 // 각성(58·62)과 함께: 셋 다 꺼내짐, 전직이 먼저
 st6('seonbi',0,5,57);lvUp(6);const order=[];while(G.queue.length){const q=takeQueued();if(q!=='lvl')order.push(q);}
 ok(order.join(',')==='adv,awk,awk','Lv 57→63: 전직이 먼저, 각성 둘도 빠짐없이: '+order.join(','));
 // 설화
 const tid=TALE_IDS.find(id=>TALES[id].cid==='seonbi')||TALE_IDS[0];
 meta.tale.frag[tid]=3;taleStart(tid);G.queue.length=0;show(null);if(modal)show(null);const cid=G.cid;
 if(tierMax(cid,G.P.branch||0)>5){G.P.tier=5;G.P.lvl=59;G.P.xp=G.P.next=xpNeed(59);gainXp(0);ok(G.queue.includes('adv'),'설화에서도 Lv 60에 6차 전직 '+cid);}
 // 과업
 const t6=TASKS.filter(t=>/^j_6b[01]_/.test(t.id));let want=0;for(const c in CHARS)for(const b of [0,1])if(tierMax(c,b)>5&&!(fake&&c==='seonbi'&&b===0))want++;
 ok((fake||want>0)&&t6.length===want&&t6.every(t=>t.need===6&&t.rw&&t.rw.coins===300),`6차 과업 ${t6.length}/${want}, 목표 6·엽전 300 `+JSON.stringify(t6.slice(0,1)));
 // 검토 지적: 6차 과업 휘장은 6차 차림 · 도움말 소개 줄은 <li> 안
 if(t6.length){const sp=taskSpec(t6.find(t=>t.id.startsWith('j_6b0_')));ok(sp&&sp[0]==='tier'&&sp[3]===5,'6차 과업 휘장은 6차 차림(칸 5) '+JSON.stringify(sp));}
 openHelp('title');helpTab='class';renderHelp();const hh=$('#helpBody').innerHTML;ok(/다산 정약용/.test(hh),'도움말 직업 탭이 그려짐');ok(!/<\/li><p class="who"/.test(hh),'도움말: 소개 줄이 <ol> 바로 아래가 아니라 <li> 안');
 ok(/레벨 10·20·30·40·50·60/.test(helpBodyText()),'처음이라면: 전직 레벨에 60');ok(!/선비·의원·장수부터/.test(helpBodyText()),'v19.1: 「선비·의원·장수부터」 글 없음');
 ok(Object.keys(CHARS).every(c=>[0,1].every(b=>tierMax(c,b)===6)),'v19.1: 12갈래 모두 6차');
 // 발밑 고리
 let n=0;const dr=drawTier6Ring;drawTier6Ring=function(){n++;return dr.apply(this,arguments);};
 st6('seonbi',0,6,61);render();const n6=n;st6('seonbi',0,5,61);n=0;render();drawTier6Ring=dr;ok(n6===1&&n===0,`발밑 고리: 6차 ${n6}번, 5차 ${n}번`);
}
if(fake)BR0.pop();
if(fails.length){console.log('FAIL tier6\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS tier6');
