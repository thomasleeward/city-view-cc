import 'server-only';
import type {Metadata} from 'next';
import {cache} from 'react';
import {connection} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {resolveSharing} from './sharing-metadata';
const SITE_ID='10000000-0000-4000-8000-000000000003';
const origin=process.env.NEXT_PUBLIC_SITE_URL||'https://www.cityviewcc.com';
const publishedSharing=cache(async()=>{
 await connection();
 const key=process.env.PROOFADMIN_PUBLISHABLE_KEY;
 if(process.env.PROOFADMIN_SUPABASE_URL!=='https://lqhgemgmduxhvmfurtob.supabase.co'||process.env.PROOFADMIN_SITE_ID!==SITE_ID||!key)return null;
 const client=createClient('https://lqhgemgmduxhvmfurtob.supabase.co',key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}});
 const [config,docs]=await Promise.all([client.from('published_site_configuration').select('content').eq('site_id',SITE_ID).maybeSingle(),client.from('published_documents').select('content').eq('site_id',SITE_ID).eq('kind','page')]);
 if(config.error||docs.error)return null;
 return {configuration:config.data?.content,documents:docs.data.map(row=>row.content)};
});
export async function sharingMetadata(path?:string,fallback:Metadata={}):Promise<Metadata>{
 const data=await publishedSharing();
 return resolveSharing(data,path,fallback,origin,'City View Community Church','');
}
