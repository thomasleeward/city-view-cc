import {z} from 'zod';
const providerId=z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
export const eventReferenceSchema=z.discriminatedUnion('provider',[
 z.object({provider:z.literal('manual'),organizationId:z.literal(''),sourceId:z.uuid()}).strict(),
 z.object({provider:z.literal('planningcenter'),organizationId:providerId,sourceId:providerId}).strict(),
]);
export type EventReference=z.infer<typeof eventReferenceSchema>;
export function eventKey(reference:EventReference){return JSON.stringify([reference.provider,reference.organizationId,reference.sourceId]);}
/** Only server-held import metadata may supply this identity. */
export function feedEventReference(record:{id:string;source:'manual'|'planningcenter';externalId:string|null},organizationId:string|null):EventReference|null{
 if(record.source==='manual'){const parsed=eventReferenceSchema.safeParse({provider:'manual',organizationId:'',sourceId:record.id});return parsed.success?parsed.data:null;}
 const match=/^([a-zA-Z0-9_-]{1,100}):event:([a-zA-Z0-9_-]{1,100})$/.exec(record.externalId??'');
 return match&&match[1]===organizationId?{provider:'planningcenter',organizationId:match[1],sourceId:match[2]}:null;
}

export type EventPresentation={reference:EventReference;version:number;draft:{featured:boolean};published:{featured:boolean}|null;updatedAt:string};
