// v18.6 그림 다듬기 규칙(점 배열 순수 함수 refinePix): 바깥 빈칸에만 테두리(맞닿은 색을 어둡게) · 안쪽 틈·1칸 골목은 비움 · 위 밝게(짙은 색 제외) · 아래 어둡게 · 둘레 1칸 여백
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
ok(typeof refinePix==='function','refinePix(rgba, w, h) 함수가 있음');
if(typeof refinePix==='function'){
 // 시험 그림 5×3:  k g g . g  /  g . g g g  /  g g g g g   (k 검정, g 초록, . 빈칸)
 const rows=['kgg.g','g.ggg','ggggg'],C={k:[20,20,20],g:[60,160,90]},w=5,h=3,src=new Uint8ClampedArray(w*h*4);
 rows.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch!=='.'){const p=(j*w+i)*4;src.set([...C[ch],255],p);}}));
 const o=refinePix(src,w,h);ok(o&&o.w===7&&o.h===5&&o.data.length===7*5*4,'둘레 1칸 여백: 7×5');
 const px=(x,y)=>Array.from(o.data.slice((y*o.w+x)*4,(y*o.w+x)*4+4)),sum=c=>c[0]+c[1]+c[2],G=sum(C.g);
 ok(JSON.stringify(px(1,1))===JSON.stringify([20,20,20,255]),'검은 칸은 맨 위여도 밝히지 않음: '+px(1,1));
 ok(px(2,2)[3]===0,'그림 안에 갇힌 빈칸은 비움');
 ok(px(4,1)[3]===0,'좌우가 그림인 1칸 골목은 비움');
 ok(px(0,1)[3]===0,'짙은 색(검정)에만 닿은 칸은 테두리 없음(이미 짙어서 덧대면 뭉개짐) '+px(0,1));ok(px(1,0)[3]===0,'검은 칸 위도 테두리 없음');
 ok(px(2,0)[3]===255&&sum(px(2,0))<G*0.6&&px(2,0)[1]>px(2,0)[0],'초록 칸 위 테두리: 불투명, 짙은 초록(색 띰) '+px(2,0));
 ok(px(0,0)[3]===0,'대각선으로만 닿은 모서리는 비움');
 ok(sum(px(2,1))>G,'맨 위 초록 칸은 밝게 '+px(2,1));
 ok(sum(px(3,3))<G&&sum(px(3,3))>G*0.6,'맨 아래 초록 칸은 조금 어둡게 '+px(3,3));
 ok(JSON.stringify(px(3,2))===JSON.stringify([...C.g,255]),'안쪽 초록 칸은 그대로 '+px(3,2));
 ok(px(6,2)[3]===255,'오른쪽 바깥 테두리');ok(px(3,4)[3]===255,'아래 바깥 테두리');
}
// v18.6.1 검은 요괴: 몸의 60% 넘게 짙은 그림은 짙은 칸 둘레에 붉은 기 도는 밝은 회색 테두리(밤 바닥에서 보이게). 대부분 밝은 그림(위 시험 그림·퇴마사의 검은 갓)은 그대로 비움
if(typeof refinePix==='function'){const w=4,h=3,src=new Uint8ClampedArray(w*h*4);const rows=['kkkk','kokk','kkkk'];
 rows.forEach((r,j)=>[...r].forEach((ch,i)=>{const p=(j*w+i)*4;src.set(ch==='k'?[24,18,22,255]:[200,80,60,255],p);}));
 const o=refinePix(src,w,h),px=(x,y)=>Array.from(o.data.slice((y*o.w+x)*4,(y*o.w+x)*4+4));
 ok(typeof REFINE_RIM!=='undefined'&&JSON.stringify(px(0,2))===JSON.stringify([...REFINE_RIM,255]),'검은 요괴 왼쪽 테두리는 밝은 테두리색 '+px(0,2));
 ok(JSON.stringify(px(2,0))===JSON.stringify([...(typeof REFINE_RIM!=='undefined'?REFINE_RIM:[0,0,0]),255]),'검은 요괴 위 테두리도 '+px(2,0));
 ok(typeof REFINE_RIM!=='undefined'&&REFINE_RIM[0]>REFINE_RIM[2]&&REFINE_RIM[0]+REFINE_RIM[1]+REFINE_RIM[2]>240,'테두리색은 밝고 붉은 기 '+(typeof REFINE_RIM!=='undefined'?REFINE_RIM:''));
 ok(px(0,0)[3]===0,'모서리는 그대로 비움');}
