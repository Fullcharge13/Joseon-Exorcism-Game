// v21.1 주막: 효과 없는 물건에 엽전만 빠지지 않음 · 보부상 보따리가 진화 Lv·숙련도 키움
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const TV=id=>TAVERN.find(t=>t.id===id);
const WW=Object.keys(WD).filter(k=>WD[k].type==='w'&&!WD[k].fuse&&!WD[k].job&&WD[k].evo);
const fresh=()=>{newGame('seonbi',[],0,'normal','normal',7);G.queue.length=0;show(null);G.weapons.length=0;for(const k in G.passives)delete G.passives[k];G.tavBuy={};G.coins=1000;};
const fillPass=()=>{let n=0;for(const id in PD){if(PD[id].job||n>=P_SLOTS)continue;G.passives[id]=PD[id].max;n++;}};
const why=id=>typeof tavWhy==='function'?tavWhy(TV(id)):'(tavWhy 없음)';
ok(typeof tavWhy==='function','tavWhy 있음');ok(typeof tavBuy==='function','tavBuy 있음');
{
// 1) 다 키운 진화 무기(진화 Lv 0) + 보패 모두 최대 → 보따리가 진화 Lv를 올림
fresh();fillPass();
const w={id:WW[0],lv:WD[WW[0]].max,evo:true,ev2:0,t:0.2,on:false,pos:[],seals:[]};G.weapons.push(w);
ok(why('bottari')===null,'보따리: 진화 Lv를 올릴 수 있으면 살 수 있음 ('+why('bottari')+')');
const c0=G.coins;if(typeof tavBuy==='function')tavBuy(TV('bottari'));
ok((w.ev2||0)===1,'보따리가 진화 Lv 0 → 1 ('+(w.ev2||0)+')');
ok(G.coins<c0,'산 값만큼 엽전이 빠짐');
}
{
// 2) 모두 끝까지(진화 Lv 5, 보패 최대) → 보물 상자처럼 다 키운 무기 하나에 한계 돌파 +1
fresh();fillPass();
for(const id of WW.slice(0,4))G.weapons.push({id,lv:WD[id].max,evo:true,ev2:EV2_MAX,t:0.2,on:false,pos:[],seals:[]});
ok(why('bottari')===null,'보따리: 다 키운 무기가 있으면 살 수 있음 ('+why('bottari')+')');
const lb0=G.weapons.reduce((s,w)=>s+(w.lb||0),0),c0=G.coins;tavBuy(TV('bottari'));
const lb1=G.weapons.reduce((s,w)=>s+(w.lb||0),0);
ok(lb1===lb0+1,'보따리: 한계 돌파 합 '+lb0+' → '+lb1+' (+1)');ok(G.coins<c0,'한계 돌파도 엽전이 빠짐');
}
{
// 2b) 무기가 없고 보패만 다 참 → 키울 것도 돌파할 무기도 없음 → 못 삼 · 엽전 그대로
fresh();fillPass();
const r=why('bottari');ok(typeof r==='string'&&r.length>0,'보따리: 키울 것이 없으면 이유 문구 ('+r+')');
const c0=G.coins,b0=G.tavBuy.bottari||0;const got=tavBuy(TV('bottari'));
ok(got===false&&G.coins===c0&&(G.tavBuy.bottari||0)===b0,'키울 것이 없으면 사지 않음·엽전 그대로 ('+c0+' → '+G.coins+')');
}
{
// 3) 인장 장인: 모든 무기의 인장 칸이 다 참 → 못 삼 / 한 칸 비면 삼
fresh();const w={id:WW[0],lv:1,evo:false,t:0.2,on:false,pos:[],seals:[]};G.weapons.push(w);
ok(why('injang')===null,'인장: 빈 칸이 있으면 살 수 있음 ('+why('injang')+')');
w.seals=Array(sealSlots(w)).fill(Object.keys(SEALS).find(k=>sealOk(w,k)));
const r=why('injang');ok(typeof r==='string'&&r.length>0,'인장: 칸이 다 차면 이유 문구 ('+r+')');
const c0=G.coins;ok(typeof tavBuy==='function'&&tavBuy(TV('injang'))===false&&G.coins===c0,'인장: 칸이 다 차면 엽전 그대로');
}
{
// 4) 정화수: 축복이 모두 최대이고 쌍신도 없음 → 못 삼 / 하나라도 남으면 삼
fresh();for(const id in BLESS)G.bless[id]=0;for(const d in DUO)G.duo[d]=0;
ok(why('jeonghwa')===null,'정화수: 받을 축복이 있으면 살 수 있음 ('+why('jeonghwa')+')');
for(const id in BLESS)G.bless[id]=3;for(const d in DUO)G.duo[d]=1;
const r=why('jeonghwa');ok(typeof r==='string'&&r.length>0,'정화수: 축복이 다 차면 이유 문구 ('+r+')');
const c0=G.coins;ok(typeof tavBuy==='function'&&tavBuy(TV('jeonghwa'))===false&&G.coins===c0,'정화수: 다 차면 엽전 그대로');
}
{
// 5) 언제나 쓸모 있는 물건은 그대로 삼
fresh();for(const id of ['gukbap','makgeolli','santong','bujeok','mul'])ok(why(id)===null,id+' 언제나 살 수 있음');
const r0=G.rr;ok(typeof tavBuy==='function'&&tavBuy(TV('santong'))===true&&G.rr===r0+2,'산통 +2');
}
if(fails.length){console.log('FAIL tavern_effect\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS tavern_effect');
