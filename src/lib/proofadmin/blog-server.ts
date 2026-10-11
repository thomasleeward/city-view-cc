import 'server-only';
import {cache} from 'react';
import {connection} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {contentSchema} from './contract';
import {configurationSchema} from './site-configuration';
import type {BlogPost} from './blog-view';
export const publishedBlog=cache(async()=>{
 await connection();
 const url=process.env.PROOFADMIN_SUPABASE_URL,key=process.env.PROOFADMIN_PUBLISHABLE_KEY,siteId='10000000-0000-4000-8000-000000000003';
 if(url!=='https://lqhgemgmduxhvmfurtob.supabase.co'||!key||process.env.PROOFADMIN_SITE_ID!==siteId)throw Error('Blog is not configured.');
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}});
 const [cfg,rows]=await Promise.all([client.from('published_site_configuration').select('content').eq('site_id',siteId).maybeSingle(),client.from('published_documents').select('id,content').eq('site_id',siteId).eq('kind','page')]);
 if(cfg.error||rows.error)throw Error('The blog is temporarily unavailable.');
 const configuration=cfg.data?configurationSchema.parse(cfg.data.content):null;
 const posts:BlogPost[]=rows.data.flatMap(r=>{const c=contentSchema.parse(r.content);return c.kind==='page'&&c.blogPost?[{id:r.id,name:c.name,slug:c.slug,blogPost:c.blogPost}]:[];});
 return {configuration,posts};
});
