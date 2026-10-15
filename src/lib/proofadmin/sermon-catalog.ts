import {z} from 'zod';
import {feedSchema} from './feeds';
const web=z.string().max(2000).refine(v=>!v||/^\/(?![\/\\])/.test(v)||(()=>{try{return ['https:','http:'].includes(new URL(v).protocol);}catch{return false;}})());
export const sermonCardSchema=z.object({id:z.string().max(200),title:z.string().max(200),image:web,description:z.string().max(10000).default(''),date:z.string().max(30).default(''),speaker:z.string().max(300).default(''),seriesSlug:z.string().max(200).default(''),videoUrl:web.default(''),audioUrl:web.default(''),guideUrl:web.default('')});
export type SermonCard=z.infer<typeof sermonCardSchema>;
export const sermonPageSchema=z.object({items:z.array(sermonCardSchema).max(9),next:z.string().max(200).nullable(),saved:z.boolean().optional()});
export const sermonQuerySchema=z.object({kind:z.enum(['messages','series','speakers','message','series_detail']),limit:z.coerce.number().int().min(1).max(9).default(9),cursor:z.string().regex(/^(saved:)?\d{1,6}$/).default('0'),speaker:z.string().max(150).default(''),series:z.string().regex(/^[a-zA-Z0-9_-]{0,200}$/).default(''),id:z.string().regex(/^[a-zA-Z0-9_-]{0,200}$/).default('')}).strict();
export type SermonQuery=z.infer<typeof sermonQuerySchema>;
export function publishedSermonCatalog(rows:{id:string;content:unknown}[],channelId?:string){
 const messages:SermonCard[]=[],series:SermonCard[]=[],seriesNames=new Map<string,string>();
 for(const row of rows){const result=feedSchema.safeParse(row.content);if(!result.success||result.data.kind!=='sermon')continue;const s=result.data;if(channelId&&s.publicId&&s.channelId!==channelId)continue;if(s.seriesSlug||s.seriesId)seriesNames.set(s.seriesSlug||s.seriesId||'',s.series||'Sermon series');const card={id:s.entryType==='series'?s.seriesSlug||s.publicId||row.id:s.publicId||row.id,title:s.title,description:s.description,image:s.image,date:s.date,speaker:s.speaker,seriesSlug:s.seriesSlug||s.seriesId||'',videoUrl:s.videoUrl,audioUrl:s.audioUrl,guideUrl:s.guideUrl||''};if(s.entryType==='series')series.push(card);else if(s.videoUrl||s.audioUrl)messages.push(card);}
 // Imported episodes also carry a series identity. They can form a series even
 // when the source did not export a separate series record.
 for(const m of messages){if(m.seriesSlug&&!series.some(s=>s.id===m.seriesSlug)){series.push({...m,id:m.seriesSlug,title:seriesNames.get(m.seriesSlug)||'Sermon series',speaker:'',videoUrl:'',audioUrl:'',guideUrl:''});}}
 const newest=(a:SermonCard,b:SermonCard)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id);messages.sort(newest);series.sort(newest);return {messages,series};
}
export function querySermonCatalog(catalog:ReturnType<typeof publishedSermonCatalog>,q:SermonQuery){
 if(q.kind==='speakers')return {speakers:[...new Set(catalog.messages.flatMap(m=>m.speaker.split(', ').filter(Boolean)))].sort()};
 if(q.kind==='message'||q.kind==='series_detail')return {item:(q.kind==='message'?catalog.messages:catalog.series).find(m=>m.id===q.id)??null};
 const items=q.kind==='series'?catalog.series:catalog.messages.filter(m=>(!q.speaker||m.speaker.split(', ').includes(q.speaker))&&(!q.series||m.seriesSlug===q.series));
 const offset=Number(q.cursor.replace('saved:',''));return {items:items.slice(offset,offset+q.limit),next:items.length>offset+q.limit?String(offset+q.limit):null};
}
