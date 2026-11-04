export const eventElementTypes=['featured_events','all_events'] as const;
export type EventElementType=typeof eventElementTypes[number];
export const eventElementLabels:Record<EventElementType,string>={featured_events:'Featured Events',all_events:'All Events'};
export function isEventElement(type:string):type is EventElementType{return (eventElementTypes as readonly string[]).includes(type);}
export function rowHasEventElement(row:{columns:{elements:{type:string}[]}[]}){return row.columns.some(column=>column.elements.some(element=>isEventElement(element.type)));}
export function isEventLayoutElement<T extends{type:string}>(element:T):element is Extract<T,{type:EventElementType}>{return isEventElement(element.type);}
