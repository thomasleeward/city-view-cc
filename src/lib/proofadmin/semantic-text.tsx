import type {CSSProperties} from 'react';
import {RichInline} from './rich-text';
import {semanticTextValue,semanticTextAlignment,textStyleClass,isNativeTextStyle} from './text-styles';
import type {LayoutElement} from './contract';
import './semantic-text.css';
/** Native metrics are a presentation choice; the stored rich text is never rewritten. */
export function SemanticText({element}:{element:Extract<LayoutElement,{type:'text'}>}){
 const style=element.textStyle;
 if(!isNativeTextStyle(style))return <div className="proof-layout-text" data-proof-mobile-text-size={element.mobileFontSize!==undefined?true:undefined} style={element.mobileFontSize!==undefined?{'--proof-mobile-font-size':`${element.mobileFontSize}px`} as CSSProperties:undefined}><RichInline text={element.text}/></div>;
 const Tag=style==='heading'?'h2':style==='hero_heading'?'h1':'p';
 return <div className={textStyleClass(style)}><Tag className={style==='eyebrow'?'proof-layout-text eyebrow':'proof-layout-text'} data-proof-text-style={style} style={{textAlign:semanticTextAlignment(element.text)}}><RichInline inlineParagraphs text={semanticTextValue(element.text,style)}/></Tag></div>;
}
