"""분위기 층 브라우저 시험이 함께 쓰는 장면(v18.2): 같은 씨앗으로 요괴·요괴 탄·경고 장판·피해 숫자·깨진 옹기를 놓고 몇 프레임 돌린다."""
INIT = "window.requestAnimationFrame=()=>0;"
# v20.3.1: 데우기는 진행(update)을 직접 — 옛 판이 실제로 한 그대로(첫 장면 0.05초, 그 뒤 0.016초). frame()으로 데우면
# 장면 길이를 진행으로 바꾸는 방식(v20.2 조각·v20.3 1/60초 고정)에 따라 요괴 자리가 달라져 옛 판과 비교할 수 없었음
SCENE = """(o)=>{show(null);meta.set.vfx=o.v;meta.set.perf=o.perf||'high';applyPerf();newGame('seonbi','gilil',0,'normal');G.queue.length=0;show(null);G.stage=o.st;G.P.hp=G.P.maxHp=1e9;
 let s=11;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};const P=G.P,st=curStg();
 for(let i=0;i<o.n;i++){const a=i*2.399,d=40+(i%9)*14;spawnEnemy(st.early[i%st.early.length],P.x+Math.cos(a)*d,P.y+Math.sin(a)*d*0.8);}
 for(let i=0;i<5;i++)spawnPot();for(const e of G.enemies.filter(e=>e.prop).slice(0,3))kill(e);for(let i=0;i<6;i++)kill(G.enemies.find(e=>!e.prop&&!e.dead));
 for(let i=0;i<(o.warm||40);i++){G.P.hp=1e9;G.P.xp=0;G.queue.length=0;if(modal)show(null);update(i?0.016:0.05);}hud();render();window.__t=100000+16*(o.warm||40);last=window.__t;}"""
# 잘 보여야 하는 것들을 화면 곳곳(가까이·멀리)에 놓고 한 프레임 그린 뒤 그 자리 좌표(게임 좌표)를 돌려준다
PROBE = """(o)=>{const P=G.P,pts=[];G.ebul.length=0;G.warns.length=0;G.fx=G.fx.filter(f=>f.t!=='num');
 const far=[[-150,-70],[150,-70],[-150,70],[150,70],[0,-80],[0,80],[-90,0],[90,0]];
 for(const [dx,dy] of far){G.ebul.push({x:P.x+dx,y:P.y+dy,vx:0,vy:0,r:2,dmg:0,life:99,col:'#ff5a8a'});pts.push(['ebul',P.x+dx,P.y+dy]);}
 for(const [dx,dy] of far.slice(0,4)){warn({x:P.x+dx*0.8,y:P.y+dy*0.8+10,r:18,t:5,dmg:0});pts.push(['warn',P.x+dx*0.8+18,P.y+dy*0.8+10]);}
 for(const [dx,dy] of far.slice(4)){G.fx.push({t:'num',x:P.x+dx,y:P.y+dy,v:888,life:5,max:5,big:true});pts.push(['num',P.x+dx,P.y+dy-3]);}
 G.P.hp=1e9;frame(window.__t+=16);return {pts,cx:RCX,cy:RCY,k:S*DPR,hk:buf.width>W?2:1};}"""
LUMA = """(q)=>{const c=document.getElementById('game'),x=c.getContext('2d'),out=[];
 for(const [kind,wx,wy] of q.pts){const sx=Math.round((wx-q.cx)*q.k),sy=Math.round((wy-q.cy)*q.k),r=Math.max(2,Math.round(2.5*q.k));
  const d=x.getImageData(sx-r,sy-r,r*2,r*2).data;let best=0;for(let i=0;i<d.length;i+=4){const l=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];if(l>best)best=l;}out.push([kind,best]);}
 return out;}"""
