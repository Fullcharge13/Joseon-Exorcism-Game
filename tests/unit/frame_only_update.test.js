// v20.3: 게임 상태는 진행(update) 안에서만 바뀐다 — 진행이 없는 장면(144Hz에서 1/60초가 아직 안 찬 장면)은 그리기만 한다
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
{
newGame('seonbi',[],0,'normal','normal',7);G.queue.length=0;show(null);document.hidden=true;
let t=1000;last=t;for(let i=0;i<60;i++){if(modal){pickOpt&&modal==='levelup'?pickOpt(0):show(null);}G.P.hp=G.P.maxHp;t+=1000/60;frame(t);}
if(modal)show(null);
const snap=()=>JSON.stringify({t:G.time,e:G.enemies.slice(0,5).map(e=>[Math.round(e.x*1e4),Math.round(e.y*1e4)]),k:G.kills});
const s0=snap();let ups=0,rn=0;const u0=update,R0=RNG;update=d=>{ups++;return u0(d);};RNG=()=>{rn++;return R0();};
try{t+=1000/144;frame(t);}finally{update=u0;RNG=R0;document.hidden=false;}
ok(rn===0,'진행이 없는 장면은 판 난수를 쓰지 않음 ('+rn+'번)');
ok(ups===0,'1/144초 장면 하나에서는 진행이 없음 (진행 '+ups+'번)');
ok(snap()===s0,'진행이 없으면 게임 상태(시간·요괴 자리·처치)가 그대로');
// 장면 시각이 앞 장면보다 이르면(탭으로 돌아올 때 생길 수 있음) 진행하지 않음 — 예전에는 음수 길이로 진행해 게임 시간이 거꾸로 감
{document.hidden=true;const s1=snap(),tm=G.time;let neg=0;const u1=update;update=d=>{if(d<=0)neg++;return u1(d);};try{frame(last-5);}finally{update=u1;document.hidden=false;}
 ok(neg===0&&G.time>=tm,'음수 길이 장면에서 진행 없음 (음수 진행 '+neg+'번, 시간 '+tm.toFixed(4)+' → '+G.time.toFixed(4)+')');}
}
if(fails.length){console.log('FAIL frame_only_update\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS frame_only_update');
