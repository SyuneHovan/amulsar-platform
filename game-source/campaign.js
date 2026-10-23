// One continuous mountain: four story stations along a longer climb.
// Width-normalized browser-reference approximation (not official mobile constants):
// 640x960 viewport, 1080 px/s bounce,
// 1728 px/s² gravity, 600 px/s steering, 114 px platforms. Units here are
// world pixels per 60 Hz tick; rendering/physics remain fixed at 120 Hz.
const LEGACY_RUN4='amulsar_doodle_run_v4',LEGACY_RUN5='amulsar_doodle_run_v5',CAMPAIGN_RUN='amulsar_doodle_run_v6',ROWS=320,NEEDED=24;
const REFERENCE_SCALE=SW/640,GRAVITY=1728*REFERENCE_SCALE/3600,JUMP=-1080*REFERENCE_SCALE/60;
const HORIZONTAL_SPEED=600*REFERENCE_SCALE/60,HORIZONTAL_ACCEL=50*REFERENCE_SCALE/60;
const SPRING_JUMP=-1800*REFERENCE_SCALE/60,BOOST_JUMP=JUMP*1.3,FALL_SPEED=-JUMP;
const PLATFORM_WIDTH=114*REFERENCE_SCALE;

let stageTimeTicks=0,phaseTimes=[null,null,null,null];
function formatTime(seconds){const t=Math.max(0,Math.floor(seconds));return `${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`;}
let checkpointScores=[0,0,0,0];try{const stored=JSON.parse(localStorage.getItem('amulsar_doodle_checkpoints_v4')||'null');if(Array.isArray(stored)&&stored.length===4&&stored.every(v=>Number.isFinite(v)&&v>=0))checkpointScores=stored;}catch(e){}
let gates=[],chapterDone=[false,false,false,false],stationPending=false,lastLanded=-1;
const collectionRows=Array.from({length:NEEDED},(_,i)=>10+i*13);
const campaignScenery=[];
chapters[0].story='Սկսում ես քանդված լանջից՝ ժանգոտ խողովակների ու թթվային հոսքերի խորհրդանշական միջավայրում։ Հավաքիր ջրի 24 նմուշ։ Զգուշացիր կաթիլներից, քայքայված ու անհետացող հարթակներից։ Քո վերելքը լեռան վերականգնման ճանապարհի սկիզբն է։';
chapters[1].story='Հաջորդ հատվածում ուսումնասիրում ես ցիանիդի կիրառման մասին փաստաթղթերը։ Շրջանցիր արտահոսող տարաները և պարբերաբար արտանետվող ամպերը։ Հավաքիր 24 փաստաթուղթ և հասիր հաջորդ հետազոտական կայան։';
chapters[2].story='Քամին փոշին քշում է լանջով։ Հավաքիր օդի 24 չափիչ, զգուշացիր քարաթափումից ու շարժվող հարթակներից։ Լեռը կամաց-կամաց սկսում է մաքրվել։';
chapters[3].story='Ավերակներն աստիճանաբար տեղ են տալիս կանաչին։ Հավաքիր բնության 24 նշան, անցիր մնացած անկայուն հատվածներով ու ավարտիր վերելքը։ Վերջին հատվածում վտանգները նահանջում են, և լեռը կրկին ծաղկում է։';
function buildMountain(){
 world=[];objects=[];gates=[];let y=690,lastCenter=SW/2;const route=[];
 world.push({x:95,y,w:195,type:'start',stage:0,route:0,move:0,phase:0,broken:0});
 const distance=(a,b)=>Math.abs(((a-b+SW*1.5)%SW)-SW/2);
 for(let stage=0;stage<4;stage++)for(let i=1;i<=ROWS;i++){
  const rnd=v=>{const z=Math.sin(v*127.1+stage*72.8)*43758.5453;return z-Math.floor(z)};
  // Irregular scattered ledges, with dense patches and open stretches.
  // Every main ledge is reachable with an ordinary jump; supports offer choices.
  const difficulty=clamp((stage+i/ROWS)/4,0,1),patch=Math.floor(i/9);
  const sparse=rnd(patch*83+800)>.64;
  const gap=i===ROWS?65:(sparse?88+rnd(i+8)*(36+34*difficulty):38+rnd(i+8)*(36+18*difficulty));
  y-=gap;const w=PLATFORM_WIDTH*(.94+rnd(i+1)*.12);
  let center=SW/2;
  for(let k=0;k<64;k++){
   center=w/2+10+rnd(i*79+k*17+97)*(SW-w-20);
   const d=distance(center,lastCenter),recent=route.slice(-3).map(pi=>world[pi]);
   const aligned=recent.length===3&&recent.every(p=>distance(center,p.x+p.w/2)<(p.w+w)/2+12);
   // Short hops, cross-screen jumps and wrap routes all occur; no fixed zigzag.
   if(d>38&&d<SW/2-4&&!aligned)break;
  }
  let type='normal';const special=rnd(i*23+19);
  if(i===ROWS)type='station';
  else if(i>6&&special<.065)type='moving';
  else if(i>9&&special<.105)type='crumble';
  else if(i>16&&special<.135)type='vanishing';
  else if(i>10&&stage===0&&special<.16)type='corroded';
  else if(i>12&&special>.982&&!collectionRows.includes(i))type='spring';
  if(stage===3&&i>ROWS*.75&&['vanishing','corroded'].includes(type))type='normal';
  const x=i===ROWS?20:center-w/2,p={x,y,w:i===ROWS?350:w,type,stage,route:stage*ROWS+i,move:type==='moving'?28+stage*5:0,phase:i*.71+stage,broken:0};
  const pi=world.length;world.push(p);route.push(pi);lastCenter=center;
  if(i===ROWS){gates.push(pi);lastCenter=SW/2;continue;}
  // Special ledges never force a timed landing. Some ordinary areas also fork.
  const needsSupport=['vanishing','corroded','crumble','moving'].includes(type);
  if(needsSupport||rnd(i*31+16)<.14){
   const supportX=center>SW/2?clamp(x-110,12,SW-w-12):clamp(x+110,12,SW-w-12);
   world.push({x:supportX,y:y+(needsSupport?5:12+rnd(i+55)*16),w:PLATFORM_WIDTH,type:'normal',stage,route:p.route,buddy:true,move:0,phase:0,broken:0});
  }
  if(collectionRows.includes(i))objects.push({x:x+w*.42,y:y-35,kind:'collect',stage,platform:pi,offset:w*.42,got:false});
  if(i%24===0)objects.push({x:x+w*.35,y:y-30,kind:'heart',stage,platform:pi,offset:w*.35,got:false});
  if(i%59===0)objects.push({x:x+w*.40,y:y-30,kind:'boost',stage,platform:pi,offset:w*.40,got:false});
  if(i>8&&i%14===0&&!(stage===3&&i>ROWS*.56)){
   const types=stage===0?['drip','seep']:stage===1?['barrel','vent','cyanideDrip']:stage===2?['rock','dust']:['rock'];
   const variant=types[Math.floor(i/14)%types.length],offset=w+(['barrel','vent','dust'].includes(variant)?14:-8);
   objects.push({x:x+offset,y:y-18,kind:'hazard',variant,stage,platform:pi,offset,phase:i*13,got:false});
  }
  if(type==='corroded')objects.push({x:x+w-10,y:y-7,kind:'hazard',variant:'seep',stage,platform:pi,offset:w-10,phase:i*13,got:false});
 }
 goal=690-world[gates[3]].y;
}
function stageStart(n=level){return n?world[gates[n-1]].y:690;}
function phaseProgress(){return clamp((stageStart()-player.y-player.h)/(stageStart()-world[gates[level]].y),0,1);}
function platformX(p,t=frame){return p.x+(p.move?Math.sin(t*(p.stage===2?.026:.019)+p.phase)*p.move:0);}
function platformActive(p,t=frame){return !p.broken&&(p.type!=='vanishing'||((t+p.phase*40)%190)<132);}
function hazardStreamState(o,t=frame){const phase=t+(o.phase||0),p=world[o.platform],x=p?platformX(p,t)+o.offset:o.x;
 if(['drip','cyanideDrip','rock'].includes(o.variant)){const speed=o.variant!=='rock'?1.15:1.55,travel=o.variant!=='rock'?172:235,period=travel/speed+34,cycle=((phase%period)+period)%period;return {x,y:o.y-(o.variant!=='rock'?126:175)+Math.min(cycle*speed,travel),active:cycle*speed<=travel,cycle,period};}
 const cycle=((phase%190)+190)%190;return {x:x+(o.variant==='dust'?Math.sin(t*.02+o.phase)*25:0),y:o.y,active:['vent','dust'].includes(o.variant)?cycle>55&&cycle<139:true,cycle,period:190};}
