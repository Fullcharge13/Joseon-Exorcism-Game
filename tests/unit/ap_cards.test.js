// v22.1 견습 레벨업 카드: 견습이 있으면 선택지 가운데 정확히 둘. 올리기·보패·모두 최대 뒤 단련. 다시 굴려도 둘. (v22.2 바꾸기 없앰)
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
{
if(typeof apStart!=='function'){ok(false,'apStart 없음');}else{
newGame('seonbi','gilil',0,'normal','normal');show(null);
let o=genOptions();ok(!o.some(x=>/^ap/.test(x.k)),'견습 없으면 견습 카드 없음');
G.north=true;G.stage=10;apStart('girl');
for(let t=0;t<20;t++){o=genOptions();const a=o.filter(x=>/^ap/.test(x.k));if(a.length!==2){ok(false,'견습 카드 둘 (지금 '+a.length+')');break;}
  if(!a.every(x=>x.name&&x.desc&&x.badge&&/견습/.test(x.badge+x.bc)))ok(false,'카드 꾸밈(이름·설명·견습 꼬리표)');}
// 다시 굴리기(아직 올릴 것이 있을 때)
G.rr=3;curOpts=genOptions();reroll();ok(curOpts.filter(x=>/^ap/.test(x.k)).length===2,'다시 굴려도 둘');
// 올리기(v22.2 바꾸기 없음 — ap_v222)
applyOpt(decorate({k:'apw',id:'saechong'}));ok(G.ap.w.id==='saechong'&&G.ap.w.lv===2,'새총 Lv2');
ok(!apOpts(new Set()).some(x=>x.id==='mokgeom'),'소녀에게 소년 무기 카드 없음');
applyOpt(decorate({k:'app',id:'daenggi'}));ok(G.ap.p&&G.ap.p.id==='daenggi'&&G.ap.p.lv===1,'댕기 Lv1');
applyOpt(decorate({k:'app',id:'daenggi'}));ok(G.ap.p.lv===2,'댕기 Lv2');
// 모두 최대 → 단련 한 장, 퇴마사 칸은 줄지 않음
G.ap.w.lv=5;G.ap.p.lv=5;
const opts=apOpts(new Set());ok(opts.length===1&&opts[0].k==='aptr','최대 뒤 단련 카드만');
{const B=(G.P.luck?4:3)+G.mods.choice,o2=genOptions();ok(o2.filter(x=>!/^ap/.test(x.k)).length===B||o2.length===B+1,'단련 한 장일 때 퇴마사 칸 그대로 ('+o2.length+')');}
const tr0=G.ap.tr||0;applyOpt(decorate({k:'aptr'}));ok((G.ap.tr||0)===tr0+1,'단련 +1');
}
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS ap_cards');
if(fails.length)process.exitCode=1;
