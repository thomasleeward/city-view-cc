import type {CSSProperties} from 'react';
import {RichInline} from './rich-text';
import type {SectionLayout,ContentAction} from './contract';
import './section-layout.css';
type Props={layout:SectionLayout; background:string; color:string; id?:string; order?:number; onScreen?:(value:string)=>void; href?:(action:ContentAction)=>string};
export function SectionLayoutView({layout,background,color,id,order,onScreen,href=(action)=>action.kind==='screen'?`/?screen=${encodeURIComponent(action.value)}`:action.value}:Props) {
  return <section id={id} data-proof-layout style={{background,color,order,padding:layout.padding}}><div className="proof-layout" style={{maxWidth:layout.fullWidth?'none':1200,gap:layout.gap}}>
    {layout.rows.map(row=><div className="proof-layout-row" key={row.id} style={{'--proof-columns':row.columns.length,gap:layout.gap} as CSSProperties}>
      {row.columns.map(column=><div key={column.id} className={`proof-layout-column ${column.elements.some(e=>e.type==='image'&&e.fill)?'proof-layout-image-column':''}`} style={{gap:layout.gap}}>
        {column.elements.map(element=>element.type==='text'?<div className="proof-layout-text" key={element.id}><RichInline text={element.text}/></div>:element.type==='image'?<figure key={element.id} className={element.fill?'proof-layout-image-fill':'proof-layout-image'}>{element.image?<img src={element.image} alt={element.alt} style={{objectPosition:`${element.focalX}% ${element.focalY}%`}}/>:null}</figure>:<div key={element.id}><a className="proof-layout-button" href={href(element.action)} style={{background:element.action.colors?.background??color,color:element.action.colors?.text??background}} onClick={onScreen&&element.action.kind==='screen'?event=>{event.preventDefault();onScreen(element.action.value);}:undefined}><RichInline links={false} text={element.action.label}/></a></div>)}
      </div>)}
    </div>)}
  </div></section>;
}