// v20.5 은은한 색조 이동(설계 docs/specs/2026-11-03-그림-다듬기-v20.5.md): 빛은 왼쪽 위. 밝은 쪽은 노랑(50°) 쪽, 어두운 쪽은 파랑(250°) 쪽으로 조금 돌림
if(typeof refinePix==='function'){
 const hue=c=>{const r=c[0]/255,g=c[1]/255,b=c[2]/255,M=Math.max(r,g,b),m=Math.min(r,g,b),d=M-m;if(!d)return null;let h=M===r?((g-b)/d)%6:M===g?(b-r)/d+2:(r-g)/d+4;return ((h*60)+360)%360;},lum=c=>0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
 // 시험 그림 5×4 초록, 맨 위 가운데만 빨강 한 칸
 const G0=[60,160,90],R0=[200,60,60],w=5,h=4,src=new Uint8ClampedArray(w*h*4);
 for(let j=0;j<h;j++)for(let i=0;i<w;i++)src.set([...(j===0&&i===2?R0:G0),255],(j*w+i)*4);
 const o=refinePix(src,w,h),px=(x,y)=>Array.from(o.data.slice((y*o.w+x)*4,(y*o.w+x)*4+3)),hG=hue(G0);
 const top=px(2+1,0+1-0)&&px(1+1,1),left=px(1,2+1),bot=px(2+1,4),right=px(5,2+1),inner=px(3,2);   // 여백 1칸 → 그림 (i,j)는 (i+1,j+1)
 ok(hue(px(2,1))<hG&&lum(px(2,1))>lum(G0),'위 가장자리: 노랑 쪽·더 밝음 (색상 '+Math.round(hue(px(2,1)))+'° < '+Math.round(hG)+'°)');
 ok(hue(px(1,3))<hG&&lum(px(1,3))>lum(G0),'왼쪽 가장자리: 노랑 쪽·더 밝음 '+px(1,3));
 ok(hue(px(3,4))>hG&&lum(px(3,4))<lum(G0),'아래 가장자리: 파랑 쪽·더 어두움 (색상 '+Math.round(hue(px(3,4)))+'°)');
 ok(hue(px(5,3))>hG&&lum(px(5,3))<lum(G0),'오른쪽 가장자리: 파랑 쪽·더 어두움 '+px(5,3));
 ok(JSON.stringify(px(3,3))===JSON.stringify(G0),'안쪽 칸은 그대로 '+px(3,3));
 ok(JSON.stringify(px(3,1))===JSON.stringify(R0),'맨 위 한 칸 빨강 무늬는 그대로(둘레 몸 이웃 셋이 다른 색) '+px(3,1));
 const oTop=px(2,0),oRight=px(6,3);   // 위 바깥 테두리(몸이 아래 = 빛 쪽), 오른쪽 바깥 테두리(몸이 왼쪽 = 그림자 쪽)
 ok(hue(oTop)>hG&&hue(oRight)>hG,'테두리는 이웃보다 파랑 쪽 (위 '+Math.round(hue(oTop))+'° · 오른쪽 '+Math.round(hue(oRight))+'°)');
 ok(lum(oTop)>lum(oRight)&&lum(oTop)<lum(G0),'빛 쪽(위) 테두리가 그림자 쪽(오른쪽)보다 밝음 '+oTop+' / '+oRight);
 // 무채색(회색)은 색이 물들지 않음
 const src2=new Uint8ClampedArray(3*3*4);for(let i=0;i<9;i++)src2.set([150,150,150,255],i*4);
 const o2=refinePix(src2,3,3),gray=c=>Math.max(...c)-Math.min(...c)<=2;let allG=true;for(let i=0;i<o2.w*o2.h;i++){const c=Array.from(o2.data.slice(i*4,i*4+3));if(o2.data[i*4+3]&&!gray(c))allG=false;}
 ok(allG,'회색 그림의 가장자리·테두리는 회색 그대로');
 // 은은하게: 색조는 15°까지만 돌림(주황 테두리가 빨갛게, 갈색 테두리가 새까맣게 되지 않게 — v20.5 캡처에서 찾음)
 for(const base of [[217,130,43],[201,138,60],[106,74,48],[60,160,90]]){const s4=new Uint8ClampedArray(5*4*4);for(let i=0;i<20;i++)s4.set([...base,255],i*4);
  const o4=refinePix(s4,5,4),hb=hue(base),out=Array.from(o4.data.slice((0*o4.w+3)*4,(0*o4.w+3)*4+3)),dh=Math.abs((((hue(out)??hb)-hb+540)%360)-180);
  ok(dh<=15.5,'테두리 색조 변화 ≤ 15° '+base.join(',')+' → '+out.join(',')+' ('+dh.toFixed(1)+'°)');
  ok(lum(out)>=lum(base)*0.3,'테두리가 새까맣지 않음(밝기 원래의 30% 이상) '+base.join(',')+' → '+out.join(','));}
 // 연한 색(흰 옷 #efe6d2)·갈색 머리(#6a4a30)는 색이 짙어지지 않음 — 다듬은 칸의 색 짙기(최대−최소)가 원래보다 커지지 않음(분홍·주황으로 물들지 않게)
 for(const base of [[239,230,210],[106,74,48],[201,203,187]]){const s3=new Uint8ClampedArray(5*4*4);for(let i=0;i<20;i++)s3.set([...base,255],i*4);
  const o3=refinePix(s3,5,4),ch=c=>Math.max(...c)-Math.min(...c),c0=ch(base);let worst=0,at='';
  for(let i=0;i<o3.w*o3.h;i++){if(!o3.data[i*4+3])continue;const c=Array.from(o3.data.slice(i*4,i*4+3));if(ch(c)-c0>worst){worst=ch(c)-c0;at=c.join(',');}}
  ok(worst<=2,'색 짙기가 늘지 않음 '+base.join(',')+' (가장 늘어난 칸 '+at+' +'+worst+')');}
}
if(fails.length){console.log('FAIL refine_rule\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS refine_rule');
