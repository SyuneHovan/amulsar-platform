const TOKEN=process.env.TELEGRAM_BOT_TOKEN;
const SECRET=process.env.TELEGRAM_WEBHOOK_SECRET;
const GH_TOKEN=process.env.GITHUB_TOKEN;
const REPO=process.env.GITHUB_REPO||'SyuneHovan/amulsar-platform';
const allowed=()=>new Set((process.env.TELEGRAM_EDITOR_IDS||'').split(',').map(x=>x.trim()).filter(Boolean));
const admins=()=>new Set((process.env.TELEGRAM_ADMIN_IDS||'').split(',').map(x=>x.trim()).filter(Boolean));
const tg=async(method,body)=>{const r=await fetch('https://api.telegram.org/bot'+TOKEN+'/'+method,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error('Telegram '+r.status);return r.json()};
const reply=(chat_id,text)=>tg('sendMessage',{chat_id,text,disable_web_page_preview:true});
const menu='Բարև 🌱\n\nՆյութ ավելացնելու համար ընտրիր հրամանը՝\n/news — նորություն\n/event — ակցիա կամ միջոցառում\n/document — փաստաթուղթ\n/id — քո Telegram ID-ն\n\nԲոտը հասանելի է միայն թույլատրված խմբագիրներին։';
const templates={
news:'Նորություն\nՎերնագիր: \nԱմսաթիվ: 2026-10-15\nՆկարագրություն: \nԱղբյուր: https://',
event:'Ակցիա\nՎերնագիր: \nԱմսաթիվ: 2026-10-15\nԺամ: 15:00\nՎայր: \nՆկարագրություն: \nԱղբյուր: https://',
document:'Փաստաթուղթ\nՎերնագիր: \nՏեսակ: Հետազոտություն\nՏարեթիվ: 2026\nՀղում: https://'
};
function parse(text){
 const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 const type=({'Նորություն':'news','Ակցիա':'event','Փաստաթուղթ':'document'})[lines[0]];
 if(!type)return null;
 const data={};for(const line of lines.slice(1)){const m=line.match(/^([^:]+):\s*(.*)$/);if(m)data[m[1].trim()]=m[2].trim()}
 const title=data['Վերնագիր'];if(!title||title.length>180)throw new Error('Վերնագիրը պարտադիր է (մինչև 180 նիշ)։');
 const link=data['Աղբյուր']||data['Հղում'];let u;try{u=new URL(link)}catch{throw new Error('Աղբյուրի ճիշտ https:// հղում է պետք։')}if(u.protocol!=='https:')throw new Error('Աղբյուրը պետք է սկսվի https://-ով։');
 const id=crypto.randomUUID();
 if(type==='document'){if(!data['Տեսակ']||!data['Տարեթիվ'])throw new Error('Լրացրու տեսակը և տարեթիվը։');return{file:'src/data/documents.json',item:{id,title,kind:data['Տեսակ'],year:data['Տարեթիվ'],url:u.href}}}
 const date=data['Ամսաթիվ'];if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||Number.isNaN(new Date(date+'T12:00:00').getTime())||new Date(date+'T12:00:00').toISOString().slice(0,10)!==date)throw new Error('Ամսաթիվը գրիր YYYY-MM-DD ձևով։');
 const description=data['Նկարագրություն'];if(!description||description.length>3000)throw new Error('Նկարագրությունը պարտադիր է (մինչև 3000 նիշ)։');
 if(type==='news')return{file:'src/data/news.json',item:{id,title,date,summary:description,sourceUrl:u.href}};
 if(!data['Վայր'])throw new Error('Նշիր միջոցառման վայրը։');
 return{file:'src/data/events.json',item:{id,title,date,time:data['Ժամ']||'',location:data['Վայր'],description,sourceUrl:u.href}};
}
const gh=async(path,opts={})=>{const r=await fetch('https://api.github.com/repos/'+REPO+'/contents/'+path,{...opts,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+GH_TOKEN,'X-GitHub-Api-Version':'2022-11-28',...(opts.headers||{})}});if(!r.ok)throw new Error('GitHub '+r.status+': '+(await r.text()).slice(0,160));return r.json()};
const encode=s=>btoa(unescape(encodeURIComponent(s)));
const decode=s=>decodeURIComponent(escape(atob(s.replace(/\s/g,''))));
async function publish(file,item){for(let attempt=0;attempt<3;attempt++){const current=await gh(file);const list=JSON.parse(decode(current.content));if(!Array.isArray(list))throw new Error('JSON-ը զանգված չէ');list.unshift(item);try{await gh(file,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Publish '+file+' via Telegram bot',content:encode(JSON.stringify(list,null,2)+'\n'),sha:current.sha,branch:'main'})});return}catch(e){if(!String(e).includes('409')&&!String(e).includes('422')||attempt===2)throw e}}}
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!TOKEN||!SECRET||!GH_TOKEN)return res.status(503).json({error:'Bot not configured'});
 if(req.headers['x-telegram-bot-api-secret-token']!==SECRET)return res.status(403).json({error:'Forbidden'});
 try{const m=req.body?.message;if(!m?.text||!m?.from?.id||!m?.chat?.id)return res.status(200).json({ok:true});
 const id=String(m.from.id),chat=m.chat.id,text=m.text.trim();
 if(text==='/id'||text.startsWith('/id@')){await reply(chat,'Քո Telegram ID-ն՝ '+id);return res.status(200).json({ok:true})}
 if(!allowed().has(id)&&!admins().has(id)){await reply(chat,'Այս բոտի խմբագիրների ցանկում չկաս։ Ուղարկիր քո ID-ն ադմինին՝ '+id);return res.status(200).json({ok:true})}
 if(text==='/start'||text==='/help'){await reply(chat,menu);return res.status(200).json({ok:true})}
 const cmd=text.split('@')[0];
 if(cmd==='/news'||cmd==='/event'||cmd==='/document'){await reply(chat,'Պատճենիր այս ձևանմուշը, լրացրու և ուղարկիր որպես մեկ հաղորդագրություն։\n\n'+templates[cmd.slice(1)]+'\n\n⚠️ Ուղարկելուց հետո նյութը անմիջապես կհրապարակվի։');return res.status(200).json({ok:true})}
 const parsed=parse(text);if(!parsed){await reply(chat,menu);return res.status(200).json({ok:true})}
 await publish(parsed.file,parsed.item);await reply(chat,'✅ Նյութը ավելացվեց GitHub-ում։ Vercel-ի հրապարակումից հետո այն կհայտնվի կայքում։\n\n'+parsed.item.title);
 return res.status(200).json({ok:true})
 }catch(e){console.error('Bot error',e);try{if(req.body?.message?.chat?.id)await reply(req.body.message.chat.id,'❌ Չհաջողվեց հրապարակել։ '+String(e.message||e).slice(0,200))}catch{}return res.status(200).json({ok:true})}
}