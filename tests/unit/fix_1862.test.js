// v18.6.2 버그 셋(사용자 휴대폰 캡처): ① 직업 기술 레벨업 카드 아이콘이 「?」 ② 오방신장기 깃발 표지(旗)가 퇴마사를 가림 ③ 보스가 받는 피해 숫자에 소수점
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
meta.set.nums=true;newGame('mudang',0,0,'normal');G.queue.length=0;show(null);G.P.hp=G.P.maxHp=1e9;
// ① 직업 기술(type 'c')을 올리는 카드는 예전처럼 도장 아이콘(iconHTML), 빈 그림(undefined)이 아님
for(const id of Object.keys(WD).filter(k=>WD[k].type==='c').slice(0,6)){if(!G.weapons.some(w=>w.id===id))G.weapons.push({id,lv:1,t:0});
 const o=decorate({k:'wup',id});ok(!String(o.ic).includes('undefined')&&o.ic===iconHTML(id),`${WD[id].name} 올리기 카드 아이콘 = 도장(${String(o.ic).slice(0,40)})`);}
{const o=decorate({k:'wnew',id:'obang'});ok(!String(o.ic).includes('undefined'),'오방신장기 새로 얻기 카드 아이콘: '+String(o.ic).slice(0,40));}
// ② 퇴마사가 깃발 표지 밑을 지나가면 표지는 옅어져 퇴마사를 가리지 않는다(겹치지 않는 표지는 그대로 진함)
{const P=G.P;const hb0=heroBox(),A=[];
 for(const dy of [-30,-16,-8,0,20,60]){G.zones.length=0;zone({x:P.x,y:P.y+dy,r:22,dmg:0,life:5,col:'#4a4552',kind:'flag',src:'obang'});
  const rec=[];const fr=ctx.fillRect;ctx.fillRect=function(x,y,w,h){if(ctx.fillStyle==='#0a080c'&&w===h&&w>0)rec.push(ctx.globalAlpha);return fr.apply(this,arguments);};
  let q=null;const dE=drawEmblems;drawEmblems=function(){q=EMQ.slice();return dE.apply(this,arguments);};try{render();}finally{drawEmblems=dE;ctx.fillRect=fr;}
  const hb=heroBox(),kk=S*DPR;for(let i=0;q&&i<q.length;i+=4){if(q[i]!=='obang')continue;const ex=q[i+1]+RCX,ey=q[i+2]+RCY,over=ex+6>hb.x0&&ex-6<hb.x1&&ey+6>hb.y0&&ey-6<hb.y1;A.push([dy,over,rec[0]]);}}
 ok(A.some(a=>a[1])&&A.filter(a=>a[1]).every(a=>a[2]!=null&&a[2]<=0.3),'퇴마사와 겹친 표지는 옅게(≤0.3): '+JSON.stringify(A));
 ok(A.some(a=>!a[1])&&A.filter(a=>!a[1]).every(a=>a[2]==null||a[2]>0.8),'겹치지 않은 표지는 그대로 진함: '+JSON.stringify(A));}
// ③ 보스 피해 숫자는 정수(초당 피해 상한에 걸려 소수가 나와도)
{G.fx.length=0;spawnBoss('gumiho',false);const e=G.boss;e.maxHp=e.hp=12345.67;e.capT=G.time;e.capD=0;for(let i=0;i<40;i++)hurt(e,97.3,0,e.x,e.y);
 const nums=G.fx.filter(f=>f.t==='num'&&typeof f.v==='number');ok(nums.length>0&&nums.every(f=>Number.isInteger(f.v)),'보스 피해 숫자 정수: '+nums.slice(-4).map(f=>f.v).join(','));}
if(fails.length){console.log('FAIL fix_1862\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS fix_1862');