function objectPosition(o){if(o.kind==='hazard')return hazardStreamState(o);const p=world[o.platform];return {x:p?platformX(p)+o.offset:o.x,y:o.y+Math.sin(frame*.035+o.x)*2,active:true};}

function startChapter(n){level=clamp(Math.floor(n),0,3);buildMountain();stageTimeTicks=0;if(level===0){checkpointScores=[0,0,0,0];phaseTimes=[null,null,null,null];}score=checkpointScores[level]||0;hearts=3;collected=0;altitude=0;camera=0;frame=0;boost=0;shield=0;damageFlash=0;landingSquash=0;lastSave=0;effects=[];stationPending=false;lastLanded=-1;chapterDone=chapters.map((_,i)=>i<level);
objects.forEach(o=>{if(o.stage<level)o.got=true;});const floor=stageStart();player={x:180,y:floor-55,vx:0,vy:JUMP,w:28,h:39};camera=Math.min(0,player.y-425);altitude=690-player.y;started=false;updateHud();intro();}
function intro(){show(`<div class="eyebrow">ԳԼՈՒԽ ${level+1}/4 · ՄԵԿ ՇԱՐՈՒՆԱԿԱԿԱՆ ՎԵՐԵԼՔ</div><h2>${chapters[level].title}</h2><p>${chapters[level].story}</p><p class="mini">Ընտրիր հաջորդ հարթակդ դեռ օդում։ Շարժվիր աջ–ձախ․ եզրով անցնելիս հայտնվում ես մյուս կողմում։ Հավաքիր ${NEEDED} ${chapters[level].collect} և հասիր կայան։ Հարցին պատասխանելուց հետո կշարունակես նույն տեղից՝ առանց մակարդակի վերագործարկման։</p><button class="btn" id="go">ՍԿՍԵԼ ՎԵՐԵԼՔԸ</button><button class="btn alt" id="back">ՔԱՐՏԵԶ</button>`);paper.querySelector('#go').onclick=hide;paper.querySelector('#back').onclick=map;}
function updateHud(){counts.innerHTML=icon(chapters[level].icon)+` <span>${collected}/${NEEDED}</span><span class="lives">`+Array.from({length:3},(_,i)=>`<img src="${assetURL('heart')}" alt="${i<hearts?'կյանք':'կորցրած կյանք'}" style="opacity:${i<hearts?1:.22}">`).join('')+'</span>';label.innerHTML=`<span>Գլուխ ${level+1}/4</span><span class="live-time">${formatTime(stageTimeTicks/60)}</span>`;bar.style.width=`${clamp(altitude/goal*100,0,100)}%`;}
function runSnapshot(){return {version:6,stageTimeTicks,phaseTimes:[...phaseTimes],level,score,hearts,collected,altitude,camera,frame,boost,shield,player:{...player},broken:world.map(p=>p.broken||0),got:objects.map(o=>o.got),chapterDone:[...chapterDone],checkpointScores:[...checkpointScores],skin};}
function saveRun(){if(!started||hearts<=0)return;try{localStorage.setItem(CAMPAIGN_RUN,JSON.stringify(runSnapshot()));runAvailable=true}catch(e){if(!storageWarning)toast('Այս դիտարկիչում առաջընթացը չի պահպանվում');storageWarning=true;}}
function clearRun(){runAvailable=false;try{localStorage.removeItem(CAMPAIGN_RUN);localStorage.removeItem(LEGACY_RUN4);localStorage.removeItem(LEGACY_RUN5);localStorage.removeItem(RUN)}catch(e){}}
function restoreRun(){try{let r=JSON.parse(localStorage.getItem(CAMPAIGN_RUN)||'null');if(!r){const old=JSON.parse(localStorage.getItem(LEGACY_RUN5)||localStorage.getItem(LEGACY_RUN4)||localStorage.getItem(RUN)||'null');if(old&&Number.isInteger(old.level)&&old.level>=0&&old.level<4){startChapter(Math.min(old.level,save.unlocked));toast('Ցատկերն ու ճանապարհը թարմացվել են։ Շարունակիր պահպանված գլխի սկզբից։');return;}throw Error('missing');}
if(r.version!==6||!Number.isInteger(r.level)||r.level<0||r.level>Math.min(save.unlocked,3)||!r.player||!['x','y','vx','vy'].every(k=>Number.isFinite(r.player[k]))||!Number.isFinite(r.frame)||r.frame<0||!Number.isFinite(r.camera)||r.camera>0||!Number.isInteger(r.hearts)||r.hearts<1||r.hearts>3)throw Error('invalid');
startChapter(r.level);if(r.player.y<world[gates[3]].y-300||r.player.y>900||r.camera<world[gates[3]].y-1000||!Array.isArray(r.got)||r.got.length!==objects.length||!r.got.every(v=>typeof v==='boolean')||!Array.isArray(r.broken)||r.broken.length!==world.length||!r.broken.every(v=>Number.isFinite(v)&&v>=0))throw Error('invalid');
objects.forEach((o,i)=>o.got=r.got[i]);world.forEach((p,i)=>p.broken=r.broken[i]);collected=objects.filter(o=>o.kind==='collect'&&o.stage===level&&o.got).length;score=Number.isFinite(r.score)?clamp(r.score,0,1e8):0;hearts=r.hearts;camera=r.camera;frame=r.frame;altitude=clamp(Number(r.altitude)||0,0,goal+300);boost=clamp(Number(r.boost)||0,0,85);shield=100;player={...r.player,w:28,h:39,x:clamp(r.player.x,-30,405),vx:clamp(r.player.vx,-HORIZONTAL_SPEED,HORIZONTAL_SPEED),vy:clamp(r.player.vy,SPRING_JUMP,FALL_SPEED)};chapterDone=chapters.map((_,i)=>i<level);if(Array.isArray(r.checkpointScores)&&r.checkpointScores.length===4&&r.checkpointScores.every(v=>Number.isFinite(v)&&v>=0))checkpointScores=r.checkpointScores;stageTimeTicks=Number.isFinite(r.stageTimeTicks)?Math.max(0,r.stageTimeTicks):0;if(Array.isArray(r.phaseTimes)&&r.phaseTimes.length===4&&r.phaseTimes.every(v=>v===null||(Number.isFinite(v)&&v>=0)))phaseTimes=r.phaseTimes;started=true;hide();updateHud();toast('Վերելքը շարունակվում է');
}catch(e){clearRun();menu();toast('Պահպանված վերելքը վնասված է։ Կարող ես սկսել նորից։');}}
function die(){if(shield>0)return;hearts--;damageFlash=70;effects.push({x:player.x+14,y:player.y+20,life:30,kind:'damage'});if(hearts<=0){clearRun();show(`<div class="eyebrow">ՎԵՐԵԼՔԸ ԴԵՌ ՉԻ ԱՎԱՐՏՎԵԼ</div><h2>Մի հանձնվիր</h2><p>Հավաքած՝ ${collected}/${NEEDED}։ Նախորդ ավարտած գլուխները պահպանված են։</p><button class="btn" id="retry">ԿՐԿԻՆ՝ ԱՅՍ ԳԼԽԻ ՍԿԶԲԻՑ</button><button class="btn alt" id="menu">ԳԼԽԱՎՈՐ</button>`);paper.querySelector('#retry').onclick=()=>startChapter(level);paper.querySelector('#menu').onclick=menu;return;}
const candidates=world.filter(p=>p.stage<=level&&['normal','moving','station','start'].includes(p.type)&&platformActive(p)&&p.y>camera+220&&p.y<camera+610&&p.y<=stageStart());let safe=candidates.sort((a,b)=>Math.abs(a.y-(camera+440))-Math.abs(b.y-(camera+440)))[0]||world[level?gates[level-1]:0];safe.broken=0;lastLanded=world.indexOf(safe);player.x=platformX(safe)+safe.w/2-14;player.y=safe.y-player.h-4;player.vy=JUMP;player.vx=0;shield=150;saveRun();toast(`Մնաց ${hearts} կյանք`);}
function recoverMissing(){const o=objects.find(o=>o.kind==='collect'&&o.stage===level&&!o.got);if(!o)return;const p=world[o.platform];world.forEach(p=>{if(p.stage===level)p.broken=0;});player.x=platformX(p)+o.offset-14;player.y=p.y-player.h-25;player.vy=0;player.vx=0;camera=Math.min(0,p.y-430);shield=130;stationPending=false;hide();saveRun();toast('Վերադարձանք բաց թողած հետքի մոտ');}
function summit(){if(stationPending)return;stationPending=true;const station=world[gates[level]];player.x=clamp(player.x,station.x+10,station.x+station.w-player.w-10);player.y=station.y-player.h;player.vy=0;saveRun();if(collected>=NEEDED){quiz();return;}show(`<div class="eyebrow">ՀԵՏԱԶՈՏԱԿԱՆ ԿԱՅԱՆ</div><h2>${collected}/${NEEDED} հետք</h2><p>Հավաքիր ևս ${NEEDED-collected} հետք, հետո պատասխանիր հարցին ու շարունակիր վերելքը։</p><button class="btn" id="recover">ՎԵՐԱԴԱՌՆԱԼ ԲԱՑ ԹՈՂԱԾ ՀԵՏՔԻ ՄՈՏ</button><button class="btn alt" id="map">ՔԱՐՏԵԶ</button>`);paper.querySelector('#recover').onclick=recoverMissing;paper.querySelector('#map').onclick=map;}
function quiz(){phaseTimes[level]=stageTimeTicks/60;const ch=chapters[level];show(`<div class="eyebrow">ՀԵՏԱԶՈՏԱԿԱՆ ԿԱՅԱՆ ${level+1}/4</div><h2>${ch.title}</h2><p class="stage-time">Փուլի ժամանակը՝ <strong>${formatTime(phaseTimes[level])}</strong></p><p>${ch.question}</p><div class="choices">${ch.options.map((o,i)=>`<button data-a="${i}">${o}</button>`).join('')}</div><p id="feedback" class="mini"></p><button class="btn" id="next" style="display:none">${level===3?'ԱՎԱՐՏԵԼ ՎԵՐԵԼՔԸ':'ՇԱՐՈՒՆԱԿԵԼ ԲԱՐՁՐԱՆԱԼ'}</button>`);
paper.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=+b.dataset.a;paper.querySelectorAll('[data-a]').forEach((x,i)=>{x.disabled=true;x.classList.toggle('correct',i===ch.answer);x.classList.toggle('wrong',i===a&&i!==ch.answer);});paper.querySelector('#feedback').textContent=(a===ch.answer?'Ճիշտ է։ ':'Ճիշտ պատասխանը նշված է։ ')+ch.fact;if(a===ch.answer)score+=250;paper.querySelector('#next').style.display='block';});
paper.querySelector('#next').onclick=()=>{chapterDone[level]=true;save.unlocked=Math.max(save.unlocked,level+1);save.best=Math.max(save.best,score);persist();if(level===3){clearRun();win();return;}
checkpointScores[level+1]=score;try{localStorage.setItem('amulsar_doodle_checkpoints_v4',JSON.stringify(checkpointScores))}catch(e){}level++;stageTimeTicks=0;collected=objects.filter(o=>o.kind==='collect'&&o.stage===level&&o.got).length;hearts=Math.min(3,hearts+1);player.vy=JUMP;player.vx=0;boost=0;shield=90;damageFlash=0;stationPending=false;hide();updateHud();toast(`${level+1}/4 · ${chapters[level].title}`);};}
function win(){show(`<div class="eyebrow">ՎԵՐԵԼՔՆ ԱՎԱՐՏՎԱԾ Է</div><h1>Դու փրկեցիր Ամուլսարը</h1><p>Դու պայքարեցիր Ամուլսարի համար․ անցար ավերակների ու վտանգների միջով, հավաքեցիր 96 հետք և վերադարձրիր լեռան կանաչ ապագան։</p><h2>${score} միավոր</h2><div class="time-summary">${phaseTimes.map((t,i)=>`<p>Գլուխ ${i+1}՝ <strong>${t===null?"—":formatTime(t)}</strong></p>`).join('')}<p>Ընդհանուր՝ <strong>${formatTime(phaseTimes.reduce((sum,t)=>sum+(t||0),0))}</strong></p></div><p class="mini">Սա խաղի խորհրդանշական ավարտն է։ Իրական բնապահպանական արդյունքները պահանջում են տվյալներ, աշխատանք և հանրային մասնակցություն։</p><button class="btn" id="share">ԿԻՍՎԵԼ ԱՐԴՅՈՒՆՔՈՎ</button><button class="btn alt" id="again">ԿՐԿԻՆ ՍԿՍԵԼ</button>`);paper.querySelector('#again').onclick=menu;paper.querySelector('#share').onclick=async()=>{try{const text=`Ես ավարտեցի «Վերադարձրու Ամուլսարը» վերելքը՝ ${score} միավորով։`;if(navigator.share)await navigator.share({title:'Վերադարձրու Ամուլսարը',text,url:location.href});else if(navigator.clipboard){await navigator.clipboard.writeText(text);toast('Պատճենված է');}}catch(e){}};}
function update(step){if(mode!=='play')return;const prevFrame=frame;frame+=step;if(TEST)stageTimeTicks+=step;damageFlash=Math.max(0,damageFlash-step);landingSquash=Math.max(0,landingSquash-step*.1);let dir=(keys.right?1:0)-(keys.left?1:0);if(level===2)dir+=Math.sin(frame*.011)*.25;
// Immediate steering reversal and a short acceleration/braking ramp.
const desired=dir*HORIZONTAL_SPEED;if(dir&&Math.sign(dir)!==Math.sign(player.vx))player.vx=0;
player.vx+=clamp(desired-player.vx,-HORIZONTAL_ACCEL*step,HORIZONTAL_ACCEL*step);
const oldX=player.x,oldBottom=player.y+player.h;player.x+=player.vx*step;
if(player.x+player.w/2>SW)player.x-=SW;if(player.x+player.w/2<0)player.x+=SW;
// Exact constant-gravity displacement until terminal speed: independent of tick size.
const beforeVy=player.vy,accelerating=clamp((FALL_SPEED-beforeVy)/GRAVITY,0,step);
player.y+=beforeVy*accelerating+.5*GRAVITY*accelerating*accelerating+FALL_SPEED*(step-accelerating);
player.vy=Math.min(FALL_SPEED,beforeVy+GRAVITY*step);
if(player.vy>=0)for(let pi=0;pi<world.length;pi++){const p=world[pi];if(p.y<oldBottom-1||p.y>player.y+player.h||!platformActive(p,frame))continue;const cross=clamp((p.y-oldBottom)/(player.y+player.h-oldBottom||1),0,1),px=platformX(p,prevFrame+step*cross),cx=Math.abs(player.x-oldX)>SW/2?player.x:oldX+(player.x-oldX)*cross;if(cx+player.w>px+4&&cx<px+p.w-4){player.y=p.y-player.h;player.vy=p.type==='spring'?SPRING_JUMP:boost>0?BOOST_JUMP:JUMP;lastLanded=pi;landingSquash=1;if(p.type==='crumble'||p.type==='corroded')p.broken=1;if(p.type==='station'&&p.stage===level){summit();return;}break;}}
world.forEach(p=>{if(p.broken){p.broken+=step;if(p.stage===3&&p.broken>240)p.broken=0;}});boost=Math.max(0,boost-step);shield=Math.max(0,shield-step);
for(const o of objects){if(o.got||o.stage!==level||Math.abs(o.y-player.y)>230)continue;const pos=objectPosition(o);if(!pos.active)continue;const rx=o.kind==='hazard'?(o.variant==='seep'?23:19):28,ry=o.variant==='seep'?16:27;if(Math.abs(player.x+14-pos.x)<rx&&Math.abs(player.y+19-pos.y)<ry){if(o.kind==='hazard'){if(shield<=0){die();if(mode!=='play')return;}}
else{o.got=true;if(o.kind==='collect'){collected++;score+=100;if(level===3)shield=Math.max(shield,70);effects.push({x:pos.x,y:pos.y,life:28,kind:'collect'});if(collected===NEEDED||collected%3===0)toast(`${collected}/${NEEDED} · ${chapters[level].collect}`);saveRun();}else if(o.kind==='heart'){hearts=Math.min(3,hearts+1);toast('Լրացուցիչ կյանք');}else if(o.kind==='boost'){boost=85;shield=80;player.vy=BOOST_JUMP;toast('Կարճ թռիչքային օգնություն');}}}}
const target=player.y-SH*.48;if(target<camera)camera=target;altitude=Math.max(altitude,690-player.y);const station=world[gates[level]];if(player.y+player.h<station.y-40){summit();return;}if(player.y-camera>SH+65){shield=0;die();if(mode!=='play')return;}
effects=effects.filter(e=>e.life>0);effects.forEach(e=>{e.life-=step;e.y-=.4*step;});if(frame-lastSave>=120){lastSave=frame;saveRun();}if(Math.floor(frame/3)!==Math.floor(prevFrame/3))updateHud();}
function prepareCampaignScenery(){if(campaignScenery.length)return;const names=['campaign-ruins','landscape-1','landscape-2','landscape-3','landscape-3'],pals=[['#b0b3a8','#c2b393'],['#c4beb0','#d4c3a7'],['#d4d9d1','#e3dfca'],['#d9e5d7','#e4ebd1'],['#d8ece2','#ebefd4']];names.forEach((name,i)=>{const b=document.createElement('canvas');b.width=390;b.height=760;const q=b.getContext('2d'),g=q.createLinearGradient(0,0,0,760);g.addColorStop(0,pals[i][0]);g.addColorStop(1,pals[i][1]);q.fillStyle=g;q.fillRect(0,0,390,760);q.globalAlpha=i===4?.32:.27;q.filter='saturate(.48)';q.drawImage(sprites[name]||sprites['landscape-1'],-8,-12,406,784);campaignScenery.push(b);});}
// Bake platform contrast and silhouette shadows once per artwork, rather than
// running multi-pass canvas filters for every ledge on every animation frame.
const campaignPlatformArt=new Map();
function drawCampaignPlatform(name,x,y,w,h){
 const im=sprites[name];if(!im)return;
 // Cache at the displayed size; station ledges are much wider than normal ones.
 // Bucket widths to reuse images without making a cache entry for every ledge.
 const width=Math.ceil(w*2/32)*32,key=`${name}:${width}`;
 let art=campaignPlatformArt.get(key);
 if(!art){
  const height=width*65/122,pad=16;
  const canvas=document.createElement('canvas');canvas.width=width+pad*2;canvas.height=Math.ceil(height)+pad*2;
  const q=canvas.getContext('2d');
  q.filter='contrast(1.12) saturate(1.06) drop-shadow(0 0 2px rgba(48,57,42,.70)) drop-shadow(0 6px 6px rgba(39,48,36,.28))';
  q.drawImage(im,pad,pad,width,height);
  art={canvas,width,height,pad};campaignPlatformArt.set(key,art);
 }
 const sx=w/art.width,sy=h/art.height;
 ctx.drawImage(art.canvas,x-art.pad*sx,y-art.pad*sy,art.canvas.width*sx,art.canvas.height*sy);
}
function draw(){prepareCampaignScenery();const p=started?phaseProgress():0,n=started?level:3,mix=p*p*(3-2*p);ctx.drawImage(campaignScenery[n],0,0,SW,SH);ctx.globalAlpha=mix;ctx.drawImage(campaignScenery[n+1],0,0,SW,SH);ctx.globalAlpha=1;
ctx.save();ctx.beginPath();ctx.rect(0,64,SW,SH-64);ctx.clip();ctx.translate(0,-camera);
for(const ledge of world){const y=ledge.y;if(y-camera< -100||y-camera>SH+80||ledge.broken>22)continue;const x=platformX(ledge),f=ledge.w/122;ctx.save();if(ledge.broken){ctx.globalAlpha=1-ledge.broken/23;ctx.translate(0,ledge.broken*.7);}if(ledge.type==='vanishing'){const cycle=(frame+ledge.phase*40)%190;ctx.globalAlpha=cycle>132?.10:cycle>110?.5:1;}
const kind=ledge.type==='station'?'finish':ledge.type==='corroded'?'crumble':ledge.type==='vanishing'?'vanishing':ledge.type==='start'?'normal':ledge.type;
drawCampaignPlatform(`platform-${ledge.stage}-${kind}`,x,y-59*f*.65,ledge.w,100*f*.65);ctx.restore();}
for(const o of objects){if(o.got||o.stage>level||o.y-camera< -230||o.y-camera>SH+150)continue;const pos=objectPosition(o);ctx.save();if(o.kind==='hazard'){ctx.globalAlpha=pos.active?1:.24;const name='danger-'+o.variant;if(['drip','cyanideDrip'].includes(o.variant))sprite('danger-pipe',pos.x-13,o.y-150,26,24);if(!pos.active&&['drip','cyanideDrip','rock'].includes(o.variant)){ctx.restore();continue;}if(o.variant==='seep')sprite(name,pos.x-24,pos.y-8,48,17);else if(o.variant==='dust'||o.variant==='vent')sprite(name,pos.x-23,pos.y-17,46,34);else sprite(name,pos.x-15,pos.y-20,30,37);}else sprite(o.kind==='collect'?chapters[o.stage].icon:o.kind,pos.x-14,pos.y-17,28,33);ctx.restore();}
if(damageFlash<=0||Math.floor(frame/7)%2===0){ctx.save();ctx.translate(player.x+14,player.y+19);ctx.rotate(clamp(player.vx*.018,-.13,.13));if(player.vx<-.25)ctx.scale(-1,1);const squash=landingSquash*.11;ctx.scale(1+squash,1-squash);const pose=player.vy< -3?1:player.vy>3?2:0;ctx.shadowColor='#fff9ec';ctx.shadowBlur=6;sprite(`hero-${skin}-${pose}`,-36,-61.5,72,90);ctx.restore();if(shield>0)sprite('shield',player.x+24,player.y-13,16,18);}
for(const e of effects)if(e.kind==='collect'){ctx.globalAlpha=clamp(e.life/28,0,1);sprite(chapters[level].icon,e.x-13,e.y-23,26,32);}ctx.globalAlpha=1;ctx.restore();if(mode==='play'&&frame<100){ctx.fillStyle='#52675c';ctx.font='11px system-ui';ctx.textAlign='center';ctx.fillText('Ընտրիր հարթակ · սեղմիր ձախ կամ աջ',195,SH-105);ctx.textAlign='left';}}
const legacyMenu=menu;menu=function(){legacyMenu();paper.querySelector('#start').textContent='ՍԿՍԵԼ ԱՄԲՈՂՋ ՎԵՐԵԼՔԸ';paper.querySelector('#start').onclick=()=>startChapter(0);const p=paper.querySelector('p');if(p)p.textContent='Քանդված հանքից մինչև կանաչ գագաթ․ մեկ երկար վերելք, չորս հետազոտական կայան և լեռան վերականգնման պատմություն։';};
const legacyMap=map;map=function(){legacyMap();paper.querySelector('p').textContent=`Չորս գլուխ՝ մեկ լեռան վրա։ Յուրաքանչյուրում հավաքիր ${NEEDED} հետք։ Ավարտած գլխից հետո վերելքը շարունակվում է նույն տեղից։`;};
try{runAvailable=!!(localStorage.getItem(CAMPAIGN_RUN)||localStorage.getItem(LEGACY_RUN5)||localStorage.getItem(LEGACY_RUN4)||localStorage.getItem(RUN));}catch(e){}
