// 분위기 층 막별 표와 설정(v18.2): 열 막 모두 표가 있고, 밤이 1→9막으로 깊어지고, 10막 보스 뒤 새벽, 설화는 그 설화의 막 값, 설정 기본·옛 저장·엉뚱한 값은 'on'
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
ok(typeof STAGE_VFX!=='undefined'&&Array.isArray(STAGE_VFX),'STAGE_VFX 표가 있음');
if(typeof STAGE_VFX!=='undefined'){
 ok(STAGE_VFX.length===STAGES.length&&STAGES.length===10,'열 막 모두 표 '+STAGE_VFX.length);
 STAGE_VFX.forEach((v,i)=>{ok(v&&typeof v.night==='number'&&v.night>=0&&v.night<=1,`${i+1}막 night 0~1`);ok(v&&/^#[0-9a-f]{6}$/i.test(v.tint||''),`${i+1}막 tint 색`);ok(v&&v.lamp,`${i+1}막 빛나는 물건`);});
 for(let i=1;i<9;i++)ok(STAGE_VFX[i].night>=STAGE_VFX[i-1].night,`${i+1}막 밤이 ${i}막보다 얕아지지 않음`);
 ok(STAGE_VFX[9].dawn===true,'10막 새벽 표시');
 // 밤의 깊이: 설정·막·새벽
 meta.set.vfx='on';newGame('seonbi','gilil',0,'normal');G.queue.length=0;
 G.stage=0;const n1=vfxNight();G.stage=8;const n9=vfxNight();ok(n1>0&&n9>n1,'켬: 1막 '+n1+' < 9막 '+n9);
 meta.set.vfx='soft';const s9=vfxNight();ok(s9>0&&s9<n9,'약하게는 켬보다 옅음 '+s9);
 meta.set.vfx='off';ok(vfxNight()===0&&vfxLevel()==='off','끔이면 어둠 0');
 meta.set.vfx='on';G.stage=9;const n10=vfxNight();G.dawnT=G.time;G.time+=1.5;const half=vfxNight();G.time+=2;const after=vfxNight();
 ok(n10>0&&half<n10&&after<=n10*0.05,`10막 보스 뒤 3초에 걸쳐 걷힘 ${n10}→${half}→${after}`);
 // 설화: 그 설화의 막 값
 const tid=TALE_IDS[0];meta.tale.frag[tid]=3;taleStart(tid);G.queue.length=0;ok(Math.abs(vfxNight()-STAGE_VFX[TALES[tid].st].night)<1e-9,'설화는 그 설화의 막 값');
}
// 설정 기본·옛 저장·엉뚱한 값
delete meta.set.vfx;normSet();ok(meta.set.vfx==='on','옛 저장(값 없음) → on');
meta.set.vfx='xx';normSet();ok(meta.set.vfx==='on','엉뚱한 값 → on');
meta.set.vfx='soft';normSet();ok(meta.set.vfx==='soft','약하게는 그대로');
if(fails.length){console.log('FAIL vfx_table\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS vfx_table');
