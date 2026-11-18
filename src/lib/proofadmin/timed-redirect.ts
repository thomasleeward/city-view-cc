import {z} from 'zod';
export const timedRedirectHttps=(value:string)=>{if(!value.startsWith('https://')||/[\\\u0000-\u0020\u007f]/.test(value))return false;try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password;}catch{return false;}};
export const timedRedirectSchema=z.object({enabled:z.boolean(),destination:z.discriminatedUnion('kind',[z.object({kind:z.literal('page'),value:z.union([z.literal(''),z.uuid()])}).strict(),z.object({kind:z.literal('url'),value:z.string().max(2000).refine(value=>!value||timedRedirectHttps(value),'Use a complete HTTPS destination without credentials.')}).strict()]),showCountdown:z.boolean().optional(),delaySeconds:z.number().int().min(1).max(300).default(10)}).strict();
export type TimedRedirect=z.infer<typeof timedRedirectSchema>;
export type RedirectPage={kind:string;slug:string;group?:string;blogPost?:unknown;linkPage?:unknown;timedRedirect?:TimedRedirect};
export function timedRedirectPagePath(page:Pick<RedirectPage,'slug'|'group'|'blogPost'>){return page.blogPost?`/blog/${page.slug}`:page.group?`/${page.group}/${page.slug}`:page.slug==='home'?'/':`/${page.slug}`;}
export function normalizeRedirectPath(path:string){try{return decodeURIComponent(path).replace(/\/{2,}/g,'/').replace(/\/+$/,'').toLowerCase()||'/';}catch{return '';}}
export function redirectIsSelf(href:string,currentUrl:string){try{const target=new URL(href,currentUrl),current=new URL(currentUrl);return target.origin===current.origin&&normalizeRedirectPath(target.pathname)===normalizeRedirectPath(current.pathname);}catch{return true;}}
/** Callers must pass published snapshots. Nothing here fetches destinations. */
export function resolveTimedRedirect(sourceId:string,page:RedirectPage,documents:{id:string;content:RedirectPage}[],origin?:string){
 const settings=page.timedRedirect;if(page.kind!=='page'||page.linkPage||page.blogPost||!settings?.enabled)return null;
 let href:string,label:string;
 if(settings.destination.kind==='page'){const target=documents.find(d=>d.id===settings.destination.value&&d.id!==sourceId&&d.content.kind==='page');if(!target)return null;href=timedRedirectPagePath(target.content);label=target.content.slug==='home'?'the homepage':target.content.slug.replaceAll('-',' ');}
 else{href=settings.destination.value;if(!timedRedirectHttps(href))return null;label=new URL(href).hostname;}
 if(origin&&redirectIsSelf(href,new URL(timedRedirectPagePath(page),origin).href))return null;
 return {href,label,delaySeconds:settings.delaySeconds,...(settings.showCountdown!==undefined?{showCountdown:settings.showCountdown}:{})};
}
