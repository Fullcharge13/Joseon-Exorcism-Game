// 설화 출정 결과 화면·상태 창의 「막」 칸은 배경 막(제5막 등)이 아니라 설화의 막(3막)을 보여야 한다.
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
// @include tests/lib/tale_helpers.js
meta.tale.frag={woochi:3,jiha:3,bari:3};
taleStart('woochi');step(1);god();
G.tale.force=true;for(let a=0;a<2;a++){step(TALE_T+1);killBoss();step(4);step(1);}
ok(G.tale.act===2,'3막에 와 있음');
const txt=String(statHTML());
ok(/<span>막<\/span><strong>『전우치전』 3막/.test(txt),'상태 창 막 칸 = 『전우치전』 3막 (지금 '+txt.slice(0,60)+')');
ok(!/제5막/.test(txt),'배경 막 이름(제5막)이 나오지 않음');
endGame(false);step(2,{pick:false});
const ov=$('#overStats').innerHTML;
ok(!/제5막/.test(ov),'결과 화면에도 제5막이 나오지 않음');
if(fails.length){console.log('FAIL tale_over_label\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS tale_over_label');
