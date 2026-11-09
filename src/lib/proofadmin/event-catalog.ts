import {z} from 'zod';
import {feedSchema} from './feeds';
import {eventReferenceSchema,eventKey,type EventReference} from './event-reference';
import {eventTagFilterSchema} from './event-tag-filter';
export const eventOrderSchema=z.enum(['soonest','latest']);
export const eventFeedSchema=feedSchema.options[0].refine(event=>!event.endsAt||Date.parse(event.endsAt)>=Date.parse(event.startsAt),'End must be on or after the start.');
export const publicEventSchema=z.object({id:z.string().max(300),reference:eventReferenceSchema,content:eventFeedSchema,featured:z.boolean()}).strict();
export type PublicEvent=z.infer<typeof publicEventSchema>;
const queryTagFilter=z.preprocess(value=>{
 if(typeof value!=='string')return value;
 if(value.length>6000)return null;
 try{return JSON.parse(value);}catch{return null;}
},eventTagFilterSchema);
export const eventQuerySchema=z.object({kind:z.enum(['featured','all']).default('all'),limit:z.coerce.number().int().min(1).max(24).optional(),page:z.coerce.number().int().min(1).max(10000).default(1),order:eventOrderSchema.default('soonest'),tagFilter:queryTagFilter.optional()}).strict().transform(q=>({...q,limit:q.limit??(q.kind==='featured'?3:9)})).superRefine((q,ctx)=>{if(q.kind==='featured'&&(q.limit>12||q.page!==1))ctx.addIssue({code:'custom',message:'Featured events use one page of at most 12 events.'});});
export type EventQuery=z.infer<typeof eventQuerySchema>;
export const eventPageSchema=z.object({items:z.array(publicEventSchema).max(24),page:z.number().int().min(1).max(10000),pages:z.number().int().min(1).max(10000),total:z.number().int().min(0).max(10000),hasNext:z.boolean()}).strict();
const dateFormatters=new Map<string,Intl.DateTimeFormat>();
function dateKey(time:number,timezone:string){let formatter=dateFormatters.get(timezone);if(!formatter){formatter=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'});if(dateFormatters.size>=100)dateFormatters.clear();dateFormatters.set(timezone,formatter);}const p=Object.fromEntries(formatter.formatToParts(time).map(part=>[part.type,part.value]));return `${p.year}-${p.month}-${p.day}`;}
/** First instant of the next local date, including DST and skipped midnights. */
export function nextLocalMidnight(start:number,timezone:string){const original=dateKey(start,timezone);let low=Math.floor(start),high=low+48*60*60*1000;while(low+1<high){const middle=Math.floor((low+high)/2);if(dateKey(middle,timezone)>original)high=middle;else low=middle;}return high;}
export function eventIsCurrent(event:{startsAt:string;endsAt:string;allDay:boolean;timezone:string},now=Date.now()){
 const start=Date.parse(event.startsAt);if(!Number.isFinite(start))return false;const end=event.endsAt?Date.parse(event.endsAt):event.allDay?nextLocalMidnight(start,event.timezone):start;
 return Number.isFinite(start)&&Number.isFinite(end)&&end>=start&&(start>now||end>now);
}
export function publishedEventCatalog(rows:{id:string;content:unknown;reference:EventReference}[],featured:ReadonlySet<string>,now=Date.now()):PublicEvent[]{
 const result:PublicEvent[]=[],seen=new Set<string>();
 for(const row of rows){const parsed=eventFeedSchema.safeParse(row.content);if(!parsed.success||!eventIsCurrent(parsed.data,now))continue;const key=eventKey(row.reference);if(seen.has(key))continue;seen.add(key);result.push({id:key,reference:row.reference,content:parsed.data,featured:featured.has(key)});}
 return result;
}
export function queryEventCatalog(catalog:PublicEvent[],q:EventQuery){
 const direction=q.order==='soonest'?1:-1;
 const all=catalog.filter(event=>(q.kind==='all'||event.featured)&&(!q.tagFilter||(event.reference.provider==='planningcenter'&&event.reference.organizationId===q.tagFilter.organizationId&&event.content.tagIds?.some(id=>q.tagFilter!.tagIds.includes(id))))).sort((a,b)=>direction*(Date.parse(a.content.startsAt)-Date.parse(b.content.startsAt))||a.id.localeCompare(b.id));
 const offset=(q.page-1)*q.limit;
 return {items:all.slice(offset,offset+q.limit),page:q.page,pages:q.kind==='featured'?1:Math.max(1,Math.ceil(all.length/q.limit)),total:all.length,hasNext:q.kind==='all'&&all.length>offset+q.limit};
}
