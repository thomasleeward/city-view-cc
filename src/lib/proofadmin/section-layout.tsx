import type {CSSProperties} from 'react';
import {RichInline} from './rich-text';
import type {SectionLayout,ContentAction,GroupContent} from './contract';
import './section-layout.css';
type Props={layout:SectionLayout;background:string;color:string;id?:string;order?:number;groups?:Record<string,GroupContent>;onScreen?:(value:string)=>void;href?:(action:ContentAction)=>string};
export function SectionLayoutView({layout,background,color,id,order,groups={},onScreen,href=(action)=>action.kind==='screen'?`/?screen=${encodeURIComponent(action.value)}`:action.value}:Props) {
 const actionLink=(action:ContentAction)=><a className="proof-layout-button" href={href(action)} style={{background:action.colors?.background??color,color:action.colors?.text??background}} onClick={onScreen&&action.kind==='screen'?event=>{event.preventDefault();onScreen(action.value);}:undefined}><RichInline links={false} text={action.label}/></a>;
 return <section id={id} data-proof-layout style={{background,color,order,padding:layout.padding}}><div className="proof-layout" style={{maxWidth:layout.fullWidth?'none':1200,gap:layout.gap}}>
  {layout.rows.map(row=><div className="proof-layout-row" data-proof-row={row.id} key={row.id} style={{'--proof-columns':row.columns.length,gap:layout.gap} as CSSProperties}>
   {row.columns.map(column=><div key={column.id} data-proof-column={column.id} className={`proof-layout-column ${column.elements.some(e=>e.type==='image'&&e.fill)?'proof-layout-image-column':''}`} style={{gap:layout.gap}}>
    {column.elements.map(element=><div className={`proof-layout-element ${element.type==='image'&&element.fill?'proof-layout-fill-element':''}`} data-proof-element={element.id} key={element.id}>
     {element.type==='text'?<div className="proof-layout-text"><RichInline text={element.text}/></div>:element.type==='image'?<figure className={element.fill?'proof-layout-image-fill':'proof-layout-image'}>{element.image?<img src={element.image} alt={element.alt} style={{objectPosition:`${element.focalX}% ${element.focalY}%`}}/>:null}</figure>:element.type==='video'?element.source?<video className="proof-layout-video" src={element.source} controls playsInline preload="metadata" aria-label={element.label||'Video'}/>:null:element.type==='card_group'?<div className="proof-layout-cards">{groups[element.groupId]?.cards.filter(card=>!card.hidden).map(card=><article key={card.id} id={`proof-item-${card.id}`} data-proof-item={card.id} className="proof-layout-card" style={{background:card.appearance.background,color:card.appearance.text}}>{card.image&&<img src={card.image} alt={card.imageAlt}/>}<div><h3><RichInline text={card.title}/></h3><div className="proof-layout-text"><RichInline text={card.description}/></div>{card.action.value&&actionLink(card.action)}</div></article>)}</div>:actionLink(element.action)}
    </div>)}
   </div>)}
  </div>)}
 </div></section>;
}
