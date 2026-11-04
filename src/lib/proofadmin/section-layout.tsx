import {EventCollection} from './event-collection';
import {isEventLayoutElement} from './event-elements';
import {layoutButtonColors,hasButtonAppearance} from './button-colors';
import {rowPresentation,columnPresentation} from './builder-controls';
import {SemanticText} from './semantic-text';
import {layoutPadding} from './screen-presentation';
import {MapElement} from './map-element';
import {Accordion} from './accordion';
import {SermonCollection} from './sermon-collection';
import {isSermonLayoutElement} from './sermon-elements';
import type {CSSProperties} from 'react';
import {RichInline} from './rich-text';
import type {SectionLayout,ContentAction,GroupContent} from './contract';
import './section-layout.css';
type Props={layout:SectionLayout;background:string;color:string;accent?:string;id?:string;order?:number;groups?:Record<string,GroupContent>;onScreen?:(value:string)=>void;href?:(action:ContentAction)=>string};
export function SectionLayoutView({layout,background,color,accent,id,order,groups={},onScreen,href=(action)=>action.kind==='screen'?`/?screen=${encodeURIComponent(action.value)}`:action.value}:Props) {
 const actionLink=(action:ContentAction,surface?:{background:string;text:string})=><a className="proof-layout-button" href={href(action)} style={hasButtonAppearance(action)?layoutButtonColors(action,surface?.background??background,surface?.text??color):{background:action.colors?.background??color,color:action.colors?.text??background}} onClick={onScreen&&action.kind==='screen'?event=>{event.preventDefault();onScreen(action.value);}:undefined}><RichInline links={false} text={action.label}/></a>;
 return <section id={id} data-proof-layout data-proof-padding-axes={layout.paddingX!==undefined||layout.paddingY!==undefined?true:undefined} style={{background,color,order,...layoutPadding(layout),'--proof-section-accent':accent??color} as CSSProperties}><div className="proof-layout" style={{maxWidth:layout.fullWidth?'none':1200,gap:layout.gap}}>
  {layout.rows.map(row=><div className="proof-layout-row" data-proof-row={row.id} key={row.id} style={{'--proof-columns':row.columns.length,...rowPresentation(row),gap:layout.gap} as CSSProperties}>
   {row.columns.map(column=><div key={column.id} data-proof-column={column.id} className={`proof-layout-column ${column.elements.some(e=>e.type==='image'&&e.fill&&e.image)?'proof-layout-image-column':''}`} style={{gap:layout.gap,...columnPresentation(row)}}>
    {column.elements.map(element=><div className={`proof-layout-element ${element.type==='image'&&element.fill&&element.image?'proof-layout-fill-element':''}`} data-proof-element={element.id} key={element.id} style={element.type==='button'?{textAlign:element.alignment??'left'}:undefined}>
     {isEventLayoutElement(element)?<EventCollection element={element} site="city-view" viewAll={element.type==='featured_events'&&element.viewAllAction?actionLink(element.viewAllAction):undefined}/>:element.type==='map'?<MapElement element={element} background={background} color={color} directionsClassName="inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-md px-5 py-3 text-center text-sm font-bold uppercase leading-tight tracking-wide whitespace-normal transition"/>: element.type==='accordion'?<Accordion element={element}/>:isSermonLayoutElement(element)?<SermonCollection mode={element.type} site="city-view"/>:element.type==='text'?(element.textStyle&&element.textStyle!=='body'||element.mobileFontSize!==undefined)?<SemanticText element={element}/>:<div className="proof-layout-text"><RichInline text={element.text}/></div>:element.type==='image'?element.image?<figure className={element.fill?'proof-layout-image-fill':'proof-layout-image'}>{element.image?<img src={element.image} alt={element.alt} style={{objectPosition:`${element.focalX}% ${element.focalY}%`}}/>:null}</figure>:null:element.type==='video'?element.source?<video className="proof-layout-video" src={element.source} controls playsInline preload="metadata" aria-label={element.label||'Video'}/>:null:element.type==='card_group'?<div className="proof-layout-cards">{groups[element.groupId]?.cards.filter(card=>!card.hidden).map(card=><article key={card.id} id={`proof-item-${card.id}`} data-proof-item={card.id} className="proof-layout-card" style={{background:card.appearance.background,color:card.appearance.text}}>{card.image&&<img src={card.image} alt={card.imageAlt}/>}<div><h3><RichInline text={card.title}/></h3><div className="proof-layout-text"><RichInline text={card.description}/></div>{card.action.value&&actionLink(card.action,hasButtonAppearance(card.action)?card.appearance:undefined)}</div></article>)}</div>:actionLink(element.action)}
    </div>)}
   </div>)}
  </div>)}
 </div></section>;
}
