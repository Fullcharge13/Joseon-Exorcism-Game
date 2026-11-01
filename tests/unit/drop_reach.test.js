// 장애물 근처에 떨어진 엽전·떡·복주머니·상자(v18.3 버그 제보: 「나무나 돌 뒤에 드랍시 습득이 어려움」)
// 1) 닿을 수 있다: 장애물 한가운데·가장자리에 떨어뜨려도, 퇴마사가 그 자리로 가면(장애물에 밀려난 자리) 주울 거리(8) 안에 든다
// 2) 보인다: 떨어진 물건·경험치 구슬은 장애물 그림보다 나중에(위에) 그린다
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
newGame('seonbi','gilil',0,'normal');G.queue.length=0;G.P.hp=G.P.maxHp=1e9;
const obs=[];for(let tx=-12;tx<=12&&obs.length<12;tx++)for(let ty=-12;ty<=12&&obs.length<12;ty++){const o=obstAt(tx,ty);if(o)obs.push(o);}
ok(obs.length>=6,'시험할 장애물 '+obs.length);
let bad=[];
for(const o of obs)for(const [dx,dy] of [[0,0],[1,-2],[-2,1],[o.r*0.6,0],[0,-o.r*0.7]])for(const k of ['tteok','pouch','coin','chest']){
 G.items.length=0;dropItem(k,o.x+dx,o.y+dy);const it=G.items[0];if(!it)continue;
 let worst=0;for(const [sx,sy] of [[40,40],[-40,40],[40,-40],[-40,-40],[0,50],[0,-50],[50,0],[-50,0]]){   // 여러 방향에서 걸어 들어가 본다(실제 플레이처럼)
  const P={x:it.x+sx,y:it.y+sy,r:G.P.r};for(let i=0;i<200;i++){const dx=it.x-P.x,dy=it.y-P.y,dd=Math.hypot(dx,dy);if(dd<1)break;P.x+=dx/dd*1.2;P.y+=dy/dd*1.2;pushOut(P,P.r);}
  const d=Math.hypot(P.x-it.x,P.y-it.y);if(d<8){worst=0;break;}worst=d;}
 const d=worst;
 if(d>=8)bad.push(`${k} (${Math.round(o.x+dx)},${Math.round(o.y+dy)}) 어느 방향에서 와도 ${d.toFixed(1)} 밖에서 막힘`);}
ok(bad.length===0,'장애물 근처 물건에 닿을 수 있음: 못 닿음 '+bad.length+'건 '+bad.slice(0,3).join(' / '));
// 그리는 순서: 장애물(drawOb) 뒤에 물건 그림(ICS)·구슬
{const seq=[],o0=drawOb,ics=new Set(Object.values(ICS));drawOb=function(...a){seq.push('ob');return o0.apply(this,a);};
 const dI=b.drawImage;b.drawImage=function(img,...a){if(ics.has(img))seq.push('item');return dI?dI.call(this,img,...a):undefined;};
 const o=obs[0];G.P.x=o.x;G.P.y=o.y+30;G.items.length=0;G.items.push({k:'tteok',x:o.x,y:o.y-6});G.gems.length=0;
 try{render();}catch(e){fails.push('render 오류 '+e.message);}drawOb=o0;b.drawImage=dI;
 const lastOb=seq.lastIndexOf('ob'),firstIt=seq.indexOf('item');ok(lastOb>=0&&firstIt>lastOb,'떨어진 물건을 장애물 위에 그림 (장애물 마지막 '+lastOb+', 물건 처음 '+firstIt+')');}
if(fails.length){console.log('FAIL drop_reach\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS drop_reach');
