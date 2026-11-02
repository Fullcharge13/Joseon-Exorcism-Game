// v18.6 그림 다듬기 설정: 기본·옛 저장·엉뚱한 값 'on' · 켬이면 여백 1칸 그림, 끔이면 원래 그림 · 크기 숫자(w·hgt)는 같음
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
delete meta.set.refine;normSet();ok(meta.set.refine==='on','옛 저장(값 없음) → on');
meta.set.refine='zz';normSet();ok(meta.set.refine==='on','엉뚱한 값 → on');
meta.set.refine='off';normSet();ok(meta.set.refine==='off','끔은 그대로');
const id=Object.keys(ESPR)[0],s=ESPR[id];
meta.set.refine='off';const w0=s.w,h0=s.hgt,n0=s.n;ok(s.pad===0,'끔: pad 0');ok(n0&&n0.width===w0&&n0.height===h0,'끔: 원래 크기 그림');
meta.set.refine='on';ok(s.pad===1,'켬: pad 1');ok(s.n&&s.n.width===w0+2&&s.n.height===h0+2,'켬: 여백 1칸 그림 '+(s.n&&s.n.width)+'×'+(s.n&&s.n.height));
ok(s.w===w0&&s.hgt===h0,'켬·끔 크기 숫자 같음');ok(s.f&&s.h&&s.hf&&s.f.width===w0+2&&s.hf.width===w0+2,'뒤집힌·번쩍임 그림도 다듬은 판');
const cs=charSpr(CHARS.seonbi.look);ok(cs.pad===1&&cs.n.width===cs.w+2,'퇴마사 그림도 다듬음');ok(PSPR[Object.keys(PSPR)[0]].pad===1,'펫 그림도 다듬음');
// 그리는 자리: 켬이면 1칸×배율만큼 왼쪽·위로, 크기 (w+2)·배율 → 아래 가운데 발 자리는 끔과 같음
const calls=[];const dI=b.drawImage;b.drawImage=function(img,x,y,ww,hh){calls.push([x,y,ww,hh]);};
meta.set.refine='off';drawSpr(s,100,100,false,false,2);meta.set.refine='on';drawSpr(s,100,100,false,false,2);b.drawImage=dI;
const [a,c]=calls;ok(a&&c&&Math.abs((a[0]+a[2]/2)-(c[0]+c[2]/2))<=1&&Math.abs((a[1]+a[3])-(c[1]+c[3]))<=2&&c[2]===a[2]+4,'발 자리 같음(아래 가운데), 켬은 가로 +2칸×배율 '+JSON.stringify(calls));
// 검토 지적(중요): 설정을 바꾸면 과업 휘장 그림 저장도 비움 · 다듬기 오류는 숨기지 않고 모아 둠(REFINE_ERR)
meta.set.refine='on';badgeCache.__t='x';openSettings('title');const sel=document.getElementById('setRefine');sel.value='off';sel.onchange({target:sel});ok(!('__t' in badgeCache),'설정을 바꾸면 과업 휘장 그림 저장을 비움');ok(meta.set.refine==='off','설정 바꿈 → off');
ok(typeof REFINE_ERR!=='undefined'&&Array.isArray(REFINE_ERR),'다듬기 오류 목록 REFINE_ERR');
// 검토 지적(사소): 배율이 정수가 아니어도(엘리트 1.5배 등) 그리는 자리는 정수 칸
{const calls=[];const dI=b.drawImage;b.drawImage=function(img,x,y,ww,hh){calls.push([x,y]);};meta.set.refine='on';drawSpr(s,100.3,100.7,false,false,1.6);b.drawImage=dI;ok(calls[0]&&Number.isInteger(calls[0][0])&&Number.isInteger(calls[0][1]),'배율 1.6에서도 그리는 자리 정수: '+JSON.stringify(calls[0]));}
meta.set.refine='on';
if(fails.length){console.log('FAIL refine_set\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS refine_set');
