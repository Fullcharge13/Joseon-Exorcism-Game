// 기록관과 본부 반응이 언어를 바꿔도 맞는 글로 보이는지(v18.1): 새 기록은 아이디로 다시 만들고, 옛 기록(완성된 한국어 글)도 간체로 옮겨 보인다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};const HAN=/[가-힣]/;
setLang('ko',false);
newGame('seonbi','gilil',0,'normal');G.queue.length=0;G.P.tier=2;G.P.branch=1;G.stage=3;G.kills=77;
const r=archiveRun(false);const koName=CHARS.seonbi.name,koTale=Object.values(TALES)[0].n,koCls=CHARS.seonbi.branches[1].tiers[1].name,koWhere=STAGES[3].name;
ok(runCls(r)===koCls,'한국어: 직업 이름을 아이디로 만듦 '+runCls(r));ok(runWhere(r)===koWhere,'한국어: 막 이름 '+runWhere(r));
meta.hub.last={win:false,kills:77,where:r.where,cls:r.cls,lvl:r.lvl,v:r.v,cid:r.cid,tier:r.tier,br:r.br,mode:r.mode,stage:r.stage};
ok(JSON.parse(JSON.stringify(r)).v===2,'저장 뒤에도 새 기록 표시가 남음');
setLang('zh',false);
ok(runCls(r)===CHARS.seonbi.branches[1].tiers[1].name&&!HAN.test(runCls(r)),'간체: 직업 이름 '+runCls(r));
ok(!HAN.test(runWhere(r)),'간체: 막 이름 '+runWhere(r));
const L=runLine(r);ok(!HAN.test(L.res)&&!HAN.test(L.J.j),'간체: 결과 줄 '+L.res+' / '+L.J.j);
ok(!HAN.test(clsT(r))&&clsT(r).includes(runCls(r)),'간체: 「 · 직업」이 붙음 '+clsT(r));
meta.hub.rx={};const say=npcReact('jumo')||'';ok(say&&!HAN.test(say),'간체: 주모 반응 '+say);
// 옛 기록: 아이디 없이 완성된 한국어 글만 있음
const old=[{cid:'seonbi',cls:koCls,where:koWhere,mode:'normal'},{cid:'seonbi',cls:koName,where:'『'+koTale+'』 2막',mode:'tale'},{cid:'seonbi',cls:koCls,where:'3번째 원정',mode:'rush'}];
for(const o of old){ok(!HAN.test(runCls(o)),'옛 기록 직업 간체 '+runCls(o));ok(!HAN.test(runWhere(o)),'옛 기록 장소 간체 '+runWhere(o));}
ok(clsT(old[1])==='','옛 기록: 직업이 퇴마사 이름과 같으면 붙이지 않음 '+clsT(old[1]));
setLang('ko',false);ok(runWhere(old[1])===old[1].where,'옛 기록은 한국어에서 그대로');
if(fails.length){console.log('FAIL i18n_arch\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS i18n_arch');
