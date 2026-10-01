import {z} from 'zod';
const link=z.string().max(2000).refine(v=>!v||(/^\/(?![\/\\])/.test(v)&&!/[\\\s]/.test(v))||(()=>{try{const u=new URL(v);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}})(),'Use a web address or a local path.');
const image=link.refine(v=>!v||v.startsWith('https://')||v.startsWith('/'),'Use an HTTPS image or a local image path.');
const base={title:z.string().trim().min(1).max(200),description:z.string().max(10000),image};
export const feedSchema=z.discriminatedUnion('kind',[
 z.object({...base,kind:z.literal('event'),startsAt:z.iso.datetime({offset:true}),endsAt:z.union([z.literal(''),z.iso.datetime({offset:true})]),timezone:z.string().max(100).refine(v=>{try{new Intl.DateTimeFormat('en',{timeZone:v});return true;}catch{return false;}},'Choose a valid time zone.'),allDay:z.boolean(),location:z.string().max(500),actionLabel:z.string().max(100),actionUrl:link}).strict(),
 z.object({...base,kind:z.literal('sermon'),date:z.iso.date(),speaker:z.string().max(200),series:z.string().max(200),scripture:z.string().max(500),topics:z.array(z.string().trim().min(1).max(100)).max(30),videoUrl:link,audioUrl:link,featured:z.boolean()}).strict(),
]).superRefine((v,c)=>{if(v.kind==='event'&&v.endsAt&&Date.parse(v.endsAt)<Date.parse(v.startsAt))c.addIssue({code:'custom',path:['endsAt'],message:'End must be after the start.'});});
export type Feed=z.infer<typeof feedSchema>;
export type FeedKind=Feed['kind'];
export type FeedRecord={id:string;version:number;draft:Feed;published:Feed|null;archived:boolean;source:'manual'|'planningcenter';externalId:string|null;sourceSnapshot:Feed|null;updatedAt:string};
export type FeedMutation={id:string;version:number;action:'save'|'publish'|'archive';value:unknown};
export class FeedError extends Error{}
export function newFeed(kind:FeedKind):Feed{
 const base={title:'',description:'',image:''};
 return kind==='event'?{...base,kind,startsAt:new Date().toISOString(),endsAt:'',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,allDay:false,location:'',actionLabel:'Learn more',actionUrl:''}:{...base,kind,date:new Date().toISOString().slice(0,10),speaker:'',series:'',scripture:'',topics:[],videoUrl:'',audioUrl:'',featured:false};
}
export function applyFeed(current:FeedRecord|undefined,input:FeedMutation):FeedRecord{
 if((current?.version??0)!==input.version)throw new FeedError('This item changed in another window. Reload before saving.');
 if(current?.archived)throw new FeedError('This item is archived. Create a new item to publish it again.');
 const draft=input.action==='archive'&&current?current.draft:feedSchema.parse(input.value);
 if(current&&current.draft.kind!==draft.kind)throw new FeedError('An item cannot change between event and sermon.');
 if(input.action==='publish'&&draft.kind==='sermon'&&!draft.videoUrl&&!draft.audioUrl)throw new FeedError('Add a video, audio, or Church Center link before publishing this sermon.');
 return {id:input.id,version:input.version+1,draft,published:input.action==='archive'?null:input.action==='publish'?structuredClone(draft):current?.published??null,archived:input.action==='archive',source:current?.source??'manual',externalId:current?.externalId??null,sourceSnapshot:current?.sourceSnapshot??null,updatedAt:new Date().toISOString()};
}
export type ImportedFeed={externalId:string;content:Feed};
export function mergeImport(current:FeedRecord|undefined,incoming:ImportedFeed,id:string):{record?:FeedRecord;status:'added'|'updated'|'unchanged'|'conflict'}{
 if(current?.archived)return {status:'unchanged'};
 if(current&&JSON.stringify(current.sourceSnapshot&&feedSchema.parse(current.sourceSnapshot))===JSON.stringify(feedSchema.parse(incoming.content)))return {status:'unchanged'};
 if(current&&JSON.stringify(feedSchema.parse(current.draft))!==JSON.stringify(current.sourceSnapshot&&feedSchema.parse(current.sourceSnapshot)))return {status:'conflict'};
 return {status:current?'updated':'added',record:{id:current?.id??id,version:(current?.version??0)+1,draft:feedSchema.parse(incoming.content),published:current?.published??null,archived:false,source:'planningcenter',externalId:incoming.externalId,sourceSnapshot:incoming.content,updatedAt:new Date().toISOString()}};
}
