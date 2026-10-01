import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {CITY_VIEW_SITE_ID,sharedContent} from '@/lib/proofadmin/server';
import Preview from './preview';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'City View draft preview',robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{siteId?:string;documentId?:string}>}){const {siteId,documentId}=await searchParams;if(siteId!==CITY_VIEW_SITE_ID||!documentId||!/^[a-f0-9-]{36}$/.test(documentId))notFound();const {configuration}=await sharedContent();return <Preview siteId={siteId} id={documentId} configuration={configuration}/>;}
