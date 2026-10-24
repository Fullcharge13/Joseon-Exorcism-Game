// 번역 사전(v18.0): 한국어는 원문 그대로, 간체 사전에 없으면 한국어로 보이고 오류 기록에 한 번만 남는다
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m);};
LANG='ko';ok(_t('도깨비불이 꺼졌다')==='도깨비불이 꺼졌다','한국어 원문');
const z0=I18N.zh;I18N.zh={'{x:을} 얻었다':'获得了{x}','막|무대':'幕'};LANG='zh';
ok(_t('{x:을} 얻었다',{x:'墨弹'})==='获得了墨弹','간체 사전 + 끼워 넣기 ('+_t('{x:을} 얻었다',{x:'墨弹'})+')');
ok(_t('막|무대')==='幕','꼬리표 열쇠');LANG='ko';ok(_t('막|무대')==='막','한국어에서는 꼬리표를 뗌');LANG='zh';
const before=DIAG.log.length;const r=_t('사전에 없는 문구');ok(r==='사전에 없는 문구','없는 번역은 한국어로');_t('사전에 없는 문구');
ok(DIAG.log.length===before+1&&/번역 없음/.test(DIAG.log[DIAG.log.length-1].msg),'오류 기록에 한 번 ('+(DIAG.log.length-before)+')');
I18N.zh={'{x:을} 받았다':'获得{x:을}'};ok(_t('{x:을} 받았다',{x:'墨弹'})==='获得墨弹','간체 문구에는 한국어 조사를 붙이지 않음 ('+_t('{x:을} 받았다',{x:'墨弹'})+')');
ok(_t('없는 {x:을} 문구',{x:'먹탄'})==='없는 먹탄을 문구','번역이 없어 한국어로 보일 때는 조사를 붙임');
ok(/^甲|^乙|^丙|^丁|^戊|^己|^庚|^辛|^壬|^癸/.test(jdate(Date.UTC(2026,9,24,3)).j),'간체 날짜는 한자 간지 ('+jdate(Date.UTC(2026,9,24,3)).j.slice(0,12)+')');
LANG='ko';ok(/^병오년/.test(jdate(Date.UTC(2026,9,24,3)).j),'한국어 날짜는 그대로 병오년 ('+jdate(Date.UTC(2026,9,24,3)).j.slice(0,8)+')');
I18N.zh=z0;LANG='ko';
if(fails.length){console.log('FAIL i18n_keys\n  '+fails.join('\n  '));process.exitCode=1;}else console.log('PASS i18n_keys');
