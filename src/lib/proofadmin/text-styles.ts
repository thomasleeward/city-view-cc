import type {LayoutElement} from './contract';
import {richEditorDocument,richEditorValue,type RichDocumentNode} from './rich-text';
export type TextStyle=NonNullable<Extract<LayoutElement,{type:'text'}>['textStyle']>;
export const textStyleLabels={body:'Body',eyebrow:'Eyebrow',heading:'Heading',hero_heading:'Hero heading'} as const;
export const isNativeTextStyle=(style:TextStyle|undefined)=>Boolean(style&&style!=='body');
export const isHeadingTextStyle=(style:TextStyle|undefined)=>style==='heading'||style==='hero_heading';
export function textStyleClass(style:TextStyle|undefined){return isNativeTextStyle(style)?`cms-layout-text-${style==='hero_heading'?'hero-heading':style}`:'';}
/** Render-only native presets: source formatting returns unchanged when Body is selected. */
export function semanticTextValue(text:string,style:TextStyle|undefined){
 if(!isNativeTextStyle(style))return text;
 const document=structuredClone(richEditorDocument(text));
 const clean=(node:RichDocumentNode,italic=false):RichDocumentNode=>{
  const emphasized=italic||Boolean(node.marks?.some(mark=>mark.type==='italic'));
  const marks=node.marks?.flatMap(mark=>{
   if(mark.type!=='textStyle')return [mark];
   const attrs={...mark.attrs};delete attrs.fontSize;delete attrs.fontFamily;
   if(emphasized&&isHeadingTextStyle(style))delete attrs.color;
   return Object.keys(attrs).length?[{type:'textStyle',attrs}]:[];
  });
  return {...node,...(marks?{marks}:{}),...(node.content?{content:node.content.map(child=>clean(child,emphasized))}:{})};
 };
 const nodes=(document.content??[]).map(node=>clean(node));
 // A native heading is one text block; old paragraph boundaries become line
 // breaks, retaining hardBreak nodes and all source data outside this view.
 const content=nodes.flatMap((node,index)=>[...(index?[{type:'hardBreak'}]:[]),...(node.type==='paragraph'?node.content??[]:[node])]);
 return richEditorValue({type:'doc',content:[{type:'paragraph',...(nodes[0]?.attrs?{attrs:nodes[0].attrs}:{}),content}]});
}
export function semanticTextAlignment(text:string):'left'|'center'|'right'|'justify'|undefined{
 const value=richEditorDocument(text).content?.find(node=>node.type==='paragraph')?.attrs?.textAlign;
 return value==='left'||value==='center'||value==='right'||value==='justify'?value:undefined;
}
