from pathlib import Path
import re
root=Path(__file__).parent
original=(root/'original.html').read_text()
js=original.split('<script>')[1].split('</script>')[0]
# Keep the supplied chapter narratives, quiz, menus and progression contract.
js=js.replace("const SW=390,SH=760;", "const SW=390,SH=760;const TEST=new URLSearchParams(location.search).has('test');let accumulator=0,lastSave=0,runAvailable=false,storageWarning=false,landingSquash=0,assetsReady=false;const RUN=STORE_PLACEHOLDER;".replace('const RUN=STORE_PLACEHOLDER;',"const RUN='amulsar_doodle_run_v3';"))
a=js.index("let save={unlocked");b=js.index('const chapters=')
js=js[:a]+'''let save={unlocked:0,skin:0,best:0};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
try{const raw=JSON.parse(localStorage.getItem(STORE)||'{}');if(raw&&typeof raw==='object'){for(const k of ['unlocked','skin','best'])if(Number.isFinite(raw[k]))save[k]=Math.floor(clamp(raw[k],0,k==='unlocked'?4:k==='skin'?5:1e9));}runAvailable=!!localStorage.getItem(RUN)}catch(e){storageWarning=true}skin=save.skin;best=save.best;
'''+js[b:]
# All visible symbols are vector artwork, with text-only action labels.
js=js.replace("const skins=[['🥾','Արշավական'],['🧢','Հետազոտող'],['🦊','Աղվես'],['🧣','Լեռնագնաց'],['🐻','Արջուկ'],['🦉','Գիշերային']];", "const skins=[['','Արշավական'],['','Հետազոտող'],['','Աղվես'],['','Լեռնագնաց'],['','Արջուկ'],['','Գիշերային']];")
js=js.replace("icon:'💧'","icon:'drop'").replace("icon:'⚗'","icon:'document'").replace("icon:'◉'","icon:'meter'").replace("icon:'✿'","icon:'flower'")
# Source-specific allegations are not established by the source HTML; keep the scene explicitly fictional.
js=js.replace('Առվակի մոտ նկատվել են փոփոխություններ։','Խաղի այս պայմանական պատմության մեջ ուսումնասիրում ես առվակի ջուրը։')
js=js.replace('բնակավայրերի ու էկոհամակարգերի հնարավոր ազդեցությունը','բնակավայրերի ու էկոհամակարգերի վրա հնարավոր ազդեցությունը')
js=js.replace('Հասի՛ր չափման կայան','Հասիր չափման կայան')
js=js.replace('պարզիր՝ ինչ է թթվային ապարային դրենաժը։','պարզիր՝ ինչ է թթվային ապարային դրենաժը։ Փխրուն հարթակների վրա երկրորդ անգամ վայրէջք կատարել չես կարող։')
js=js.replace('նյութերի անվտանգ կառավարումը։','նյութերի անվտանգ կառավարումը։ Այս գլխում կան կողք շարժվող հարթակներ։')
js=js.replace('խորհրդանշական ընտրությունը։','խորհրդանշական ընտրությունը։ Բնության նշանները կարճ ժամանակով խաղային վահան են տալիս, իսկ փխրուն հարթակները վերականգնվում են։')
js=js.replace('բարձրության','խաղային բարձրության').replace('մետր բարձրության','խաղային մետր բարձրության')
# In-source facts stay bounded to general processes, with primary-source references in the journal.
def replace_fn(name,next_name,body):
 global js
 a=js.index('function '+name+'(');b=js.index('function '+next_name+'(',a)
 js=js[:a]+body+'\n'+js[b:]
