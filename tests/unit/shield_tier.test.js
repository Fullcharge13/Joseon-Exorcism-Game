// v18.5 방패 단계: 장수의 등패가 레벨마다 죽패 → 생우피방패 → 장방패 → 원방패 → 등패, 진화하면 철갑 등패.
// 이름·그림만 바뀌고 크기·피해·막는 범위는 v18.4와 같다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const NAMES=['죽패','생우피방패','장방패','원방패','등패'];
ok(typeof wName==='function','wName(무기) 이름 함수가 있음');
ok(Array.isArray(WD.deungpae.lvName)&&WD.deungpae.lvName.length===5,'WD.deungpae.lvName 다섯 단계');
if(typeof wName==='function'){
 for(let lv=1;lv<=5;lv++)ok(wName({id:'deungpae',lv})===NAMES[lv-1],`Lv${lv} 이름 ${NAMES[lv-1]}: ${wName({id:'deungpae',lv})}`);
 ok(wName({id:'deungpae',lv:5,evo:true})==='철갑 등패','진화 이름 철갑 등패');
 // 다른 무기는 예전 그대로
 ok(wName({id:'hwando',lv:3})===WD.hwando.name,'다른 무기는 d.name 그대로');
 ok(wName({id:WD.hwando.evo?'hwando':'hwando',lv:8,evo:true})===WD.hwando.evoName,'다른 무기 진화는 evoName 그대로');
 // 이상한 레벨(옛 저장·한계 돌파 뒤)에도 이름이 비지 않음
 ok(wName({id:'deungpae',lv:0})==='죽패'&&wName({id:'deungpae',lv:9})==='등패'&&wName({id:'deungpae'})==='죽패','레벨 범위 밖은 끝 이름');
}
// 레벨업 카드: 새로 얻으면 죽패, 올리면 「지금 → 다음」 이름
meta.set.vfx='on';newGame('jangsu',0,0,'normal');G.queue.length=0;
let w=G.weapons.find(w=>w.id==='deungpae');if(!w){G.weapons.push({id:'deungpae',lv:1});w=G.weapons.find(w=>w.id==='deungpae');}
w.lv=1;const c1=decorate({k:'wup',id:'deungpae'});ok(c1.name.includes('죽패')&&c1.name.includes('생우피방패')&&c1.name.includes('→'),'Lv1 카드 「죽패 → 생우피방패」: '+c1.name);
w.lv=4;const c4=decorate({k:'wup',id:'deungpae'});ok(c4.name.includes('원방패')&&c4.name.includes('등패'),'Lv4 카드 「원방패 → 등패」: '+c4.name);
const G2=G.weapons;G.weapons=G2.filter(x=>x.id!=='deungpae');const cn=decorate({k:'wnew',id:'deungpae'});G.weapons=G2;ok(cn.name==='죽패','새로 얻는 카드 죽패: '+cn.name);
// 아래 칸(무기 슬롯) 이름표
w.lv=3;ok(buildHTML().includes('장방패'),'무기 칸에 지금 단계 이름(장방패)');
// 그림: 여섯 단계 모두 서로 다른 그림
ok(typeof shieldSpr==='function','shieldSpr(레벨, 진화) 그림 함수');
if(typeof shieldSpr==='function'){const S=[1,2,3,4,5].map(l=>shieldSpr(l,false)).concat([shieldSpr(5,true)]);
 ok(S.every(s=>s&&s.width>0&&s.height>0),'여섯 그림 모두 있음');
 ok(new Set(S).size===6,'여섯 그림이 서로 다른 그림');ok(shieldSpr(2,false)===shieldSpr(2,false),'같은 단계는 미리 만든 같은 그림(매 프레임 새로 만들지 않음)');}
// 규칙은 그대로: v18.4와 같은 크기·피해·밀침(표 값 고정)
{const P={x:0,y:0,dirx:1,diry:0,area:1,might:1};G.ebul.length=0;
 const R=[];for(let lv=1;lv<=5;lv++){const ww={id:'deungpae',lv};WD.deungpae.upd(ww,0.016,P);R.push(ww.shields[0][3]);}
 ok(JSON.stringify(R)===JSON.stringify([8,8,10,10,12]),'방패 크기 레벨별 8,8,10,10,12 그대로: '+R);
 const we={id:'deungpae',lv:5,evo:true};WD.deungpae.upd(we,0.016,P);ok(we.shields.length===2&&we.shields[0][3]===13,'진화 방패 둘 · 크기 13 그대로');}
// 검토 지적(중요): 진화 짝 줄·지난 출정 아이콘·피해 비중 줄도 지금 단계 이름
w.lv=2;w.evo=false;ok(evoHTML({k:'pnew',id:'tugu'}).includes('생우피방패'),'투구 카드의 진화 짝 줄에 지금 단계(생우피방패): '+evoHTML({k:'pnew',id:'tugu'}).replace(/<[^>]+>/g,''));
ok(buildMini({w:[{id:'deungpae',l:3,e:0}],p:{}}).includes('장방패'),'지난 출정 아이콘 이름 장방패');ok(buildMini({w:[{id:'deungpae',e:0}],p:{}}).includes('죽패'),'옛 기록(레벨 없음)은 죽패');
ok(srcName('deungpae','jangsu',[{id:'deungpae',l:4,e:0}])==='원방패','피해 비중 줄: 그 판의 단계(원방패)');ok(srcName('deungpae','jangsu')===WD.deungpae.name,'여러 판 합계는 무기 이름(등패)');
ok(srcName('deungpae','jangsu',[{id:'deungpae',l:5,e:1}])==='철갑 등패','피해 비중 줄: 진화');
// 검토 지적(사소): 아이콘도 단계마다 · 엉뚱한 레벨에도 그림이 깨지지 않음 · 그림은 점 단위로 서로 다름
ok(typeof wIcon==='function'&&(wIcon({id:'deungpae',lv:1}),wIcon({id:'deungpae',lv:4}),wIcon({id:'deungpae',lv:5,evo:true}),typeof SHIELD_ICON!=='undefined'&&SHIELD_ICON[0]&&SHIELD_ICON[3]&&SHIELD_ICON[5])&&wIcon({id:'hwando',lv:2})===ICON.hwando,'아이콘: 방패는 단계마다, 다른 무기는 그대로');
ok(cn.ic&&typeof wIcon==='function'&&cn.ic.includes(wIcon({id:'deungpae',lv:1})),'새로 얻는 카드 아이콘이 죽패 그림');
let nanOk=true;try{shieldSpr(NaN,false);shieldSpr(undefined,false);shieldSpr('x',true);}catch(e){nanOk=false;}ok(nanOk,'엉뚱한 레벨에도 방패 그림이 깨지지 않음');
ok(typeof SHIELD_ROWS!=='undefined'&&new Set(SHIELD_ROWS.map(r=>JSON.stringify(r))).size===6&&SHIELD_ROWS.every(r=>r.length>=12),'여섯 그림의 점 배치가 서로 다름(높이 12 이상)');
if(fails.length){console.log('FAIL shield_tier\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS shield_tier');
