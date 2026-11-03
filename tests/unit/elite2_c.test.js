// v19.5 작업 1: 6막 여귀(독 안개 장판) · 7막 흑룡(해를 삼켜 가장자리 어둠) — 설계 3장
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
const set=(st)=>{newGame('seonbi',null,0,'normal');G.queue.length=0;show(null);G.stage=st;G.midDone=true;G.mid=null;G.enemies.length=0;G.weapons.length=0;G.P.hp=G.P.maxHp=1e9;};
const run=(sec,each)=>{for(let i=0;i<Math.round(sec*60);i++){G.P.hp=G.P.maxHp;G.P.xp=0;G.queue.length=0;if(modal)show(null);G.eliteT=999;G.spawnT=999;G.potT=999;if(each)each(i);update(1/60);}};
{
for(const [id,st] of [['yeogwi',5],['heukryong',6]]){ok(STAGES[st].elite2===id,(st+1)+'막 elite2 '+id);ok(ESPR2[id]&&ESPR2[id].length===3&&ESPR2[id].every(v=>v.w===12&&v.hgt===16),id+' 세 장 12×16');}
if(EN.yeogwi){
 set(5);spawnElite();const e=G.enemies.find(x=>x.elite);e.x=G.P.x+80;e.y=G.P.y;e.inv=true;let mx=0,firstAt=-1,born=[];
 run(20,i=>{const z=G.ezones.filter(z=>z.kind==='miasma');mx=Math.max(mx,z.length);if(z.length&&firstAt<0)firstAt=i/60;for(const q of z)if(!q.__seen){q.__seen=i/60;born.push(q);}});
 ok(mx>=5&&mx<=8,'동시 장판 ≤ 8 (최대 '+mx+')');ok(firstAt>0&&firstAt<3,'첫 장판 3초 안 '+firstAt);
 const gaps=born.slice(1,6).map((q,i)=>q.__seen-born[i].__seen);ok(gaps.length>=4&&gaps.every(g=>g>0.9&&g<1.2),'1초마다 '+gaps.map(x=>x.toFixed(2)));
 ok(born.every(q=>Math.abs(q.max-5)<1e-9),'장판 5초');
 e.inv=false;for(const z of G.ezones)z.__old=1;kill(e);run(2);ok(!G.ezones.some(z=>z.kind==='miasma'&&z.owner===e&&!z.__old),'쓰러진 뒤 생긴 장판 0');   /* 검토 지적: 예전 검사는 늘 참이었음 */
 set(5);spawnElite();const f=G.enemies.find(x=>x.elite);f.frz=99;run(5,()=>{f.frz=99;});ok(!G.ezones.some(z=>z.kind==='miasma'),'얼면 장판 없음');
}
if(EN.heukryong){
 set(6);spawnElite();const e=G.enemies.find(x=>x.elite);e.x=G.P.x+90;e.y=G.P.y;e.inv=true;let on=[],warnBefore=false,last=0;
 run(26,i=>{const v=G.eclipse||0;if(v>0&&last<=0){on.push(i/60);}if(v<=0&&G.warns.length)warnBefore=true;last=v;});
 ok(on.length>=2&&on.slice(1).every((t,i)=>Math.abs(t-on[i]-10)<0.7),'10초마다 어둠 '+on.map(x=>x.toFixed(1)));ok(warnBefore,'어둠 전 경고');
 let dur=0;set(6);spawnElite();const e2=G.enemies.find(x=>x.elite);e2.inv=true;e2.x=G.P.x+90;e2.y=G.P.y;run(15,()=>{if((G.eclipse||0)>0)dur+=1/60;});ok(Math.abs(dur-4)<0.3,'어둠 4초 ('+dur.toFixed(2)+')');
 // 그리기 순서: 어둠 → 경고 → 피해 숫자 (요괴 탄은 그 뒤 같은 자리)
 G.eclipse=2;warn({x:G.P.x+30,y:G.P.y,r:10,t:1,dmg:0});G.fx.push({t:'num',x:G.P.x,y:G.P.y,v:5,life:0.5,max:0.5});const order=[];
 const de=drawEclipse,dw=drawWarn,dn=drawNum;drawEclipse=function(){order.push('e');return de.apply(this,arguments);};drawWarn=function(){order.push('w');return dw.apply(this,arguments);};drawNum=function(){order.push('n');return dn.apply(this,arguments);};
 try{render();}finally{drawEclipse=de;drawWarn=dw;drawNum=dn;}
 const ie=order.indexOf('e'),iw=order.lastIndexOf('w'),inn=order.lastIndexOf('n');ok(ie>=0&&iw>ie&&inn>ie,'어둠 뒤에 경고·피해 숫자 '+order.join(''));
 ok(typeof ECLIPSE_R==='number'&&ECLIPSE_R===90,'가운데 반지름 90');
 // 쓰러지면·막이 바뀌면 어둠 0
 G.eclipse=3;kill(e2);run(0.1);ok(!(G.eclipse>0),'흑룡이 쓰러지면 어둠 0');
 set(6);G.eclipse=3;nextStage();ok(!(G.eclipse>0),'막이 바뀌면 어둠 0');
 set(6);spawnElite();const f=G.enemies.find(x=>x.elite);f.frz=99;let any=false;run(12,()=>{f.frz=99;if((G.eclipse||0)>0)any=true;});ok(!any,'얼면 어둠 없음');
}
}
if(fails.length){console.log('FAIL elite2_c\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS elite2_c');
