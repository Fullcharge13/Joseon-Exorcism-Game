// v20.8 에셋 도감 목록(tools/assets_list.js): 게임 표의 모든 그림이 빠짐없이 한 번씩, 이름이 있고, 그릴 수 있음
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
let src='';try{src=require('fs').readFileSync(require('path').join(process.cwd(),'tools/assets_list.js'),'utf8');}catch(e){}
ok(src,'tools/assets_list.js 있음');
if(src)eval(src);
{
const L=typeof assetList==='function'?assetList():[];
const cnt=k=>L.filter(a=>a.kind===k).length;
const tiers=Object.values(CHARS).reduce((n,C)=>n+1+C.branches.reduce((m,B)=>m+B.tiers.length,0),0);
const want={char:tiers,enemy:Object.keys(EN).length,npc:Object.keys(NPCS).length,wander:Object.keys(GNPC).length,sky:Object.keys(SKY).length,pet:Object.keys(PSPR).length,
 skill:Object.values(WD).filter(d=>d.type==='c').length,passive:Object.keys(PD).length,task:TASKS.length,seal:Object.keys(SEALS).length,
 temper:Object.keys(TEMPER).length,variant:Object.keys(VARIANTS).length,bless:Object.keys(BLESS).length,call:Object.keys(CALL).length,
 duo:Object.keys(DUO).length,path:Object.keys(PATHS).length,gift:Object.keys(GIFTS).length,dkb:Object.keys(DKB).length,ks:Object.keys(KS).length,
 ult:Object.keys(ULT).length,anom:ANOM.length,grade:GRADES.length,ground:STAGES.length,shield:6,prop:Object.keys(PROP).length};
for(const k in want)ok(cnt(k)===want[k],`종류 ${k}: ${cnt(k)}장 = 표 ${want[k]}`);
ok(cnt('weapon')===Object.keys(WD).filter(id=>WD[id].type!=='c').length,'무기: 직업 기술이 아닌 무기 전부 '+cnt('weapon'));
const keys=L.map(a=>a.kind+':'+a.id),dup=keys.filter((k,i)=>keys.indexOf(k)!==i);ok(dup.length===0,'종류+id 겹침 없음 '+dup.slice(0,5));
const rd=L.filter(a=>a.readme).map(a=>a.readme),rdup=rd.filter((k,i)=>rd.indexOf(k)!==i);ok(rdup.length===0,'README 이름 겹침 없음 '+rdup.slice(0,5));
const noname=L.filter(a=>!a.name||a.name==='undefined'||/undefined/.test(a.name));ok(noname.length===0,'이름 빈 것 없음 '+noname.slice(0,5).map(a=>a.kind+':'+a.id));
// 그리기: 도트는 캔버스, 아이콘·휘장은 그림 주소, 도장은 글자와 색
let bad=[];for(const a of L){const d=a.draw;
 if(d.t==='seal'){const c=assetCanvas(a,false);if(!d.g||!d.bg||!c||c.width!==32)bad.push(a.kind+':'+a.id+' 도장');}
 else if(d.t==='url'){if(!assetURL(a))bad.push(a.kind+':'+a.id+' 주소');}
 else if(d.t==='spr'||d.t==='ground'){for(const r of a.refine?[false,true]:[false]){const c=assetCanvas(a,r);if(!c||!(c.width>0&&c.height>0))bad.push(a.kind+':'+a.id+(r?' 다듬기':''));}}}
ok(bad.length===0,'그릴 수 없는 것 '+bad.length+': '+bad.slice(0,8).join(', '));
ok(L.length>400,'전체 '+L.length+'장(400 넘음)');
}
if(fails.length){console.log('FAIL assets_list\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS assets_list');
