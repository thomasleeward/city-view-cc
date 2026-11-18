/** Transient private-preview messages: never persisted with content. */
export type SpacingRegion='padding'|'above'|'below'|'gap'|'inset';
export type SpacingProbe={rowId:string;columnId?:string;region:SpacingRegion};
export type SpacingMetrics={padding:{top:number;right:number;bottom:number;left:number};above:number;below:number;gap:number};
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const number=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=10000;
export function parseSpacingProbe(value:unknown):SpacingProbe|null{
 if(!object(value)||Object.keys(value).some(key=>!['rowId','columnId','region'].includes(key))||typeof value.rowId!=='string'||!value.rowId||value.rowId.length>100||value.columnId!==undefined&&(typeof value.columnId!=='string'||!value.columnId||value.columnId.length>100)||!['padding','above','below','gap','inset'].includes(String(value.region)))return null;
 return {rowId:value.rowId,...(value.columnId?{columnId:String(value.columnId)}:{}),region:value.region as SpacingRegion};
}
export function parseSpacingMetrics(value:unknown):SpacingMetrics|null{
 if(!object(value)||!object(value.padding)||!['top','right','bottom','left'].every(side=>number((value.padding as Record<string,unknown>)[side]))||!['above','below','gap'].every(key=>number(value[key])))return null;
 return {padding:{top:value.padding.top as number,right:value.padding.right as number,bottom:value.padding.bottom as number,left:value.padding.left as number},above:value.above as number,below:value.below as number,gap:value.gap as number};
}
