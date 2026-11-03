const normalize=value=>String(value??'').normalize('NFKC').toLocaleLowerCase('hy').replace(/և/g,'եւ').trim();
const timestamp=item=>{const value=Date.parse(item.date||item.discoveredAt||'');return Number.isFinite(value)?value:null;};
export function selectNews(items,{filter='pending',query='',sort='newest'}={}){
 const terms=normalize(query).split(/\s+/).filter(Boolean);
 return items.filter(item=>{
  const status=item.verificationStatus;
  if(filter!=='all'&&(filter==='pending'?status==='verified'||status==='false':status!==filter))return false;
  const text=normalize([item.title,item.originalTitle,item.summary,item.sourceName,item.sourceUrl,item.date].filter(Boolean).join(' '));
  return terms.every(term=>text.includes(term));
 }).sort((a,b)=>{
  if(sort==='title')return String(a.title||'').localeCompare(String(b.title||''),'hy');
  const left=timestamp(a),right=timestamp(b);
  if(left===null)return right===null?0:1;
  if(right===null)return -1;
  return sort==='oldest'?left-right:right-left;
 });
}
