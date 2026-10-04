import {cardSchema,type GroupContent} from './contract';
import type {Feed} from './feeds';
export type PublishedSermon={id:string;content:Extract<Feed,{kind:'sermon'}>};
export function sermonDateLabel(start:string,end?:string){const date=(v:string)=>{const [y,m,d]=v.split('-');return `${Number(m)}/${Number(d)}/${y}`;};return end?`${date(start)} – ${date(end)}`:date(start);}
export function withSermons(group:GroupContent,sermons:PublishedSermon[]):GroupContent {
 return {...group,cards:[...sermons].sort((a,b)=>b.content.date.localeCompare(a.content.date)||a.content.title.localeCompare(b.content.title)||a.id.localeCompare(b.id)).map(({id,content:s})=>cardSchema.parse({id,title:s.title,description:sermonDateLabel(s.date,s.endDate),image:s.image,imageAlt:s.title,appearance:{},action:{kind:'url',label:'Watch',value:s.videoUrl||s.audioUrl},seriesDates:{start:s.date,end:s.endDate??''}}))};
}
