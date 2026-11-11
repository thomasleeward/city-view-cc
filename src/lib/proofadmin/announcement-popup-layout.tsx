import type {SectionLayout} from './contract';
import {RichInline} from './rich-text';
import {SemanticText} from './semantic-text';
import {layoutButtonColors} from './button-colors';
export type AnnouncementDestination={id:string;content:{kind:string;slug:string}};
export function AnnouncementPopupLayout({layout,documents=[],background,text,preview=false}:{layout:SectionLayout;documents?:AnnouncementDestination[];background:string;text:string;preview?:boolean}){
 return <div className="proof-announcement-layout" style={{display:'flex',flexDirection:'column',gap:layout.gap,paddingBlock:layout.paddingY??layout.padding,paddingInline:layout.paddingX??layout.padding}}>{layout.rows[0].columns[0].elements.map(element=>{
 if(element.type==='text')return <SemanticText key={element.id} element={element}/>;
 if(element.type==='image')return element.image?<img key={element.id} className={element.fill?'proof-announcement-fill':undefined} src={element.image} alt={element.alt} style={{objectPosition:`${element.focalX}% ${element.focalY}%`}}/>:null;
 if(element.type==='video')return element.source?<video key={element.id} controls playsInline preload="metadata" src={element.source} aria-label={element.label||'Video'}/>:null;
 if(element.type==='button'){
 const target=element.action.kind==='screen'?documents.find(d=>d.id===element.action.value&&d.content.kind==='screen'):undefined;
 const href=element.action.kind==='url'?element.action.value:target?`/?screen=${encodeURIComponent(target.content.slug)}`:undefined;
 const style=layoutButtonColors(element.action,background,text);
 return href||preview?<div key={element.id} style={{textAlign:element.alignment??'left'}}>{preview?<span className="proof-announcement-button" style={style}><RichInline text={element.action.label}/></span>:<a className="proof-announcement-button" style={style} href={href}><RichInline text={element.action.label}/></a>}</div>:null;
 }
 return null;
 })}</div>;
}
