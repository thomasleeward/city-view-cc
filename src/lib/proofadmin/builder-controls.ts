import type {Content,SectionLayout} from './contract';
export const columnWidthLabels={'50-50':'50 / 50','40-60':'40 / 60','60-40':'60 / 40','33-67':'33 / 67','67-33':'67 / 33'} as const;
export function rowPresentation(row:SectionLayout['rows'][number]){
 const ratio=row.columns.length===2&&row.columnWidths?row.columnWidths.split('-').map(Number):undefined;
 return {'--proof-column-widths':ratio?ratio.map(value=>`minmax(0,${value}fr)`).join(' '):undefined};
}
export function columnPresentation(row:SectionLayout['rows'][number]){
 return row.verticalAlign?{justifyContent:row.verticalAlign==='top'?'flex-start':row.verticalAlign==='bottom'?'flex-end':'center',paddingBlock:0}:{};
}
export const builderControlFlags=['rowColumnWidths','rowVerticalAlignment','mobileTextSize','buttonAppearance','mapPresentation'] as const;
export type BuilderControlFlag=typeof builderControlFlags[number];
/** Stable collection IDs preserve unrelated fields without accepting staged creates. */
export function builderControlValues(content:Content){
 const result=Object.fromEntries(builderControlFlags.map(flag=>[flag,{}])) as Record<BuilderControlFlag,Record<string,unknown>>;
 const walk=(value:unknown,path:(string|number)[])=>{
  if(Array.isArray(value)){value.forEach((child,index)=>walk(child,[...path,child&&typeof child==='object'&&'id' in child?String(child.id):index]));return;}
  if(!value||typeof value!=='object')return;
  const node=value as Record<string,unknown>,key=JSON.stringify(path);
  if(Array.isArray(node.columns)){
   if(node.columnWidths!==undefined)result.rowColumnWidths[key]=node.columnWidths;
   if(node.verticalAlign!==undefined)result.rowVerticalAlignment[key]=node.verticalAlign;
  }
  if(node.type==='text'&&node.mobileFontSize!==undefined)result.mobileTextSize[key]=node.mobileFontSize;
  if((node.kind==='url'||node.kind==='screen')&&typeof node.label==='string'&&typeof node.value==='string'&&node.appearance&&typeof node.appearance==='object')for(const [leaf,entry] of Object.entries(node.appearance))if(entry!==undefined)result.buttonAppearance[JSON.stringify([...path,'appearance',leaf])]=entry;
  if(node.type==='map')for(const leaf of ['showAddress','directionsStyle'])if(node[leaf]!==undefined)result.mapPresentation[JSON.stringify([...path,leaf])]=node[leaf];
  for(const [property,child] of Object.entries(node))walk(child,[...path,property]);
 };
 walk(content,[]);return result;
}
