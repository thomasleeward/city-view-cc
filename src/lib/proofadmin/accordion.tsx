'use client';
import {useId} from 'react';
import {RichInline} from './rich-text';
import type {LayoutElement} from './contract';
import './accordion.css';

/** Native disclosure semantics; client styles can override the scoped hooks and variables. */
export function Accordion({element}:{element:Extract<LayoutElement,{type:'accordion'}>}) {
 const group=useId();
 return <div className="proof-accordion" data-proof-accordion={element.id}>
  {element.items.map((item,index)=><details key={item.id} className="proof-accordion-item" data-proof-accordion-item={item.id} name={element.allowMultiple?undefined:`proof-accordion-${group}`} open={element.openFirst&&index===0||undefined}>
   <summary className="proof-accordion-summary" data-proof-accordion-controls><span>{item.title}</span><span className="proof-accordion-icon" aria-hidden="true"/></summary>
   <div className="proof-accordion-body"><RichInline text={item.body}/></div>
  </details>)}
 </div>;
}
