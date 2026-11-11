import {z} from 'zod';
import {publicEventSchema} from './event-catalog';
export const nativeEventSourceSchema=z.object({mode:z.enum(['manual','planningcenter']),items:z.array(publicEventSchema).max(2000)}).strict().superRefine((source,context)=>{
 for(const [index,event] of source.items.entries())if(event.reference.provider!==source.mode)context.addIssue({code:'custom',path:['items',index,'reference'],message:'Events must belong to the selected source.'});
});
/** Public events only. No provider token, selected organization, or fallback source is accepted. */
export async function readNativeEventSource(site:string,tagIds?:string[],fetcher:typeof fetch=fetch){
 if(!/^[a-zA-Z0-9_-]{1,100}$/.test(site))throw Error('Invalid event website.');
 if(tagIds&&(!tagIds.length||tagIds.length>50||tagIds.some(id=>!/^[a-zA-Z0-9_-]{1,100}$/.test(id))))throw Error('Invalid event tags.');
 const url=new URL('/api/public/event-source/'+encodeURIComponent(site),'https://login.proofcreatives.com');
 if(tagIds)url.searchParams.set('tagIds',tagIds.join(','));
 const response=await fetcher(url,{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Events are temporarily unavailable.');
 return nativeEventSourceSchema.parse(await response.json());
}
export function nativeEventFeeds(source:z.infer<typeof nativeEventSourceSchema>){return source.items.map(event=>({id:event.content.publicId??event.reference.sourceId,content:event.content}));}
/** An unavailable event source must not fail unrelated homepage or sermon content. */
export async function readNativeEventState(site:string,reader=readNativeEventSource){
 try{return {feeds:nativeEventFeeds(await reader(site)),unavailable:false};}
 catch{return {feeds:[] as ReturnType<typeof nativeEventFeeds>,unavailable:true};}
}
