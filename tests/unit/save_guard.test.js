// 저장 지키기(v19.8): 읽을 수 없는 저장은 -broken 칸에 그대로 옮겨 두고, 지난번 제대로 읽힌 저장(-bak)으로 시작한다.
// 저장 코드(JTM1:)는 진행을 글자로 옮기고, 엉뚱한 코드는 거른다.
// WANT=rescue  SAVE=깨진 저장 + SAVE_BAK=좋은 저장 → 좋은 저장으로 시작
// WANT=none    SAVE=깨진 저장, 백업 없음 → 새로 시작하되 깨진 원본은 남김
// WANT 없음    좋은 저장(또는 없음) → 불러온 저장이 백업 칸에 남고, 저장 코드가 왕복한다
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const want=process.env.WANT||'code';
const notes=k=>DIAG.log.filter(e=>e.kind==='저장 복구'&&e.msg.includes(k)).length;
if(want==='rescue'){
  ok(meta.coins>=4321&&meta.up.hp===1&&meta.stats.kills===99,'백업 저장으로 시작 (엽전 '+meta.coins+')');
  ok(meta.unl.includes('char:uiwon')&&meta.set.vol===55,'백업의 해금·설정이 그대로');
  ok(/"vol$/.test(localStorage.getItem(SAVE_BROKEN)||''),'깨진 원본은 -broken 칸에 그대로');
  ok(saveParse(localStorage.getItem(SAVE_KEY))!==null,'본 저장 칸은 다시 읽을 수 있는 저장');
  ok(notes('백업')===1,'오류 기록에 복구 한 건 ('+notes('백업')+')');
  ok(saveRescue==='bak','시작 화면 안내 표시 ('+saveRescue+')');
}else if(want==='empty'){   // v20.4 빈 저장(빈 글·띄어쓰기만)은 저장이 없는 것으로: 안내 없이 새로 시작
  ok(saveRescue===null,'빈 저장은 복구 안내 없음 ('+saveRescue+')');
  ok(localStorage.getItem(SAVE_BROKEN)===null,'빈 저장은 -broken 칸에 옮기지 않음');
  ok(notes('백업')===0,'오류 기록에 남기지 않음');
}else if(want==='none'){
  ok(meta.coins===0&&meta.unl.length&&meta.unl[0]==='char:seonbi','새 저장으로 시작');
  ok(/"vol$/.test(localStorage.getItem(SAVE_BROKEN)||''),'깨진 원본은 -broken 칸에 그대로');
  ok(notes('백업 없음')===1,'오류 기록에 한 건 ('+notes('백업 없음')+')');
  ok(saveRescue==='none','시작 화면 안내 표시 ('+saveRescue+')');
}else{
  if(process.env.SAVE){const o=JSON.parse(require('fs').readFileSync(process.env.SAVE,'utf8')),bq=saveParse(localStorage.getItem(SAVE_BAK)||'null');ok(bq&&bq.coins===o.coins,'제대로 읽힌 저장이 백업 칸에(v20.4부터는 불러오며 옮긴 뒤 저장한 것일 수 있음 — 엽전 '+o.coins+' / '+(bq&&bq.coins)+')');}
  ok(saveRescue===null&&localStorage.getItem(SAVE_BROKEN)===null,'멀쩡한 저장은 복구 안내 없음');
  meta.coins=12345;meta.set.lang='zh';meta.tale.frag.woochi=2;meta.stats.kills=7;meta.note='한글·漢字 그대로';
  const code=saveCode();
  ok(code.startsWith('JTM1:')&&/^[A-Za-z0-9+/=:]+$/.test(code),'코드는 JTM1: + base64');
  const back=saveDecode(code);
  ok(back&&back.coins===12345&&back.set.lang==='zh'&&back.tale.frag.woochi===2&&back.stats.kills===7,'코드가 진행을 그대로 담음');
  ok(back&&back.note==='한글·漢字 그대로','한글·한자가 깨지지 않음');
  ok(saveDecode(' \n'+code.slice(0,20)+'\n  '+code.slice(20)+'\n')!==null,'줄바꿈·띄어쓰기가 섞여도 읽음');
  for(const bad of ['', 'hello', 'JTM1:', 'JTM1:@@@', 'JTM1:'+btoa('[1,2]'), 'JTM1:'+btoa('"str"'), 'JTM1:'+btoa('{"coins":1'), '{"coins":1}'])
    ok(saveDecode(bad)===null,'엉뚱한 코드는 거름: '+JSON.stringify(bad).slice(0,24));
  ok(saveImport('JTM1:@@@')===false&&localStorage.getItem(SAVE_KEY)!=='JTM1:@@@','엉뚱한 코드는 저장을 건드리지 않음');
  ok(saveImport(code)===true,'맞는 코드는 받아들임');
  ok(saveParse(localStorage.getItem(SAVE_KEY)).coins===12345,'받아들인 코드가 본 저장 칸에');
  // v20.4: 저장 코드를 불러오기 전 진행을 -undo 칸에 두고 되돌릴 수 있음
  ok(typeof SAVE_UNDO==='string'&&saveParse(localStorage.getItem(SAVE_UNDO)||'null')&&saveParse(localStorage.getItem(SAVE_UNDO)).coins!==12345,'불러오기 전 진행이 -undo 칸에');
  ok(typeof saveImportUndo==='function'&&saveImportUndo()===true&&saveParse(localStorage.getItem(SAVE_KEY)).coins!==12345&&localStorage.getItem(SAVE_UNDO)===null,'불러오기 되돌리기 → 앞 진행으로, -undo 칸 비움');
  ok(typeof saveImportUndo==='function'&&saveImportUndo()===false,'되돌릴 것이 없으면 아무것도 안 함');
  // v20.4: 백업은 저장할 때마다 한 걸음 앞 저장으로(예전에는 게임을 열 때만 → 되살리면 그 사이 진행을 잃음)
  meta.coins=111;saveMeta();meta.coins=222;saveMeta();
  ok(saveParse(localStorage.getItem(SAVE_BAK)||'null')&&saveParse(localStorage.getItem(SAVE_BAK)).coins===111,'백업 = 바로 앞 저장 (엽전 '+(saveParse(localStorage.getItem(SAVE_BAK)||'null')||{}).coins+')');
  localStorage.setItem(SAVE_KEY,'{"coins":1');meta.coins=333;saveMeta();
  ok((saveParse(localStorage.getItem(SAVE_BAK)||'null')||{}).coins===111,'본 칸이 깨져 있으면 백업을 덮지 않음');
}
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS save_guard '+want);
if(fails.length)process.exitCode=1;
