const TOKEN=process.env.TELEGRAM_BOT_TOKEN;
const SECRET=process.env.TELEGRAM_WEBHOOK_SECRET;
const GH_TOKEN=process.env.GITHUB_TOKEN;
const REPO=process.env.GITHUB_REPO||'SyuneHovan/amulsar-platform';
const allowed=()=>new Set((process.env.TELEGRAM_EDITOR_IDS||'').split(',').map(x=>x.trim()).filter(Boolean));
const admins=()=>new Set((process.env.TELEGRAM_ADMIN_IDS||'').split(',').map(x=>x.trim()).filter(Boolean));
const tg=async(method,body)=>{const r=await fetch('https://api.telegram.org/bot'+TOKEN+'/'+method,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error('Telegram '+r.status);return r.json()};
const reply=(chat_id,text,html=false)=>tg('sendMessage',{chat_id,text,disable_web_page_preview:true,...(html?{parse_mode:'HTML'}:{})});
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const mono=s=>'<code>'+esc(s)+'</code>';
const menu='Բարև 🌱\n\n/news — նորություն\n/event — ակցիա կամ միջոցառում\n/document — փաստաթուղթ\n/review — լուրերի արագ ստուգում\n/delete — նյութերի ցանկ և ջնջում (ադմին)\n/id — քո Telegram ID-ն\n\nԲոտը հասանելի է միայն թույլատրված խմբագիրներին։';
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
const encode=s=>Buffer.from(s,'utf8').toString('base64');
const decode=s=>Buffer.from(s,'base64').toString('utf8');
async function publish(file,item){for(let attempt=0;attempt<3;attempt++){const current=await gh(file);const list=JSON.parse(decode(current.content));if(!Array.isArray(list))throw new Error('JSON-ը զանգված չէ');list.unshift(item);try{await gh(file,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Publish '+file+' via Telegram bot',content:encode(JSON.stringify(list,null,2)+'\n'),sha:current.sha,branch:'main'})});return}catch(e){if(!String(e).includes('409')&&!String(e).includes('422')||attempt===2)throw e}}}

const datasets={news:'src/data/news.json',event:'src/data/events.json',document:'src/data/documents.json'};
const names={news:'Նորություններ',event:'Միջոցառումներ',document:'Փաստաթղթեր'};
async function loadItems(type){const current=await gh(datasets[type]);const items=JSON.parse(decode(current.content));if(!Array.isArray(items))throw new Error('JSON-ը զանգված չէ');return{current,items}}
async function removeItem(type,itemId){
 for(let attempt=0;attempt<3;attempt++){
  const {current,items}=await loadItems(type);
  const index=items.findIndex(x=>x.id===itemId);
  if(index<0)return null;
  const [removed]=items.splice(index,1);
  try{
   await gh(datasets[type],{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Remove '+type+' via Telegram bot',content:encode(JSON.stringify(items,null,2)+'\n'),sha:current.sha,branch:'main'})});
   return removed;
  }catch(e){if((!String(e).includes('409')&&!String(e).includes('422'))||attempt===2)throw e}
 }
}
async function deletionList(type){
 const {items}=await loadItems(type);
 if(!items.length)return names[type]+': նյութեր չկան։';
 return names[type]+' (վերջին 15)՝\n\n'+items.slice(0,15).map((x,i)=>(i+1)+'. '+esc(x.title)+'\n'+mono('/delete '+type+' '+x.id)).join('\n\n')+'\n\nՀպիր հրամանին՝ պատճենելու համար։';
}

const reviewKeyboard=(item)=>({inline_keyboard:[
 [{text:'✅ Ստուգված',callback_data:'review:verified:'+item.id},{text:'❌ Կեղծ',callback_data:'review:false:'+item.id}],
 [{text:'🗑 Հեռացնել',callback_data:'review:delete:'+item.id},{text:'⏭ Հաջորդը',callback_data:'review:skip:'+item.id}]
]});
const pendingNews=items=>items.filter(x=>x.verificationStatus!=='verified'&&x.verificationStatus!=='false'&&x.generatedByAI===true);
async function reviewNext(chat,excludeId=null){
 const {items}=await loadItems('news');
 const next=pendingNews(items).find(x=>x.id!==excludeId);
 if(!next){await reply(chat,'✅ Ստուգման հերթում այլ ԱԲ նորութիւն չկայ։');return}
 const status='⏳ Չստուգված';
 await tg('sendMessage',{chat_id:chat,text:status+' · '+(next.date||'')+'\\n'+(next.title||'').slice(0,220)+'\\n\\n'+(next.summary||'').slice(0,650)+'\\n\\n🔗 Աղբյուր՝ '+(next.sourceUrl||'հղում չկա'),disable_web_page_preview:true,reply_markup:reviewKeyboard(next)});
}
const clearReviewMessage=async cb=>{if(cb.message?.chat?.id&&cb.message?.message_id)await tg('deleteMessage',{chat_id:cb.message.chat.id,message_id:cb.message.message_id}).catch(()=>{})};
async function moderate(itemId,action){
 for(let attempt=0;attempt<3;attempt++){
  const {current,items}=await loadItems('news');const index=items.findIndex(x=>x.id===itemId);
  if(index<0)return null;
  const item=items[index];
  if(action==='delete')items.splice(index,1);
  else{item.verificationStatus=action;item.reviewedAt=new Date().toISOString()}
  try{await gh(datasets.news,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Review news: '+action,content:encode(JSON.stringify(items,null,2)+'\n'),sha:current.sha,branch:'main'})});return item}
  catch(e){if((!String(e).includes('409')&&!String(e).includes('422'))||attempt===2)throw e}
 }
}
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!TOKEN||!SECRET||!GH_TOKEN)return res.status(503).json({error:'Bot not configured'});
 if(req.headers['x-telegram-bot-api-secret-token']!==SECRET)return res.status(403).json({error:'Forbidden'});
 try{
 const cb=req.body?.callback_query;
 if(cb){
  const user=String(cb.from?.id||''),chat=cb.message?.chat?.id,valid=allowed().has(user)||admins().has(user);
  const answer=async message=>tg('answerCallbackQuery',{callback_query_id:cb.id,text:message,show_alert:false});
  if(!valid){await answer('Մուտքը թույլատրված չէ');return res.status(200).json({ok:true})}
  if(cb.data?.startsWith('page:')){await answer('Բացվում է');await reviewNext(chat);return res.status(200).json({ok:true})}
  const match=cb.data?.match(/^review:(verified|false|delete|skip):([0-9a-f-]{36})$/i);
  if(match){
   const action=match[1],itemId=match[2];
   if(action==='skip'){await answer('Հաջորդը');await clearReviewMessage(cb);await reviewNext(chat,itemId);return res.status(200).json({ok:true})}
   if(action==='delete'&&!admins().has(user)){await answer('Ջնջել կարող է միայն ադմինը');return res.status(200).json({ok:true})}
   if(action==='delete'){
    await answer('Հաստատիր ջնջումը');
    await tg('editMessageReplyMarkup',{chat_id:chat,message_id:cb.message.message_id,reply_markup:{inline_keyboard:[[{text:'🗑 Այո, ջնջել',callback_data:'confirm:'+itemId},{text:'↩️ Չեղարկել',callback_data:'cancel:'+itemId}]]}}).catch(()=>{});
    return res.status(200).json({ok:true})
   }
   await answer('Մշակվում է…');
   const item=await moderate(itemId,action);
   if(item){await clearReviewMessage(cb);await reviewNext(chat)}
   else await reply(chat,'Լուրը չգտնվեց։');
   return res.status(200).json({ok:true})
  }
  if(cb.data?.startsWith('confirm:')){
   if(!admins().has(user)){await answer('Միայն ադմինը');return res.status(200).json({ok:true})}
   const itemId=cb.data.slice(8);if(!/^[0-9a-f-]{36}$/i.test(itemId)){await answer('Սխալ ID');return res.status(200).json({ok:true})}
   await answer('Ջնջվում է…');
   const item=await moderate(itemId,'delete');
   if(item){await clearReviewMessage(cb);await reviewNext(chat)}
   else await reply(chat,'Լուրը չգտնվեց։');
   return res.status(200).json({ok:true})
  }
  if(cb.data?.startsWith('cancel:')){
   await answer('Չեղարկվեց');
   const itemId=cb.data.slice(7);
   const {items}=await loadItems('news'),item=items.find(x=>x.id===itemId);
   if(item)await tg('editMessageReplyMarkup',{chat_id:chat,message_id:cb.message.message_id,reply_markup:reviewKeyboard(item)}).catch(()=>{});
   return res.status(200).json({ok:true})
  }
  await answer('Չեղարկվեց');return res.status(200).json({ok:true})
 }
 const m=req.body?.message;if(!m?.text||!m?.from?.id||!m?.chat?.id)return res.status(200).json({ok:true});
 const id=String(m.from.id),chat=m.chat.id,text=m.text.trim();
 if(text==='/id'||text.startsWith('/id@')){await reply(chat,'Քո Telegram ID-ն՝ '+id);return res.status(200).json({ok:true})}
 if(!allowed().has(id)&&!admins().has(id)){await reply(chat,'Այս բոտի խմբագիրների ցանկում չկաս։ Ուղարկիր քո ID-ն ադմինին՝ '+id);return res.status(200).json({ok:true})}
 if(text==='/delete'||text==='/delete@AmulsarContentBot'){
  if(!admins().has(id)){await reply(chat,'⛔ Ջնջել կարող է միայն ադմինը։');return res.status(200).json({ok:true})}
  await reply(chat,'Ընտրիր բաժինը՝\n'+mono('/delete news')+' — նորություններ\n'+mono('/delete event')+' — միջոցառումներ\n'+mono('/delete document')+' — փաստաթղթեր',true);
  return res.status(200).json({ok:true})
 }
 if(text.startsWith('/delete ')||text.startsWith('/confirmdelete ')){
  if(!admins().has(id)){await reply(chat,'⛔ Ջնջել կարող է միայն ադմինը։');return res.status(200).json({ok:true})}
  const parts=text.split(/\s+/),type=parts[1],itemId=parts[2];
  if(!datasets[type]){await reply(chat,'Բաժինը սխալ է։ Օգտագործիր /delete');return res.status(200).json({ok:true})}
  if(!itemId){await reply(chat,await deletionList(type),true);return res.status(200).json({ok:true})}
  if(!/^[0-9a-f-]{36}$/i.test(itemId)){await reply(chat,'Նյութի ID-ն սխալ է։');return res.status(200).json({ok:true})}
  if(parts[0]==='/delete'){
   const {items}=await loadItems(type),item=items.find(x=>x.id===itemId);
   await reply(chat,item?'⚠️ Վստա՞հ ես, որ ուզում ես ջնջել «'+esc(item.title)+'» նյութը։\n\nՀաստատելու համար պատճենիր՝\n'+mono('/confirmdelete '+type+' '+itemId):'Նյութը չգտնվեց։',true);
  }else{
   const removed=await removeItem(type,itemId);
   await reply(chat,removed?'✅ Ջնջվեց՝ '+removed.title+'\nՓոփոխությունը կայքում կհայտնվի Vercel-ի հաջորդ հրապարակումից հետո։':'Նյութն արդեն ջնջված է կամ չի գտնվել։');
  }
  return res.status(200).json({ok:true})
 }
 if(text==='/review'||text.startsWith('/review@')){await reviewNext(chat);return res.status(200).json({ok:true})}
 if(text==='/start'||text==='/help'){await reply(chat,menu);return res.status(200).json({ok:true})}
 const cmd=text.split('@')[0];
 if(cmd==='/news'||cmd==='/event'||cmd==='/document'){await reply(chat,'Պատճենիր ձևանմուշը, լրացրու և ուղարկիր որպես մեկ հաղորդագրություն։\n\n<pre>'+esc(templates[cmd.slice(1)])+'</pre>\n\n⚠️ Ուղարկելուց հետո նյութը անմիջապես կհրապարակվի։',true);return res.status(200).json({ok:true})}
 const parsed=parse(text);if(!parsed){await reply(chat,menu);return res.status(200).json({ok:true})}
 await publish(parsed.file,parsed.item);await reply(chat,'✅ Նյութը ավելացվեց GitHub-ում։ Vercel-ի հրապարակումից հետո այն կհայտնվի կայքում։\n\n'+parsed.item.title);
 return res.status(200).json({ok:true})
 }catch(e){console.error('Bot error',e);try{if(req.body?.message?.chat?.id)await reply(req.body.message.chat.id,'❌ Չհաջողվեց հրապարակել։ '+String(e.message||e).slice(0,200))}catch{}return res.status(200).json({ok:true})}
}