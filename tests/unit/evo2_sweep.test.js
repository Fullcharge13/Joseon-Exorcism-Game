// v20.6 전수: 모든 퇴마사·갈래 × 모든 진화·합공 무기의 진화 Lv 1~5, 직업 기술 숙련 1~3에서 10초 동안 피해 > 0 · 오류 없음
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
{
const dmgOf=(cid,br,w)=>{newGame(cid,[],0,'normal','normal',9);G.queue.length=0;show(null);G.P.tier=5;G.P.branch=br;G.weapons.length=0;G.P.hp=G.P.maxHp=1e9;
 if(WD[w.id].fuse){const f=FUSE.find(f=>f.id===w.id);G.weapons.push({id:f.a,lv:5,evo:true,ev2:1,t:0.2,on:false,pos:[]},{id:f.b,lv:5,evo:true,ev2:1,t:0.2,on:false,pos:[]});doFusion(f);G.weapons[0].ev2=w.ev2;}   // 합공은 실제 합치기로(가짜 짝 무기로는 동작하지 않음)
 else G.weapons.push(w);
 for(let i=0;i<12;i++){const e=spawnEnemy(curStg().early[0],G.P.x+30+i*8,G.P.y+((i%3)-1)*20,{novr:1});e.hp=e.maxHp=1e9;e.spd=0;}
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2,e=spawnEnemy(curStg().early[0],G.P.x+Math.cos(a)*14,G.P.y+Math.sin(a)*14,{novr:1});e.hp=e.maxHp=1e9;e.spd=0;}   // 바로 곁(방패처럼 가까이 치는 무기)
 const tot=()=>Object.values(G.rs.dmg||{}).reduce((a,b)=>a+b,0);const d0=tot();let err='';
 try{for(let i=0;i<600;i++){G.P.hp=G.P.maxHp;G.P.xp=0;G.queue.length=0;if(modal)show(null);G.eliteT=999;G.spawnT=999;G.potT=999;for(const e of G.enemies)if(e.hp<1e8)e.hp=1e9;update(1/60);}}catch(x){err=x.message;}
 return [tot()-d0,err];};
let n=0,bad=[];
for(const cid in CHARS)for(const br of [0,1]){
 const evoW=Object.keys(WD).filter(k=>WD[k].type==='w'&&(!WD[k].job||jobHas(WD[k],cid))&&(WD[k].evo||WD[k].fuse));
 for(const id of evoW)for(const e2 of [1,3,5]){const [d,err]=dmgOf(cid,br,{id,lv:5,evo:true,ev2:e2,t:0.2,on:false,pos:[],kids:WD[id].fuse?[{id:WD[id].fuse.a||id},{id:WD[id].fuse.b||id}]:undefined});n++;if(!(d>0)||err)bad.push(cid+br+':'+id+'@진'+e2+(err?' 오류 '+err:' 피해 0'));}
 const skills=CHARS[cid].branches[br].tiers.map(t=>t.skill).filter(k=>k&&WD[k]);
 for(const id of skills)for(const m of [1,3]){const [d,err]=dmgOf(cid,br,{id,lv:5,mas:m,t:0.2,on:false,pos:[]});n++;if(err)bad.push(cid+br+':'+id+'@숙'+m+' 오류 '+err);}
}
ok(bad.length===0,'진화 Lv·숙련 '+n+'가지 중 문제 '+bad.length+': '+bad.slice(0,8).join(' | '));
}
if(fails.length){console.log('FAIL evo2_sweep\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS evo2_sweep');
