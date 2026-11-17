// v21.2 흉괘 패: 나쁜 효과만, 따로 3칸, 장마다 엽전 +15%, 제10막을 깨야 열림
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
{
const nearly=(a,b)=>Math.abs(a-b)<1e-9;
const H=typeof HYUNG==='object'?HYUNG:{};
ok(Object.keys(H).length===7,'흉괘 7장 ('+Object.keys(H).length+')');
for(const id in H)ok(H[id].n&&H[id].d&&H[id].fx,'흉괘 '+id+' 이름·설명·효과');
ok(typeof hyungList==='function'&&hyungList(['yangin','yangin','x','gongmang','gosin','wonjin']).join()==='yangin,gongmang,gosin','hyungList: 겹침·없는 것 거르고 세 장');
ok(typeof hyungList==='function'&&hyungList('gilil').length===0&&hyungList(null).length===0,'hyungList: 점괘 패·빈 값은 흉괘 아님');
const ng=c=>newGame('seonbi',c,0,'normal','normal',7);
// 점괘 패와 흉괘가 섞여 와도 나뉨 · 엽전·효과
ng([]);const coin0=G.mods.coin,dmg0=G.mods.dmgIn,ch0=G.mods.choice,heal0=G.P.healM,bul0=G.mods.eBul;
ng(['gilil','yangin','gongmang']);
ok(G.cards.join()==='gilil'&&(G.hyung||[]).join()==='yangin,gongmang','G.cards·G.hyung 나뉨 ('+G.cards+' / '+G.hyung+')');
ok(nearly(G.mods.coin,coin0*1.15*1.15),'엽전 ×1.15² ('+G.mods.coin+')');
ok(nearly(G.mods.dmgIn,dmg0*1.3),'양인살 받는 피해 +30%');ok(G.mods.choice===ch0-1,'공망 선택지 −1');
ng(['gosin']);ok(nearly(G.P.healM,heal0*0.5),'고신살 회복량 절반 ('+G.P.healM+')');
ng(['hyeonchim']);ok(nearly(G.mods.eBul,bul0*1.3),'현침살 요괴 탄 +30%');
ng(['gwimun']);ok(G.mods.gwimun===true,'귀문관살 켬');ng([]);ok(!G.mods.gwimun,'흉괘 없으면 귀문관살 끔');
// 원진살: 엘리트 체력·속도
const elite=c=>{ng(c);G.queue.length=0;show(null);const s=RNG;RNG=()=>0.5;spawnElite();RNG=s;const e=G.enemies[G.enemies.length-1];return [e.maxHp,e.spd];};
const [h0,s0]=elite([]),[h1,s1]=elite(['wonjin']);
ok(nearly(h1,h0*1.6),'원진살 엘리트 체력 ×1.6 ('+h0+' → '+h1+')');ok(nearly(s1,s0*1.15),'원진살 엘리트 속도 ×1.15 ('+s0+' → '+s1+')');
// 상문살: 일반 요괴가 쓰러지면 경고 원(난수 0) · 피해 6+막×2 · 엘리트는 없음
ng(['sangmun']);G.queue.length=0;show(null);G.warns.length=0;
{const s=RNG;RNG=()=>0;const e=spawnEnemy(curStg().en?curStg().en[0]:Object.keys(EN)[0],G.P.x+80,G.P.y);kill(e);RNG=s;}
ok(G.warns.length===1&&G.warns[0].dmg===6+(G.stage+1)*2&&G.warns[0].r===22,'상문살 경고 1개·피해 '+(6+(G.stage+1)*2)+' ('+JSON.stringify(G.warns.map(w=>[w.dmg,w.r]))+')');
G.warns.length=0;{const s=RNG;RNG=()=>0;spawnElite();const e=G.enemies[G.enemies.length-1];kill(e);RNG=s;}
ok(G.warns.filter(w=>w.sangmun).length===0,'상문살: 엘리트는 불꽃 없음');
// 무더기 처치에도 경고 60개 넘지 않음
G.warns.length=0;{const s=RNG;RNG=()=>0;for(let i=0;i<120;i++){const e=spawnEnemy(curStg().en?curStg().en[0]:Object.keys(EN)[0],G.P.x+80+i,G.P.y);kill(e);}RNG=s;}
ok(G.warns.length<=60,'상문살 경고 상한 60 ('+G.warns.length+')');
ng([]);G.warns.length=0;{const s=RNG;RNG=()=>0;const e=spawnEnemy(curStg().en?curStg().en[0]:Object.keys(EN)[0],G.P.x+80,G.P.y);kill(e);RNG=s;}
ok(G.warns.length===0,'흉괘 없으면 상문살 없음');
// 옛 판 기록(점괘 한 장 글자)도 그대로
ng('gilil');ok(G.cards.join()==='gilil'&&(G.hyung||[]).length===0,'옛 기록(글자 한 장) → 흉괘 없음');
// 칸 잠금 · 상한
meta.stats.clears=0;prep.hyung=[];
ok(typeof prepHyungOk==='function'&&!prepHyungOk('yangin'),'제10막을 깨기 전엔 잠김');
meta.stats.clears=1;
ok(typeof prepHyungOk==='function'&&prepHyungOk('yangin'),'깬 뒤엔 열림');
if(typeof prepHyungToggle==='function')for(const id of ['yangin','gongmang','gosin','wonjin'])prepHyungToggle(id);
ok((prep.hyung||[]).join()==='yangin,gongmang,gosin','세 장 상한 ('+prep.hyung+')');
if(typeof prepHyungToggle==='function')prepHyungToggle('yangin');ok((prep.hyung||[]).join()==='gongmang,gosin','다시 누르면 뺌');
// 깬 기록: 낀 장 수의 최댓값
meta.stats.hyungClear=0;ng(['yangin','gongmang']);recordClear();ok(meta.stats.hyungClear===2,'hyungClear 2 ('+meta.stats.hyungClear+')');
ng(['yangin']);recordClear();ok(meta.stats.hyungClear===2,'더 적게 깨도 줄지 않음');
}
if(fails.length){console.log('FAIL hyung\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS hyung');
// 검토 지적: 흉괘 엽전 보너스가 결과 화면의 보상(막·처치·평정 보너스)에도 붙어야 함 — 줍는 엽전은 이미 G.mods.coin
{const f=[];const ok2=(c,m)=>{if(!c)f.push(m);};
 const run=c=>{newGame('seonbi',c,0,'normal','normal',7);G.coins=0;G.kills=250;G.stage=4;return typeof runEarned==='function'?runEarned(true):NaN;};
 const a=run([]),b=run(['yangin','gosin','gongmang']);
 ok2(Math.abs(b/a-Math.pow(1.15,3))<0.02,'결과 보상도 흉괘 ×1.15³ ('+a+' → '+b+')');
 if(f.length){console.log('FAIL hyung(보상)\n  '+f.join('\n  '));process.exitCode=1;}}
