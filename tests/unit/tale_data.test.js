// 설화 표가 게임의 다른 표와 맞는지, 옷 빛깔이 모든 차림에 들어가는지 본다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
for(const id of TALE_IDS){const t=TALES[id];
  ok(CHARS[t.cid],`${id}: 퇴마사 ${t.cid} 없음`);
  ok(t.frags.length===3&&t.frags.every(f=>f.t&&f.t.length>20),`${id}: 조각 글 3개`);
  ok(t.acts.length===3,`${id}: 막 3개`);
  ok(STAGES[t.st],`${id}: 흔적 막 ${t.st}`);
  ok(CHARS[t.cid].branches[t.start.branch],`${id}: 갈래 ${t.start.branch}`);
  for(const [w,lv] of t.start.w)ok(WD[w]&&lv>=1&&lv<=WD[w].max,`${id}: 시작 무기 ${w} ${lv}`);
  t.acts.forEach((a,i)=>{ok(STAGES[a.st],`${id} ${i+1}막: 배경 막 ${a.st}`);ok(EN[a.boss]&&BOSS[a.boss],`${id} ${i+1}막: 보스 ${a.boss}`);ok(!a.rule||TALE_RULES[a.rule],`${id} ${i+1}막: 규칙 ${a.rule}`);ok(a.intro&&a.intro.length>10,`${id} ${i+1}막: 앞 장면 글`);});
  ok(t.end&&t.end.length>30&&t.src&&t.url,`${id}: 결말·출처`);
  ok(/^#[0-9a-f]{6}$/i.test(t.skin.A),`${id}: 빛깔 색`);
}
ok(ENDING.common.length===4,'공통 결말 4장');
for(const cid in CHARS)ok(ENDING.epi[cid],`맺음말 ${cid}`);
// 설화 전용 요괴는 도감 수에 들지 않는다
ok(DOGAM_IDS.length===Object.keys(EN).filter(i=>!EN[i].tale).length&&DOGAM_IDS.every(i=>!EN[i].tale),'도감은 설화 전용 요괴를 빼고 센다');
ok(EN.jwclone&&EN.jwclone.tale&&ESPR.jwclone,'전우치 분신 보스');
// 옷 빛깔
meta.tale.done.woochi={best:300,n:1};meta.tale.skin.seonbi='jjok';
newGame('seonbi','gilil',0,'normal');
const C=CHARS.seonbi;
ok(playerLook().A==='#2f4a7a'&&playerLook().hat===C.look.hat,'기본 차림의 옷 색만 바뀜');
for(let bi=0;bi<2;bi++)for(let ti=1;ti<=5;ti++){G.P.branch=bi;G.P.tier=ti;const L=playerLook(),base=C.branches[bi].tiers[ti-1].look;
  ok(L.A==='#2f4a7a'&&L.hat===base.hat&&L.item===base.item&&L.T===(base.T||base.A),`${bi}갈래 ${ti}차 옷 색(모자·장식은 그대로)`);}
newGame('jangsu','gilil',0,'normal');
ok(playerLook().A===CHARS.jangsu.look.A,'빛깔을 고르지 않은 퇴마사는 그대로');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS tale_data');
if(fails.length)process.exitCode=1;
