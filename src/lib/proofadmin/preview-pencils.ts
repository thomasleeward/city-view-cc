// Only mounted by authenticated draft preview shells. Public renderers never call this.
type Document = {id:string;content:{kind:string;sections?:{id:string;anchor?:string;name:string;hidden?:boolean;layout?:{rows:{id:string;columns:{id:string;elements:{id:string}[]}[]}[]}}[];blocks?:{id:string;caption?:string;type:string}[];cards?:{id:string;title:string}[]}};
function labelText(value:string) {
 if(!value.startsWith('richtext:v1:'))return value;
 try { const text=(node:{text?:string;content?:unknown[]}):string=>node.text??(node.content??[]).map(child=>text(child as {text?:string;content?:unknown[]})).join(' ');return text(JSON.parse(value.slice(12))); } catch {return 'item';}
}
export function mountPreviewPencils(current:Document, related:Document[], select:(selected:string,documentId:string)=>void, insert?:(request:Record<string,unknown>)=>void) {
 const layer=document.createElement('div');
 layer.dataset.previewPencils='true';
 Object.assign(layer.style,{position:'fixed',inset:'0',pointerEvents:'none',zIndex:'2147483000'});
 document.body.append(layer);
 let frame=0;
 const editingStyle=document.createElement("style");editingStyle.textContent="body{padding-bottom:24px}[data-proof-column]:empty{min-height:96px}[data-proof-element]{min-height:30px;margin-bottom:18px}";document.head.append(editingStyle);
 const entries=[current,...related.filter(d=>d.content.kind==='card_group')].flatMap(d=>{
  const c=d.content;
  return (c.kind==='page'?c.sections??[]:c.kind==='screen'?c.blocks??[]:c.cards??[]).map(item=>({id:item.id,documentId:d.id,label:'name' in item?item.name:'title' in item?item.title:'caption' in item?item.caption||item.type:'Item',anchor:'anchor' in item?item.anchor:undefined}));
 });
 const controls=entries.map(item=>{
  const button=document.createElement('button');button.type='button';button.textContent='✎';
  button.setAttribute('aria-label',`Edit ${labelText(item.label)}`);button.title=`Edit ${labelText(item.label)}`;
  Object.assign(button.style,{position:'absolute',pointerEvents:'auto',width:'34px',height:'34px',border:'1px solid #d5ddeb',borderRadius:'50%',background:'#fff',color:'#174b79',boxShadow:'0 2px 8px #0003',fontSize:'23px',lineHeight:'1',cursor:'pointer',display:'none'});
  button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();select(item.id,item.documentId);});
  layer.append(button);return {item,button};
 });
 const insertControls:{button:HTMLButtonElement;bounds:()=>DOMRect|undefined;center?:boolean}[]=[];
 let menu:HTMLDivElement|null=null;
 const closeMenu=()=>{menu?.remove();menu=null;};
 const iconPaths:Record<string,string>={text:'<text x="7" y="20" font-size="22" font-family="Arial">T</text>',image:'<rect x="3" y="3" width="22" height="22" rx="3"/><circle cx="10" cy="10" r="2"/><path d="m4 22 8-8 6 6 4-4 3 4"/>',button:'<rect x="2" y="7" width="24" height="14" rx="4"/><path d="M8 14h12"/>',video:'<rect x="2" y="5" width="24" height="18" rx="3"/><path d="m11 10 7 4-7 4Z"/>',card_group:'<rect x="2" y="5" width="10" height="18" rx="2"/><rect x="16" y="5" width="10" height="18" rx="2"/>'};
 const targetFor=(id:string,anchor?:string)=>document.querySelector<HTMLElement>(`[data-proof-section="${CSS.escape(id)}"],[data-proof-item="${CSS.escape(id)}"]`)||document.getElementById(anchor??id)||document.getElementById(`proof-item-${id}`);
 const plus=(label:string,bounds:()=>DOMRect|undefined,activate:(button:HTMLButtonElement)=>void,center=false)=>{
  const button=document.createElement('button');button.type='button';button.textContent='+';button.title=label;button.setAttribute('aria-label',label);
  Object.assign(button.style,{position:'absolute',pointerEvents:'auto',width:'30px',height:'30px',border:'1px solid #bacde4',borderRadius:'50%',background:'#fff',color:'#174b79',fontSize:'24px',lineHeight:'1',boxShadow:'0 2px 6px #0002',cursor:'pointer'});
  button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();activate(button);});layer.append(button);insertControls.push({button,bounds,center});
 };
 const showElements=(button:HTMLButtonElement,request:Record<string,unknown>)=>{
  closeMenu();menu=document.createElement('div');menu.setAttribute('role','toolbar');menu.setAttribute('aria-label','Add element');
  const b=button.getBoundingClientRect();Object.assign(menu.style,{position:'absolute',pointerEvents:'auto',display:'flex',gap:'4px',padding:'8px',borderRadius:'10px',background:'#fff',border:'1px solid #d2ddeb',boxShadow:'0 6px 24px #0003',left:`${Math.max(8,Math.min(innerWidth-244,b.left-90))}px`,top:`${Math.min(innerHeight-66,Math.max(8,b.top+34))}px`});
  for(const type of ['text','image','button','video','card_group']){const option=document.createElement('button');option.type='button';const label=type==='card_group'?'Card section':type[0].toUpperCase()+type.slice(1);option.title=label;option.setAttribute('aria-label',`Add ${label.toLowerCase()}`);option.innerHTML=`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${iconPaths[type]}</svg>`;Object.assign(option.style,{border:'0',background:'#edf3fa',color:'#174b79',borderRadius:'6px',padding:'6px',cursor:'pointer'});option.addEventListener('click',()=>{insert?.({...request,elementType:type});closeMenu();});menu.append(option);}
  layer.append(menu);menu.querySelector('button')?.focus();
 };
 if(insert&&current.content.kind==='page')for(const section of (current.content.sections??[]).filter(s=>!s.hidden)){
  if((current.content.sections?.length??0)<40)plus(`Add section after ${labelText(section.name)}`,()=>targetFor(section.id,section.anchor)?.getBoundingClientRect(),()=>insert({kind:'section',afterId:section.id}));
  for(const row of section.layout?.rows??[])for(const column of row.columns){
   if(column.elements.length>=20)continue;
   if(!column.elements.length)plus('Add element to empty column',()=>targetFor(section.id,section.anchor)?.querySelector<HTMLElement>(`[data-proof-column="${CSS.escape(column.id)}"]`)?.getBoundingClientRect(),button=>showElements(button,{kind:'element',sectionId:section.id,rowId:row.id,columnId:column.id,afterId:null}),true);
   for(const element of column.elements)plus('Add element below',()=>targetFor(section.id,section.anchor)?.querySelector<HTMLElement>(`[data-proof-element="${CSS.escape(element.id)}"]`)?.getBoundingClientRect(),button=>showElements(button,{kind:'element',sectionId:section.id,rowId:row.id,columnId:column.id,afterId:element.id}));
  }
 }
 const dismiss=(event:Event)=>{if(menu&&!layer.contains(event.target as Node))closeMenu();};
 const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')closeMenu();};
 document.addEventListener('pointerdown',dismiss);document.addEventListener('keydown',escape);

 const draw=()=>{frame=0;for(const control of insertControls){const b=control.bounds();const y=b?(control.center?(b.top+b.bottom)/2:b.bottom):0;const visible=b&&b.width>0&&y>=0&&y<innerHeight;control.button.style.display=visible?"block":"none";if(visible&&b){control.button.style.top=`${Math.max(0,y-15)}px`;control.button.style.left=`${Math.max(4,Math.min(innerWidth-34,(b.left+b.right)/2-15))}px`;}}for(const {item,button} of controls){
  const target=document.getElementById(`proof-item-${item.id}`)||document.querySelector<HTMLElement>(`[data-proof-item="${CSS.escape(item.id)}"],[data-proof-section="${CSS.escape(item.id)}"]`)||document.getElementById(item.anchor??item.id);
  let bounds=target?.getBoundingClientRect();
  if(target&&(!bounds?.width||!bounds.height))bounds=target.firstElementChild?.getBoundingClientRect();
  const visible=bounds&&bounds.width>0&&bounds.height>0&&bounds.bottom>0&&bounds.top<innerHeight&&bounds.right>0&&bounds.left<innerWidth;
  button.style.display=visible?'block':'none';
  if(visible&&bounds){button.style.top=`${Math.max(6,bounds.top+10)}px`;button.style.left=`${Math.min(innerWidth-40,Math.max(4,bounds.right-44))}px`;}
 }};
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(draw);};
 const observer=new MutationObserver(changes=>{if(changes.some(change=>!layer.contains(change.target)))schedule();});
 observer.observe(document.body,{childList:true,subtree:true,attributes:true,characterData:true});
 window.addEventListener('scroll',schedule,true);window.addEventListener('resize',schedule);
 const resize=new ResizeObserver(schedule);resize.observe(document.body);
 schedule();
 return ()=>{editingStyle.remove();closeMenu();document.removeEventListener("pointerdown",dismiss);document.removeEventListener("keydown",escape);observer.disconnect();resize.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule,true);window.removeEventListener('resize',schedule);layer.remove();};
}
