import React,{useEffect,useRef,useState} from 'react';
import './telegram-editor.css';

const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const tags={STRONG:'b',B:'b',EM:'i',I:'i',U:'u',S:'s',STRIKE:'s',DEL:'s',CODE:'code',PRE:'pre',BLOCKQUOTE:'blockquote','TG-SPOILER':'tg-spoiler'};
// Only Telegram-supported markup leaves the editor, including pasted/AI content.
export function telegramHtml(html){
 const root=document.createElement('div');root.innerHTML=html;
 const walk=node=>{
  if(node.nodeType===3)return escape(node.textContent);
  if(node.nodeType!==1)return '';
  const name=node.tagName;
  if(['SCRIPT','STYLE','IFRAME','OBJECT','SVG','IMG'].includes(name))return '';
  if(name==='BR')return '\n';
  const body=Array.from(node.childNodes,walk).join('');
  if(name==='A'){
   const href=node.getAttribute('href')||'';
   return /^https?:\/\//i.test(href)?'<a href="'+escape(href)+'">'+body+'</a>':body;
  }
  const tag=tags[name];
  if(tag)return '<'+tag+'>'+body+'</'+tag+'>';
  if(['DIV','P','LI'].includes(name)){
   const prev=node.previousSibling;
   const separated=prev&&(prev.nodeType===1&&['DIV','P','LI','BR'].includes(prev.tagName)||prev.nodeType===3&&prev.textContent.endsWith('\n'));
   return (prev&&!separated?'\n':'')+body+'\n';
  }
  return body;
 };
 return Array.from(root.childNodes,walk).join('').replace(/\n+$/,'');
}

export default function TelegramEditor({value,onChange,disabled,onDraft}){
 const ref=useRef(null),selection=useRef(null),last=useRef(null);
 const [emoji,setEmoji]=useState(false);
 useEffect(()=>{
  if(value!==last.current&&ref.current){const clean=telegramHtml(value||'');ref.current.innerHTML=clean;last.current=value;}
 },[value]);
 const remember=()=>{const s=window.getSelection();if(s?.rangeCount&&ref.current.contains(s.anchorNode)&&ref.current.contains(s.focusNode))selection.current=s.getRangeAt(0).cloneRange();};
 const restore=()=>{ref.current.focus();const s=window.getSelection();if(selection.current&&ref.current.contains(selection.current.commonAncestorContainer)){s.removeAllRanges();s.addRange(selection.current);}};
 const changed=()=>{const html=telegramHtml(ref.current.innerHTML);last.current=html;onChange(html);remember();};
 const command=(kind)=>{
  restore();
  if(kind==='link'){
   const url=window.prompt('Հղումը (https://...)');if(!url)return;
   if(!/^https?:\/\//i.test(url)){window.alert('Մուտքագրիր http:// կամ https:// հղում');return;}
   document.execCommand('createLink',false,url);
  }else if(['code','pre','spoiler'].includes(kind)){
   const s=window.getSelection();if(!s.rangeCount||s.isCollapsed)return;
   const range=s.getRangeAt(0),el=document.createElement(kind==='spoiler'?'tg-spoiler':kind);
   el.appendChild(range.extractContents());range.insertNode(el);range.selectNodeContents(el);s.removeAllRanges();s.addRange(range);
  }else if(kind==='quote')document.execCommand('formatBlock',false,'blockquote');
  else document.execCommand(kind,false,null);
  changed();
 };
 const insert=text=>{restore();document.execCommand('insertText',false,text);changed();};
 const controls=[['bold','Թավ','B'],['italic','Շեղ','𝘐'],['underline','Ընդգծել','U'],['strikeThrough','Ջնջագիծ','S̶'],['spoiler','Թաքցնել','Թաքցնել'],['code','Կոդ','Կոդ'],['pre','Կոդի բլոկ','Բլոկ'],['quote','Մեջբերում','❝'],['link','Հղում','🔗'],['unlink','Հեռացնել հղումը','Հանել հղումը'],['removeFormat','Մաքրել ձևավորումը','Մաքրել'],['undo','Հետ','↶'],['redo','Առաջ','↷']];
 return <div className="tg-composer">
  <p>Նշիր տեքստը և ընտրիր ձևավորումը։ Այստեղ տեսնում ես պատրաստի տեսքը։</p>
  <div className="admin-tg-toolbar" role="toolbar" aria-label="Telegram տեքստի ձևավորում">
   {controls.map(([kind,title,label])=><button type="button" key={kind} title={title} aria-label={title} disabled={disabled} onMouseDown={e=>{e.preventDefault();remember();}} onClick={()=>command(kind)}>{label}</button>)}
   <button type="button" disabled={disabled} aria-expanded={emoji} onMouseDown={e=>{e.preventDefault();remember();}} onClick={()=>setEmoji(!emoji)}>🙂 Էմոջի</button>
   <button type="button" disabled={disabled} onMouseDown={e=>{e.preventDefault();remember();}} onClick={onDraft}>✨ ԱԲ սևագիր</button>
  </div>
  {emoji&&<div className="admin-tg-emoji">{['🌿','⛰️','💧','📢','⚠️','📍','🔎','✅','❌','💚','🌍','✊','📅','🔗'].map(e=><button type="button" key={e} disabled={disabled} onMouseDown={event=>event.preventDefault()} onClick={()=>insert(e)}>{e}</button>)}</div>}
  <div ref={ref} className="tg-editor" role="textbox" aria-label="Telegram գրառման տեքստ" aria-multiline="true" contentEditable={!disabled} suppressContentEditableWarning onInput={changed} onMouseUp={remember} onKeyUp={remember} onBlur={remember} onPaste={e=>{e.preventDefault();insert(e.clipboardData.getData('text/plain'));}} onDrop={e=>e.preventDefault()}/>
 </div>;
}
