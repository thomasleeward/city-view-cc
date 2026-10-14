import type {Metadata} from 'next';
import {sharingSchema,imageUrl} from './contract';
export function faviconUrl(value:unknown,origin:string){const parsed=imageUrl.safeParse(value);return parsed.success&&parsed.data?new URL(parsed.data,origin).href:'';}
export function resolveSharing(data:{configuration?:any;documents:any[]}|null,path:string|undefined,fallback:Metadata,origin:string,siteName:string,fallbackImage=''):Metadata{
 const cfg=data?.configuration;
 const favicon=faviconUrl(cfg?.favicon,origin);
 const page=path?data?.documents.find(p=>p.kind==='page'&&(!p.blogPost||cfg?.blog?.enabled)&&('/'+(p.blogPost?'blog/':p.group?`${p.group}/`:'')+(p.slug==='home'&&!p.group?'':p.slug))===path):undefined;
 const site=sharingSchema.safeParse(cfg?.sharing??{}),override=sharingSchema.safeParse(page?.sharing??{});
 const defaults=site.success?site.data:{},custom=override.success?override.data:{};
 const name=cfg?.settings?.church_name||siteName;
 const title=custom.title?.trim()||(path==='/'?(defaults.title?.trim()||name):undefined)||page?.name||defaults.title?.trim()||(typeof fallback.title==='string'?fallback.title:name);
 const description=custom.description?.trim()||page?.blogPost?.excerpt||page?.description||defaults.description?.trim()||fallback.description||undefined;
 const cover=sharingSchema.safeParse({image:page?.blogPost?.image??''});
 const image=custom.image||(cover.success?cover.data.image:'')||defaults.image||fallbackImage;
 const alt=custom.image?(custom.imageAlt||title):page?.blogPost?.image?(page.blogPost.imageAlt||title):(defaults.imageAlt||title);
 const images=image?[{url:new URL(image,origin).href,alt}]:[];
 return {...fallback,...(favicon?{icons:{icon:favicon,shortcut:favicon,apple:favicon}}:{}),metadataBase:new URL(origin),title:{absolute:title},description,...(path?{alternates:{canonical:path}}:{}),openGraph:{type:page?.blogPost?'article':'website',siteName:name,title,description,...(path?{url:new URL(path,origin).href}:{}),images},twitter:{card:'summary_large_image',title,description,images}};
}