replace_fn('persist','fit', '''function persist(){try{localStorage.setItem(STORE,JSON.stringify(save))}catch(e){storageWarning=true;toast('Առաջընթացի պահպանումը հասանելի չէ այս դիտարկիչում')}}
function runSnapshot(){return {version:3,level,score,hearts,collected,altitude,camera,frame,boost,shield,player:{...player},broken:world.map(p=>p.broken||0),got:objects.map(o=>o.got),skin};}
function saveRun(){if(!started||hearts<=0)return;try{localStorage.setItem(RUN,JSON.stringify(runSnapshot()));runAvailable=true}catch(e){if(!storageWarning)toast('Այս դիտարկիչում առաջընթացը չի պահպանվում');storageWarning=true}}
function clearRun(){runAvailable=false;try{localStorage.removeItem(RUN)}catch(e){}}
function restoreRun(){try{const r=JSON.parse(localStorage.getItem(RUN));if(!r||r.version!==3||!Number.isInteger(r.level)||r.level<0||r.level>Math.min(save.unlocked,3)||!r.player||!['x','y','vx','vy'].every(k=>Number.isFinite(r.player[k]))||r.player.y < -3000||r.player.y>900||!Number.isFinite(r.frame)||!Number.isFinite(r.camera)||r.camera>0||r.camera< -3500||!Number.isInteger(r.hearts)||r.hearts<1||r.hearts>3)throw Error('invalid');startChapter(r.level);if(!Array.isArray(r.got)||r.got.length!==objects.length||!r.got.every(v=>typeof v==='boolean')||!Array.isArray(r.broken)||r.broken.length!==world.length||!r.broken.every(v=>Number.isFinite(v)&&v>=0))throw Error('invalid');objects.forEach((o,i)=>o.got=r.got[i]);world.forEach((p,i)=>p.broken=r.broken[i]);collected=objects.filter(o=>o.kind==='collect'&&o.got).length;score=Number.isFinite(r.score)?clamp(r.score,0,1e7):collected*100;hearts=r.hearts;camera=r.camera;frame=r.frame;altitude=Number.isFinite(r.altitude)?clamp(r.altitude,0,4000):0;boost=Number.isFinite(r.boost)?clamp(r.boost,0,260):0;shield=120;player={...r.player,w:28,h:39,x:clamp(r.player.x,-30,405),vx:clamp(r.player.vx,-5,5),vy:clamp(r.player.vy,-21,12)};started=true;hide();updateHud();toast('Վերելքը շարունակվում է')}catch(e){clearRun();menu();toast('Պահպանված վերելքը վնասված է։ Կարող ես սկսել նորից։')}}
''')
replace_fn('fit','show',"""function fit(){const root=document.getElementById('root'),w=root.clientWidth,h=root.clientHeight,d=Math.min(devicePixelRatio||1,2);c.width=w*d;c.height=h*d;ctx.setTransform(d,0,0,d,0,0);scale=Math.min(w/SW,h/SH);offX=(w-SW*scale)/2;offY=(h-SH*scale)/2;}addEventListener('resize',fit);fit();
""")
js=js.replace("<h1>Վերադարձրու<br>Ամուլսարը ⛰️</h1>",'<div class="cover-art"></div><h1>Վերադարձրու<br>Ամուլսարը</h1>')
js=js.replace('<button class="btn" id="start">', '${runAvailable?\'<button class="btn" id="continue">ՇԱՐՈՒՆԱԿԵԼ ՎԵՐԵԼՔԸ</button>\':\'\'}<button class="btn" id="start">')
js=js.replace('paper.querySelector(\'#start\').onclick=',"if(paper.querySelector('#continue'))paper.querySelector('#continue').onclick=restoreRun;paper.querySelector('#start').onclick=")
js=js.replace('<button class="btn alt" id="skins">🎒 ԿԵՐՊԱՐՆԵՐԸ</button>','<button class="btn alt" id="skins">ԿԵՐՊԱՐՆԵՐԸ</button><button class="btn alt" id="journal">ՀԵՏԱԶՈՏՈՂԻ ՕՐԱԳԻՐԸ</button>')
js=js.replace("paper.querySelector('#skins').onclick=skinMenu}","paper.querySelector('#skins').onclick=skinMenu;paper.querySelector('#journal').onclick=journal}")
js=js.replace('<span class="avatar">${s[0]}</span>','<img class="avatar" src="${assetURL(\'hero-\'+i+\'-0\')}" alt="">')
js=js.replace("${i>save.unlocked?'🔒':ch.icon}","${i>save.unlocked?'Փակ է ·':icon(ch.icon)}")
js=js.replace('${ch.icon}', '${icon(ch.icon)}')
# restore textContent to text, not HTML, in toast interpolation
js=js.replace('toast(`${icon(ch.icon)} ${collected}/5 · ${ch.collect}`)','toast(`${collected}/5 · ${ch.collect}`)')
js=js.replace('started=false;world=[]','started=false;landingSquash=0;lastSave=0;world=[]')
js=js.replace("let x=24+rnd(i+1)*250;", "let prev=world[world.length-1];let x=clamp(prev.x+(rnd(i+1)-.5)*180,34,240);")
js=js.replace("objects.push({x:x+46,y:y-35,kind:'collect',got:false})", "objects.push({x:x+46,y:y-35,kind:'collect',got:false,platform:i})")
js=js.replace("move:type==='moving'?32+n*12:0", "move:type==='moving'?24+n*7:0")
js=js.replace("goal=3420;updateHud();intro()", "goal=3420;updateHud();intro()")
js=js.replace("function hide(){overlay.classList.add('hidden');mode='play'}", "function hide(){overlay.classList.add('hidden');mode='play';started=true;accumulator=0;now=performance.now();document.activeElement?.blur();keys.left=keys.right=false;document.querySelectorAll('.ctrl').forEach(b=>b.classList.remove('active'));paper.inert=true;saveRun()}")
js=js.replace("function show(html){mode='panel';", "function show(html){paper.inert=false;mode='panel';")
replace_fn('updateHud','die', '''function updateHud(){counts.innerHTML=icon(chapters[level].icon)+` <span>${collected}/5</span><span class="lives">`+Array.from({length:3},(_,i)=>`<img src="${assetURL('heart')}" alt="${i<hearts?'կյանք':'կորցրած կյանք'}" style="opacity:${i<hearts?1:.22}">`).join('')+'</span>';label.textContent=`Գլուխ ${level+1}/4`;bar.style.width=`${clamp(altitude/goal*100,0,100)}%`;}
''')
js=js.replace("if(shield>0){shield=0;toast('🛡 Վահանը պաշտպանեց');player.vy=-13;return}","if(shield>0)return;")
js=js.replace("if(hearts<=0){show", "if(hearts<=0){clearRun();show")
js=js.replace("player.x=safe?safe.x+safe.w/2-14:180", "player.x=safe?platformX(safe)+safe.w/2-14:180")
js=js.replace("shield=110;toast", "shield=160;saveRun();toast")
js=js.replace("save.unlocked=Math.max(save.unlocked,level+1);", "clearRun();save.unlocked=Math.max(save.unlocked,level+1);")
js=js.replace("${i<save.unlocked?'✓':''}","${i<save.unlocked?' · ավարտված':''}")
js=js.replace('paper.innerHTML=html;keys.left=keys.right=false','paper.innerHTML=html;releaseInputs()')
js=js.replace('document.activeElement?.blur();keys.left=keys.right=false;', 'document.activeElement?.blur();releaseInputs();')
js=js.replace('մետր խաղային բարձրության','խաղային մետր բարձրության')
js=js.replace('hearts--;effects.push','hearts--;damageFlash=70;effects.push')
js=js.replace('started=false;landingSquash=0;', 'started=false;damageFlash=0;landingSquash=0;')
# Eliminate emoji and typographic pictograms from final game text. Vector icons replace them.
js=re.sub('[\U0001F000-\U0001FAFF\u2600-\u27bf\ufe0f]', '', js)
# Structured full engine replacement, preserving function names used by supplied UI.
a=js.index('function update(dt)');b=js.index("menu();requestAnimationFrame(render);",a)
engine=(root/'engine.js').read_text() if (root/'engine.js').exists() else ''
js=js[:a]+engine+'\n'+(root/'campaign.js').read_text()+'\n'+js[b:]
js=js.replace('menu();requestAnimationFrame(render);',"loadArt().then(()=>{assetsReady=true;menu();requestAnimationFrame(render)}).catch(()=>{paper.innerHTML='<h2>Գրաֆիկան չբեռնվեց</h2><p>Փակիր և կրկին բացիր խաղը։</p><button class=\"btn\" onclick=\"location.reload()\">ԿՐԿԻՆ ԲԱՑԵԼ</button>'});")
js=js.replace('<div class="eyebrow">ԼԵՌՆԱՅԻՆ ԱՐԿԱԾ · 2D</div><div class="cover-art"></div>','<div class="cover-art"></div><div class="eyebrow">ԼԵՌՆԱՅԻՆ ԱՐԿԱԾ · 2D</div>')
css=original.split('<style>')[1].split('</style>')[0]
css+='''
html,body{overscroll-behavior:none}button{touch-action:manipulation}button:focus-visible{outline:3px solid #409aa8;outline-offset:3px}button:disabled{opacity:.55;cursor:default}#root{max-width:560px;margin:auto;background:#193846}#overlay{backdrop-filter:none;background:#102d3a70}.paper{background:linear-gradient(110deg,#f8e6bb,#eddbb1 60%,#f8e9c6);border-color:#35483d;border-radius:14px;padding:20px;box-shadow:0 8px 0 #172f35,0 25px 45px #102e3880;scrollbar-width:thin;touch-action:pan-y}.paper:before{border:1px solid #b69c70;border-radius:8px}.paper h1{font-size:31px;letter-spacing:-1px}.btn{background:linear-gradient(#efc67c,#d9ab65);color:#263e3a;border-color:#425446;border-radius:9px;box-shadow:0 3px 0 #586047}.btn.alt{background:linear-gradient(#d7e1cc,#b3c8bd)}.eyebrow{color:#7b6845;letter-spacing:.5px}.cover-art{height:138px;margin:-12px -12px 10px;background-size:cover;background-position:50% 48%;border-radius:6px;border-bottom:2px solid #6e8768}.avatar{width:70px;height:80px;object-fit:contain;margin:auto}.skin.selected{background:#d6dbb0;border-color:#67814e}.skin{min-height:118px}.icon{width:25px;height:28px;vertical-align:middle;object-fit:contain}.lives{display:flex;gap:1px;margin-left:5px}.lives img{width:18px;height:22px}#counts{display:flex;align-items:center;padding:5px 7px;white-space:nowrap}#levelLabel{max-width:51%;font-size:11px;display:flex;align-items:center}#hud{max-width:536px;margin:auto}.ctrl{width:84px;height:68px;background:linear-gradient(#f0d7a2ef,#c2a676ef);color:#30453d;border:2px solid #445744;border-radius:16px;box-shadow:0 4px #253d38}.ctrl.active{background:#a0bd8e}#toast{top:79px;font-size:12px;width:max-content;max-width:90%;z-index:3}#hud,#controls{transition:opacity .2s}body:has(#overlay:not(.hidden)) #controls,body:has(#overlay:not(.hidden)) #hud,body:has(#overlay:not(.hidden)) #progress{visibility:hidden}.journal a{color:#356b70;word-break:break-word}.journal p{font-size:13px}.journal li{font-size:13px;line-height:1.5;margin-bottom:10px}@media(max-width:360px){.paper{padding:14px}.paper h1{font-size:28px}#levelLabel{font-size:10px;padding:6px}.lives img{width:15px}}@media(prefers-reduced-motion:reduce){*{transition:none!important}}
'''
css+="""
#root{background:#dce7e3}#hud{top:max(12px,env(safe-area-inset-top));left:14px;right:14px;display:grid;grid-template-columns:1fr auto 32px;gap:8px;align-items:center;padding:0;background:none}.pill{border:0;box-shadow:none;border-radius:9px;background:#f8f5e9e6;color:#3c504a;font-weight:650;padding:6px 9px;height:32px}#levelLabel{max-width:none;width:max-content;font-size:11px;white-space:nowrap}#counts{font-size:12px;gap:3px;padding:5px 7px}#counts .icon{width:16px;height:20px}.lives{gap:2px;margin-left:7px}.lives img{width:12px;height:15px}#hud button{height:32px;min-width:32px;width:32px;border:0;box-shadow:none;background:#f8f5e9e6;border-radius:9px;font-size:16px;color:#3c504a}#progress{top:51px;height:2px;left:15px;right:15px;background:#a3b7ac44}#bar{background:#83a093}#controls{padding:0 22px;bottom:max(20px,env(safe-area-inset-bottom))}.ctrl{width:58px;height:52px;border:1px solid #7c958577;border-radius:16px;background:#f7f4e5c9;color:#4d685c;font-size:23px;box-shadow:none}.ctrl.active{background:#c9dac8dd;transform:none}#toast{top:65px;background:#f8f5ebf2;border:1px solid #c7d2c4;color:#3e594b;box-shadow:none;padding:7px 11px}.cover-art{height:112px;opacity:.7}.paper{box-shadow:0 8px 30px #344f432e}.tag{background:#e3e9d8;border:0}.btn{box-shadow:0 2px 0 #7e896b}.paper .mini{color:#6f7969}
"""
css+="""#levelLabel{flex-direction:column;align-items:flex-start;justify-content:center;line-height:12px;padding:3px 8px;min-width:85px}.live-time{font-size:10px;font-variant-numeric:tabular-nums;color:#718378}.stage-time{background:#dce5cf88;border-radius:8px;padding:9px 10px;color:#51664d;font-variant-numeric:tabular-nums}.time-summary p{font-size:13px;display:flex;justify-content:space-between;margin:6px 0}.time-summary{padding:10px 12px;background:#e2e7d488;border-radius:10px}.time-summary strong{font-variant-numeric:tabular-nums}"""
html=original.split('<style>')[0]+'<style>'+css+'</style>'+original.split('</style>')[1].split('<script>')[0]
html=html.replace('💧 0/5 · ❤❤❤','0/5').replace('maximum-scale=1,user-scalable=no','viewport-fit=cover')
html=html.replace('<div class="paper" id="paper">','<div class="paper" id="paper" role="dialog" aria-modal="true" aria-label="Խաղի պատուհան">').replace('<div id="toast">','<div id="toast" role="status" aria-live="polite">')
(root/'game.js').write_text(js)
(root/'styles.css').write_text(css)
(root/'veradardzru-amulsary-doodle.html').write_text(html+'<script>'+ (root/'assets.js').read_text()+js+'</script></body></html>')
