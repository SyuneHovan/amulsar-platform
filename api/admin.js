import {OAuth2Client} from 'google-auth-library';
import {randomUUID} from 'node:crypto';
const repo=process.env.GITHUB_REPO||'SyuneHovan/amulsar-platform';
const files={news:'src/data/news.json',events:'src/data/events.json',documents:'src/data/documents.json'};
const client=new OAuth2Client();
const enc=s=>Buffer.from(s,'utf8').toString('base64');
const dec=s=>Buffer.from(s,'base64').toString('utf8');
const norm=s=>String(s||'').toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
async function gh(file,method='GET',body){
 const r=await fetch('https://api.github.com/repos/'+repo+'/contents/'+file,{method,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+process.env.GITHUB_TOKEN,'Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},...(body?{body:JSON.stringify(body)}:{})});
 if(!r.ok)throw Error('GitHub '+r.status+': '+(await r.text()).slice(0,180));return r.json();
}
async function authorize(req){
 const token=(req.headers.authorization||'').match(/^Bearer (.+)$/)?.[1];
 if(!token)throw Error('Մուտք գործիր Google-ով։');
 const ticket=await client.verifyIdToken({idToken:token,audience:process.env.GOOGLE_CLIENT_ID});
 const p=ticket.getPayload(),emails=(process.env.ADMIN_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
 if(!p.email_verified||!emails.includes((p.email||'').toLowerCase()))throw Error('Այս Google հաշիւը մուտքի իրաւունք չունի։');
 return p.email;
}
const safeUrl=s=>{const u=new URL(s);if(u.protocol!=='https:')throw Error('Հղումը պէտք է լինի https://');return u.href};
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Method not allowed'});
 if(!process.env.GOOGLE_CLIENT_ID||!process.env.ADMIN_EMAILS||!process.env.GITHUB_TOKEN)return res.status(503).json({error:'Ադմինկայի կարգաւորումները դեռ աւարտուած չեն։'});
 let email;try{email=await authorize(req)}catch(e){return res.status(403).json({error:e.message||'Մուտքը մերժուած է'})}
 const type=String(req.query?.type||'news');
 if(!files[type])return res.status(400).json({error:'Սխալ բաժին'});
 try{
  if(req.method==='GET'){
   const current=await gh(files[type]);return res.status(200).json({email,items:JSON.parse(dec(current.content))});
  }
  const action=req.body?.action,id=req.body?.id,data=req.body?.item||{};
  if(!['verify','reject','delete','create'].includes(action))return res.status(400).json({error:'Անյայտ գործողութիւն'});
  if(action!=='create'&&(!id||typeof id!=='string'))return res.status(400).json({error:'Նիւթի ID-ն բացակայում է'});
  if(['verify','reject'].includes(action)&&type!=='news')return res.status(400).json({error:'Ստուգումը հասանելի է միայն լուրերի համար'});
  let created;
  if(action==='create'){
   const title=String(data.title||'').trim(),description=String(data.summary||data.description||'').trim();
   if(title.length<5||title.length>180||description.length<15||description.length>3000)return res.status(400).json({error:'Լրացրու վերնագիրն ու նկարագրութիւնը'});
   const url=safeUrl(String(data.sourceUrl||''));
   const date=String(data.date||'');
   if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date)))return res.status(400).json({error:'Ամսաթիւը սխալ է'});
   created={id:randomUUID(),title,date,sourceUrl:url,...(type==='news'?{summary:description,verificationStatus:'verified',sourceName:String(data.sourceName||'').slice(0,100)}:type==='events'?{description,location:String(data.location||'').slice(0,180),time:String(data.time||'').slice(0,20)}:{kind:String(data.kind||'Փաստաթուղթ'),year:date.slice(0,4),url})};
  }
  for(let attempt=0;attempt<3;attempt++){
   const current=await gh(files[type]),items=JSON.parse(dec(current.content));
   if(action==='create'){
    if(items.some(x=>x.sourceUrl===created.sourceUrl||norm(x.title)===norm(created.title)))return res.status(409).json({error:'Այս նիւթը կամ հղումն արդէն կայ'});
    items.unshift(created);
   }else{
    const i=items.findIndex(x=>x.id===id);
    if(i<0)return res.status(404).json({error:'Նիւթը չի գտնուել։ Թարմացրու ցանկը'});
    if(action==='delete')items.splice(i,1);
    else{items[i].verificationStatus=action==='verify'?'verified':'false';items[i].reviewedAt=new Date().toISOString();items[i].reviewedBy=email}
   }
   try{
    await gh(files[type],'PUT',{message:'Admin '+action+' '+type+' by '+email,content:enc(JSON.stringify(items,null,2)+'\n'),sha:current.sha,branch:'main'});
    return res.status(200).json({ok:true});
   }catch(e){if(!/GitHub (409|422)/.test(e.message)||attempt===2)throw e}
  }
 }catch(e){console.error('Admin error',e);return res.status(500).json({error:String(e.message||e).slice(0,240)})}
}
