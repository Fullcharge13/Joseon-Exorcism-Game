// 출정 준비의 설화 목록(잠김/열림/완주)과 차림 고르기, 출정 버튼 동작.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
meta.tale.frag={woochi:1,jiha:0,bari:3};meta.tale.done={bari:{best:221,n:2}};meta.tale.skin={};
ok(MODES.tale&&MODES.tale.n==='설화 출정','출정 방식에 설화 출정');
const L=taleCards();const by=id=>L.find(c=>c.id===id);
ok(by('woochi').state==='lock'&&/1\/3/.test(by('woochi').sub)&&/제1막 한양 저잣거리/.test(by('woochi').sub),'잠김: 조각 수와 찾을 곳 (지금 '+by('woochi').sub+')');
ok(by('woochi').name==='???','잠긴 설화는 이름을 숨김');
ok(by('bari').state==='done'&&/03:41/.test(by('bari').sub),'완주: 가장 빠른 완주 시간 (지금 '+by('bari').sub+')');
meta.tale.frag.jiha=3;ok(taleCards().find(c=>c.id==='jiha').state==='open','조각 3개면 열림');
// 열린 설화가 하나도 없을 때
meta.tale.frag={woochi:0,jiha:0,bari:0};meta.tale.done={};selChar='seonbi';prep.mode='tale';prep.tale=null;renderPrep();
ok(/흔적/.test($('#taleHint').textContent),'열린 설화가 없으면 흔적 안내 (지금 '+$('#taleHint').textContent+')');
ok($('#goBtn').disabled===true,'고를 설화가 없으면 출정 버튼 잠김');
begin();ok(!G||G.mode!=='tale','잠긴 상태에서는 출정하지 않음');
// 열린 설화 고르고 출정
meta.tale.frag.woochi=3;prep.tale='woochi';renderPrep();ok($('#goBtn').disabled===false&&$('#goBtn').textContent==='설화 출정','열린 설화를 고르면 「설화 출정」');
ok($('#panCurse').hidden&&$('#panPae').hidden&&$('#panKs').hidden&&$('#panDiff').hidden,'설화 출정에서는 난이도·액운·정표·패 숨김');
begin();ok(G&&G.mode==='tale'&&G.tale.id==='woochi','고른 설화로 출정');
// 잠긴 설화를 골라 둔 채면 출정 안 함
prep.tale='jiha';renderPrep();ok(prep.tale!=='jiha','잠긴 설화는 고를 수 없음(열린 설화로 바뀜)');
// 차림
prep.mode='normal';meta.tale.done.woochi={best:300,n:1};meta.tale.skin.seonbi=null;renderPrep();
const sk=skinChoices('seonbi');ok(sk.length===2&&sk[0].id===null&&sk[1].id==='jjok','선비 차림: 기본 · 쪽빛 도포');
ok(skinChoices('jangsu').length===1,'완주 전에는 기본뿐');ok($('#panSkin').hidden===false,'빛깔이 있으면 차림 칸이 보임');
setSkin('seonbi','jjok');ok(meta.tale.skin.seonbi==='jjok','차림 고르기 저장');
setSkin('seonbi','cheongrok');ok(meta.tale.skin.seonbi==='jjok','다른 퇴마사의 빛깔은 고를 수 없음');
selChar='jangsu';renderPrep();ok($('#panSkin').hidden===true,'빛깔이 없으면 차림 칸 숨김');
console.log(fails.length?'FAIL | '+fails.join(' | '):'PASS tale_prep');
if(fails.length)process.exitCode=1;
