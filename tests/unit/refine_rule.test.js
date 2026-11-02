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
if(fails.length){console.log('FAIL refine_rule\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS refine_rule');
