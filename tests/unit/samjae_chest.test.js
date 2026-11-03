// v19.6: 삼재의 「강화 하나 더」는 막 끝 상자에만(길에서 줍는 상자는 하나) — 어려움+점괘 세 장에서 4막에 거의 다 최대 레벨이 되던 문제
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
{
const oc=openChest;let got=[];openChest=(n,cb)=>{got.push(n);};
try{
 for(const [cards,field,end] of [[['samjae'],1,4],[[],1,3]]){
  newGame('uiwon',cards,0,'hard');G.queue.length=0;show(null);G.enemies.length=0;got=[];
  G.items.push({k:'chest',x:G.P.x,y:G.P.y});for(let i=0;i<3;i++)update(1/60);
  ok(got[0]===field,(cards[0]||'패 없음')+' 길 상자 강화 '+field+'개 (본 값 '+got[0]+')');
  got=[];G.clearT=0.001;G.boss=null;G.bossDone=true;
  const cd=claimDk,cp=claimPath;claimDk=f=>f();claimPath=f=>f();try{update(1/60);}finally{claimDk=cd;claimPath=cp;}
  ok(got[0]===end,(cards[0]||'패 없음')+' 막 끝 상자 강화 '+end+'개 (본 값 '+got[0]+')');}
}finally{openChest=oc;}
ok(/막을 끝낼 때/.test(CARDS.samjae.d),'삼재 설명: 막 끝 상자만');
}
if(fails.length){console.log('FAIL samjae_chest\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS samjae_chest');
