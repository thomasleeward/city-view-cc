// Only mounted by authenticated draft preview shells. Public renderers never call this.
type Document = {id:string;content:{kind:string;sections?:{id:string;anchor?:string;name:string;hidden?:boolean}[];blocks?:{id:string;caption?:string;type:string}[];cards?:{id:string;title:string}[]}};
function labelText(value:string) {
 if(!value.startsWith('richtext:v1:'))return value;
 try { const text=(node:{text?:string;content?:unknown[]}):string=>node.text??(node.content??[]).map(child=>text(child as {text?:string;content?:unknown[]})).join(' ');return text(JSON.parse(value.slice(12))); } catch {return 'item';}
}
export function mountPreviewPencils(current:Document, related:Document[], select:(selected:string,documentId:string)=>void) {
 const layer=document.createElement('div');
 layer.dataset.previewPencils='true';
 Object.assign(layer.style,{position:'fixed',inset:'0',pointerEvents:'none',zIndex:'2147483000'});
 document.body.append(layer);
 let frame=0;
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
 const draw=()=>{frame=0;for(const {item,button} of controls){
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
 return ()=>{observer.disconnect();resize.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule,true);window.removeEventListener('resize',schedule);layer.remove();};
}
