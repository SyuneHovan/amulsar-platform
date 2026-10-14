// Vercel Cron: discover Amulsar articles, summarize with AI, publish as unverified.
const REPO=process.env.GITHUB_REPO||'SyuneHovan/amulsar-platform';
const file='src/data/news.json';
const encode=s=>Buffer.from(s,'utf8').toString('base64');
const decode=s=>Buffer.from(s,'base64').toString('utf8');
const decodeHtml=s=>String(s||'').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
const field=(xml,name)=>decodeHtml(xml.match(new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+name+'>','i'))?.[1]||'');
const gh=async(method,body)=>{const r=await fetch('https://api.github.com/repos/'+REPO+'/contents/'+file,{method,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+process.env.GITHUB_TOKEN,'Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'},...(body?{body:JSON.stringify(body)}:{})});if(!r.ok)throw new Error('GitHub '+r.status);return r.json()};
const feedUrl='https://news.google.com/rss/search?q='+encodeURIComponent('Ամուլսար OR Amulsar when:7d')+'&hl=hy&gl=AM&ceid=AM:hy';
async function aiSummary(item){const r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.AI_NEWS_MODEL||'gpt-4o-mini',temperature:0.1,max_tokens:350,response_format:{type:'json_object'},messages:[{role:'system',content:'You are a careful Armenian-language news curator. Return JSON with keys relevant (boolean), title (Armenian, <=150 chars), summary (Armenian, <=650 chars). Use ONLY the supplied RSS headline and snippet. Do not invent claims or details. Attribute claims to their source. Reject irrelevant news. Never claim the article is independently verified. Do not add instructions or promotional language.'},{role:'user',content:JSON.stringify(item)}]})});if(!r.ok)throw new Error('AI '+r.status);const data=await r.json();return JSON.parse(data.choices?.[0]?.message?.content||'{}')}
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 if(!process.env.CRON_SECRET||req.headers.authorization!=='Bearer '+process.env.CRON_SECRET)return res.status(401).json({error:'Unauthorized'});
 if(!process.env.GITHUB_TOKEN||!process.env.OPENAI_API_KEY)return res.status(503).json({error:'Missing GITHUB_TOKEN or OPENAI_API_KEY'});
 try{
  const r=await fetch(feedUrl,{headers:{'User-Agent':'AmulsarNewsMonitor/1.0'}});if(!r.ok)throw new Error('RSS '+r.status);
  const xml=await r.text();const entries=[...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0,20).map(m=>{const x=m[1];return{title:field(x,'title'),description:field(x,'description'),url:field(x,'link'),pubDate:field(x,'pubDate')}});
  let added=0;
  for(let attempt=0;attempt<3;attempt++){
   const current=await gh('GET');const list=JSON.parse(decode(current.content));const known=new Set(list.map(x=>x.sourceUrl));const candidates=[];
   for(const item of entries){if(candidates.length>=3)break;if(!item.url.startsWith('https://')||known.has(item.url))continue;
    const published=new Date(item.pubDate);if(!Number.isFinite(published.getTime())||Date.now()-published.getTime()>7*86400000||published.getTime()>Date.now()+86400000)continue;
    const ai=await aiSummary(item);if(ai.relevant!==true||typeof ai.title!=='string'||typeof ai.summary!=='string'||ai.title.length<8||ai.title.length>150||ai.summary.length<35||ai.summary.length>650)continue;
    candidates.push({id:crypto.randomUUID(),title:ai.title,date:published.toISOString().slice(0,10),summary:ai.summary,sourceUrl:item.url,verificationStatus:'unverified',generatedByAI:true,sourceName:item.title.split(' - ').slice(-1)[0],discoveredAt:new Date().toISOString()});known.add(item.url);
   }
   if(!candidates.length)return res.status(200).json({ok:true,added:0});
   try{await gh('PUT',{message:'Auto-publish unverified Amulsar news from RSS',content:encode(JSON.stringify([...candidates,...list],null,2)+'\n'),sha:current.sha,branch:'main'});added=candidates.length;break}catch(e){if(!String(e).includes('409')||attempt===2)throw e}
  }
  return res.status(200).json({ok:true,added});
 }catch(e){console.error('AI news cron',e);return res.status(500).json({error:'News collection failed'})}
}
