import React,{useEffect,useRef,useState} from 'react';
const clientId=import.meta.env.VITE_GOOGLE_CLIENT_ID||'';
const tabs=[['news','Նորություններ'],['events','Միջոցառումներ'],['documents','Փաստաթղթեր']];
const initial={title:'',date:new Date().toLocaleDateString('en-CA'),summary:'',sourceUrl:'',sourceName:'',location:'',time:'',kind:''};
export default function Admin(){
 const [token,setToken]=useState(''),[email,setEmail]=useState(''),[type,setType]=useState('news'),[items,setItems]=useState([]),[filter,setFilter]=useState('pending'),[busy,setBusy]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[form,setForm]=useState(initial),[adding,setAdding]=useState(false);
 const googleRef=useRef(null);
 useEffect(()=>{
  if(!clientId)return;
  const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.onload=()=>{
   window.google.accounts.id.initialize({client_id:clientId,callback:({credential})=>{setToken(credential);setError('')}});
   if(googleRef.current)window.google.accounts.id.renderButton(googleRef.current,{theme:'outline',size:'large',shape:'pill',width:260,text:'signin_with'});
  };document.head.appendChild(script);return()=>{script.remove()};
 },[]);
 const request=async(method='GET',body)=>{
  const r=await fetch('/api/admin?type='+type,{method,headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const json=await r.json().catch(()=>({}));if(!r.ok)throw Error(json.error||'Սխալ առաջացավ');return json;
 };
 const load=async()=>{if(!token)return;setBusy('load');setError('');try{const data=await request();setItems(data.items||[]);setEmail(data.email||'')}catch(e){setError(e.message)}finally{setBusy('')}};
 useEffect(()=>{if(token)load()},[token,type]);
 const act=async(action,id,item)=>{
  if(action==='delete'&&!window.confirm('Վստա՞հ ես, որ ուզում ես ընդմիշտ ջնջել նյութը։'))return;
  setBusy(id||'create');setError('');setNotice('');
  try{await request('POST',{action,id,item});setNotice(action==='create'?'Նյութը պահպանվեց':action==='delete'?'Նյութը ջնջվեց':'Կարգավիճակը պահպանվեց');if(action==='create'){setAdding(false);setForm(initial)}await load()}
  catch(e){setError(e.message)}finally{setBusy('')}
 };
 const shown=items.filter(x=>type!=='news'||filter==='all'||(filter==='pending'?x.verificationStatus!=='verified'&&x.verificationStatus!=='false':filter==='verified'?x.verificationStatus==='verified':x.verificationStatus==='false'));
 return <section className="admin-wrap"><div className="admin-top"><div><span className="admin-eyebrow">AMULSAR · CONTENT STUDIO</span><h1>Խմբագրական վահանակ</h1><p>Ստուգիր աղբյուրները, հրապարակիր կամ հեռացրու նյութերը։</p></div>{token&&<button className="admin-ghost" onClick={()=>{window.google?.accounts.id.disableAutoSelect();setToken('');setEmail('');setItems([])}}>Դուրս գալ ↗</button>}</div>
 {!clientId?<div className="admin-panel"><h2>Google մուտքը դեռ կարգավորված չէ</h2><p>Vercel-ում անհրաժեշտ է ավելացնել VITE_GOOGLE_CLIENT_ID և GOOGLE_CLIENT_ID։</p></div>:!token?<div className="admin-login admin-panel"><div className="admin-lock">✦</div><h2>Մուտք՝ Google հաշվով</h2><p>Միայն թույլատրված խմբագիրների համար։</p><div ref={googleRef}/></div>:<><div className="admin-meta">● {email||'Ստուգվում է…'} <span>· Փոփոխությունները հրապարակվում են GitHub-ի միջոցով</span></div><div className="admin-tabs">{tabs.map(([id,label])=><button key={id} className={type===id?'selected':''} onClick={()=>{setType(id);setAdding(false);setNotice('')}}>{label}</button>)}</div><div className="admin-tools"><div className="admin-filters">{type==='news'&&[['pending','Ստուգման հերթ'],['verified','Ստուգված'],['false','Մերժված'],['all','Բոլորը']].map(([id,label])=><button key={id} className={filter===id?'selected':''} onClick={()=>setFilter(id)}>{label}</button>)}</div><button className="admin-primary" onClick={()=>setAdding(v=>!v)}>{adding?'Փակել':'＋ Ավելացնել'}</button></div>
 {adding&&<form className="admin-panel admin-form" onSubmit={e=>{e.preventDefault();act('create',null,form)}}><h2>Նոր նյութ</h2><label>Վերնագիր<input required minLength={5} maxLength={180} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Ամսաթիվ<input type="date" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label>Նկարագրություն<textarea required minLength={15} rows={4} value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})}/></label><label>Աղբյուրի հղում<input type="url" required placeholder="https://" value={form.sourceUrl} onChange={e=>setForm({...form,sourceUrl:e.target.value})}/></label>{type==='news'&&<label>Աղբյուրի անուն<input value={form.sourceName} onChange={e=>setForm({...form,sourceName:e.target.value})}/></label>}{type==='events'&&<><label>Վայր<input value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label><label>Ժամ<input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></label></>}{type==='documents'&&<label>Տեսակ<input value={form.kind} onChange={e=>setForm({...form,kind:e.target.value})}/></label>}<button disabled={!!busy} className="admin-primary">Պահպանել</button></form>}
 {error&&<div className="admin-alert" role="alert">{error}</div>}{notice&&<div className="admin-notice" role="status">✓ {notice}</div>}
 <div className="admin-count"><b>{shown.length}</b> նյութ <button className="admin-ghost" disabled={!!busy} onClick={load}>↻ Թարմացնել</button></div>
 {busy==='load'?<div className="admin-panel">Բեռնվում է…</div>:shown.length===0?<div className="admin-panel admin-empty">Այս բաժնում նյութեր չկան։</div>:<div className="admin-list">{shown.map(x=><article className="admin-card" key={x.id}><div className="admin-card-meta"><span>{x.date||x.year||''} · {x.sourceName||'Աղբյուր'}</span>{type==='news'&&<span className={'admin-status '+(x.verificationStatus||'pending')}>{x.verificationStatus==='verified'?'ՍՏՈՒԳՎԱԾ':x.verificationStatus==='false'?'ՄԵՐԺՎԱԾ':'ՍՊԱՍՈՒՄ Է'}</span>}</div><h3>{x.title}</h3><p>{x.summary||x.description||''}</p><a className="admin-source" href={x.sourceUrl||x.url} target="_blank" rel="noopener noreferrer">Բացել սկզբնաղբյուրը ↗</a><div className="admin-card-actions">{type==='news'&&<><button disabled={!!busy} className="admin-approve" onClick={()=>act('verify',x.id)}>✓ Հաստատել</button><button disabled={!!busy} className="admin-reject" onClick={()=>act('reject',x.id)}>✕ Մերժել</button></>}<button disabled={!!busy} className="admin-delete" onClick={()=>act('delete',x.id)}>Ջնջել</button></div></article>)}</div>}</>}
 </section>;
}
