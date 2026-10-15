export const sermonElementTypes=['recent_sermons','recent_series','all_sermons','all_series'] as const;
export type SermonElementType=typeof sermonElementTypes[number];
export const sermonElementLabels:Record<SermonElementType,string>={recent_sermons:'Most Recent Sermons',recent_series:'Most Recent Series',all_sermons:'All Sermons',all_series:'All Series'};
export function isSermonElement(type:string):type is SermonElementType{return (sermonElementTypes as readonly string[]).includes(type);}
export function rowHasSermonElement(row:{columns:{elements:{type:string}[]}[]}){return row.columns.some(column=>column.elements.some(element=>isSermonElement(element.type)));}
export function isSermonLayoutElement<T extends{type:string}>(element:T):element is Extract<T,{type:SermonElementType}>{return isSermonElement(element.type);}
