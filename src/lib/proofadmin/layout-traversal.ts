import type {Content,LayoutElement,SectionLayout} from './contract';

export type LayoutEntry={layout:SectionLayout;path:string[]};
export type ElementEntry={element:LayoutElement;path:string[]};
/** Exactly one answer level; paths identify collection members by stable ID. */
export function walkLayouts(layout:SectionLayout):LayoutEntry[]{
 const result:LayoutEntry[]=[{layout,path:[]}];
 for(const row of layout.rows)for(const column of row.columns)for(const element of column.elements)if(element.type==='accordion')for(const item of element.items)if(item.grid)result.push({layout:item.grid,path:['rows',row.id,'columns',column.id,'elements',element.id,'items',item.id,'grid']});
 return result;
}
function elements(entries:LayoutEntry[]):ElementEntry[]{return entries.flatMap(({layout,path})=>layout.rows.flatMap(row=>row.columns.flatMap(column=>column.elements.map(element=>({element,path:[...path,'rows',row.id,'columns',column.id,'elements',element.id]})))));}
export function walkLayoutElements(layout:SectionLayout):LayoutElement[]{return elements(walkLayouts(layout)).map(entry=>entry.element);}
export function contentLayoutEntries(content:Content):LayoutEntry[]{
 const outer:LayoutEntry[]=content.kind==='page'?content.sections.flatMap(section=>section.layout?[{layout:section.layout,path:['sections',section.id,'layout']}]:[]):content.kind==='screen'?content.blocks.flatMap(block=>block.grid?[{layout:block.grid,path:['blocks',block.id,'grid']}]:[]):[];
 return outer.flatMap(entry=>walkLayouts(entry.layout).map(child=>({layout:child.layout,path:[...entry.path,...child.path]})));
}
export function contentElementEntries(content:Content):ElementEntry[]{return elements(contentLayoutEntries(content));}
