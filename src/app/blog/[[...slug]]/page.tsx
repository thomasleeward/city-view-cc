import {sharingMetadata} from '@/lib/proofadmin/sharing-server';
import {notFound} from 'next/navigation';
import {publishedBlog} from '@/lib/proofadmin/blog-server';
import {BlogView} from '@/lib/proofadmin/blog-view';
import {TypographyStyles} from '@/lib/proofadmin/typography-view';
export const dynamic='force-dynamic';
export default async function Page({params,searchParams}:{params:Promise<{slug?:string[]}>;searchParams:Promise<{author?:string;category?:string}>}){
 const [{slug},filters,{configuration,posts}]=await Promise.all([params,searchParams,publishedBlog()]);
 if(!configuration?.blog?.enabled||(slug&&slug.length!==1))notFound();
 return <><TypographyStyles typography={configuration.typography}/><BlogView posts={posts} name={configuration.settings.church_name} featureLatest={configuration.blog.featureLatest} slug={slug?.[0]} author={typeof filters.author==='string'?filters.author:''} category={typeof filters.category==='string'?filters.category:''}/></>;
}



export async function generateMetadata({params}:{params:Promise<{slug?:string[]}>}){const p=await params;return sharingMetadata(('/blog/'+(p.slug??[]).join('/')).replace(/\/$/,''));}
