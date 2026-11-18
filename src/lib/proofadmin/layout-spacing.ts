/** Portable renderer contract. No React, schema runtime or client dependencies. */
export type RowSpacing={above?:number;below?:number;gap?:number;inset?:number;mobile?:{above?:number;below?:number;gap?:number;inset?:number}};
export type ColumnPadding={top?:number;right?:number;bottom?:number;left?:number;mobile?:{top?:number;right?:number;bottom?:number;left?:number};alignToSectionEdge?:boolean;mobileAlignToSectionEdge?:boolean};
export const spacingPresets=[0,8,16,24,40,64] as const;
export function mobileSpacing(value:number){return value===40?24:value===64?40:value;}
type Presentation={style:Record<string,string>;attributes:Record<string,string>};
const rowProperties={above:'margin-top',below:'margin-bottom',gap:'gap',inset:'padding-inline'} as const;
const columnProperties={top:'padding-top',right:'padding-right',bottom:'padding-bottom',left:'padding-left'} as const;
function numericPresentation(values:RowSpacing|ColumnPadding|undefined,kind:'row'|'column',properties:Record<string,string>):Presentation{
 const style:Record<string,string>={},attributes:Record<string,string>={};
 if(!values)return {style,attributes};
 const desktop=values as Record<string,unknown>,mobile=values.mobile as Record<string,number|undefined>|undefined;
 for(const key of Object.keys(properties)){
  const value=desktop[key];
  if(typeof value==='number'){attributes[`data-proof-${kind}-${key}`]='';style[`--proof-${kind}-${key}`]=`${value}px`;}
  const phone=mobile?.[key]??(typeof value==='number'?mobileSpacing(value):undefined);
  if(phone!==undefined){attributes[`data-proof-${kind}-mobile-${key}`]='';style[`--proof-${kind}-mobile-${key}`]=`${phone}px`;}
 }
 return {style,attributes};
}
export function rowSpacing(row:{spacing?:RowSpacing},_sectionGap:number):Presentation{return numericPresentation(row.spacing,'row',rowProperties);}
export function columnSpacing(column:{padding?:ColumnPadding},index:number,columnCount:number):Presentation{
 const result=numericPresentation(column.padding,'column',columnProperties),padding=column.padding;
 if(padding?.alignToSectionEdge){if(index===0)result.attributes['data-proof-column-edge-left']='';if(index===columnCount-1)result.attributes['data-proof-column-edge-right']='';}
 if(padding?.mobileAlignToSectionEdge??padding?.alignToSectionEdge)result.attributes['data-proof-column-mobile-edge']='';
 return result;
}
const rules=(device:'desktop'|'mobile')=>Object.entries({row:rowProperties,column:columnProperties}).flatMap(([kind,properties])=>Object.entries(properties).map(([key,property])=>{
 const token=`${kind}-${device==='mobile'?'mobile-':''}${key}`;
 return `[data-proof-${kind}][class][data-proof-${token}]{${property}:var(--proof-${token})!important}`;
})).join('\n');
export const layoutSpacingCss=`${rules('desktop')}
@media(min-width:768px){[data-proof-column][class][data-proof-column-edge-left]{padding-left:0!important}[data-proof-column][class][data-proof-column-edge-right]{padding-right:0!important}}
@media(max-width:767px){${rules('mobile')}
[data-proof-column][class][data-proof-column-mobile-edge]{padding-left:0!important;padding-right:0!important}}
`;
