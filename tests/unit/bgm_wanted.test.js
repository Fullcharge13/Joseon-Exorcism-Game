// v21.0 배경음: 「지금 들려야 할 곡」(bgmWanted) · 바꾸기 규칙(bgmNext) · 설정 기본값
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
{
ok(typeof bgmWanted==='function'&&typeof bgmNext==='function','bgmWanted·bgmNext 있음');
if(typeof bgmWanted==='function'){
 const W=(o)=>bgmWanted({G:null,modal:null,vol:60,muted:false,...o});
 const g=(o)=>({over:false,stage:0,loop:0,boss:null,mode:'normal',...o});
 const eq=(r,id,gain,m)=>ok(r&&r.id===id&&Math.abs(r.gain-gain)<1e-9,m+' → '+JSON.stringify(r)+' (바람 '+id+' · '+gain+')');
 // 판 밖
 eq(W({}),'hub',1,'시작 화면(판 없음)');
 eq(W({modal:'hub'}),'hub',1,'본부');
 eq(W({modal:'settings'}),'hub',1,'판 밖 설정');
 // 판 안
 eq(W({G:g({stage:0})}),'s01',1,'1막');
 eq(W({G:g({stage:6})}),'s07',1,'7막');
 eq(W({G:g({stage:2,boss:{hp:100}})}),'b03',1,'3막 보스가 나와 있음');
 eq(W({G:g({stage:2,boss:null,mid:{hp:50}})}),'s03',1,'중간 보스는 막 곡 그대로');
 eq(W({G:g({stage:-1})}),'s01',1,'막 넘어가는 중(-1)은 1막');
 eq(W({G:g({stage:10,north:true})}),'s11',1,'v22.0 2부 11막 → s11');
 eq(W({G:g({stage:13,north:true,boss:{hp:9}})}),'b14',1,'v22.0 2부 14막 보스 → b14');
 eq(W({G:g({stage:15,loop:1})}),'s01',1,'15칸 넘으면 1막으로 돌림');
 eq(W({G:g({stage:4,mode:'tale'})}),'s05',1,'설화 출정 5막');
 eq(W({G:g({stage:2,mode:'tale',tale:{st:4}})}),'s05',1,'설화 출정은 화면의 막(tale.st)을 따름 — 난이도용 stage(eq)가 아님');
 // 창 · 결과 · 끄기
 for(const m of ['levelup','pause','chest','bless','adv'])eq(W({G:g({stage:1}),modal:m}),'s02',0.5,m+' 창이면 반');
 eq(W({G:g({stage:1,over:true}),modal:'over'}),'s02',0,'결과 화면은 꺼짐(같은 곡을 줄여 끔)');
 eq(W({G:g({stage:1}),vol:0}),null,0,'배경음 0이면 곡 없음(받지도 않음)');
 eq(W({G:g({stage:1}),muted:true}),'s02',0,'음소거는 줄여 끔(곡은 그대로 — 풀면 이어서)');
 // 바꾸기 규칙: 곡이 바뀐 뒤 1초 안에는 다시 바꾸지 않음(보스가 잠깐 사라졌다 나오는 깜빡임 막기)
 let st={id:'s03',at:10};
 let n=bgmNext(st,{id:'b03',gain:1},10.5);ok(n.id==='s03','바꾼 지 0.5초면 그대로 ('+n.id+')');
 n=bgmNext(st,{id:'b03',gain:1},11.2);ok(n.id==='b03'&&n.at===11.2,'1초 넘으면 바꿈 ('+JSON.stringify(n)+')');
 n=bgmNext({id:null,at:0},{id:'s01',gain:1},0.1);ok(n.id==='s01','처음 곡은 바로');
 n=bgmNext(st,{id:'s03',gain:0.5},10.2);ok(n.id==='s03'&&n.at===10,'같은 곡이면 바꾼 시각 그대로');
 // 반복 지점: mp3 앞 지연을 브라우저가 지우지 않았을 때(길이 ≥ 곡 + 지연)만 뒤로 · 끝 덧붙임만 남은 경우(곡 + 0.02)는 그대로
 if(typeof bgmLoopPts==='function'){const man={delay:0.025};const t={sec:48};
  const a1=bgmLoopPts({duration:48+0.025+0.02},t,man),a2=bgmLoopPts({duration:48.02},t,man),a3=bgmLoopPts({duration:48},t,man);
  ok(Math.abs(a1[0]-0.025)<1e-9&&Math.abs(a1[1]-48.025)<1e-9,'앞 지연이 남은 풀기 → 0.025초 뒤에서 '+a1);
  ok(a2[0]===0&&a3[0]===0,'끝 덧붙임만 남거나 딱 맞으면 0에서 '+a2+' / '+a3);}
 // 크기 흐름: 새 곡은 0에서 시작해 목표로 커짐(소리 노드가 처음 1이라고 읽혀도) — 지금 크기를 스스로 기억
 if(typeof bgmRampNow==='function'){const r={v0:0,v1:0.33,t0:10,t1:12};
  ok(bgmRampNow(r,10)===0&&Math.abs(bgmRampNow(r,11)-0.165)<1e-9&&bgmRampNow(r,13)===0.33,'크기 흐름 0 → 0.165 → 0.33');}
 else ok(false,'bgmRampNow 있음');
}
// 받기 실패 기록: 인터넷이 없거나 파일로 직접 연 때는 「배경음 못 받음」을 오류 기록에 넣지 않음(제보 기록을 어지럽히지 않게)
if(typeof bgmLogFail==='function'){
 ok(bgmLogFail({proto:'https:',online:true})===true,'인터넷 웹 → 기록');
 ok(bgmLogFail({proto:'https:',online:false})===false,'인터넷 끊김 → 기록 안 함');
 ok(bgmLogFail({proto:'file:',online:true})===false,'파일로 직접 엶 → 기록 안 함');
} else ok(false,'bgmLogFail 있음');
// 설정: 옛 저장(배경음 칸 없음)에도 60
ok(meta&&meta.set&&meta.set.bgm===60,'처음 설정 배경음 60 ('+(meta&&meta.set&&meta.set.bgm)+')');
{const old={vol:40,shake:false};const s2=typeof metaSetDefaults==='function'?metaSetDefaults(old):null;
 ok(s2&&s2.bgm===60&&s2.vol===40&&s2.shake===false,'옛 저장 설정(배경음 칸 없음)에 배경음 60, 옛 값은 그대로 ('+JSON.stringify(s2&&{bgm:s2.bgm,vol:s2.vol,shake:s2.shake})+')');}
}
if(fails.length){console.log('FAIL bgm_wanted\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS bgm_wanted');
// v21.2.1 받기에 실패한 곡: 그 판 내내 막지 않고 30초 → 60초 → … (최대 120초) 뒤 다시 받아 봄 · 오류 기록은 곡마다 한 번
{const f=[];const ok3=(c,m)=>{if(!c)f.push(m);};
 ok3(typeof bgmRetryOk==='function','bgmRetryOk 있음');
 if(typeof bgmRetryOk==='function'){
  BGM.failed.clear&&BGM.failed.clear();const t0=1e6;const P0=performance.now;performance.now=()=>t0;
  try{
   const n0=DIAG.log.length;bgmFail('s03',new Error('Load failed'));bgmFail('s03',new Error('Load failed'));bgmFail('s02',new Error('Load failed'));
   ok3(DIAG.log.length-n0<=2,'같은 곡 실패는 한 번만 기록(s03 두 번 → 한 줄, s02 한 줄)');
   ok3(!bgmRetryOk('s02',t0+10000),'실패 10초 뒤에는 아직 다시 받지 않음');
   ok3(bgmRetryOk('s02',t0+31000),'30초가 지나면 다시 받아 봄');
   performance.now=()=>t0+31000;bgmFail('s02',new Error('Load failed'));
   ok3(!bgmRetryOk('s02',t0+31000+50000)&&bgmRetryOk('s02',t0+31000+61000),'두 번째 실패 뒤엔 60초');
   ok3(bgmRetryOk('s05',t0),'실패한 적 없는 곡은 바로');
  }finally{performance.now=P0;}}
 if(f.length){console.log('FAIL bgm_wanted(다시 받기)\n  '+f.join('\n  '));process.exitCode=1;}}
