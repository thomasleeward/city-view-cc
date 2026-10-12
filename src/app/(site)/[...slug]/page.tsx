import {sharingMetadata} from '@/lib/proofadmin/sharing-server';
import {notFound} from 'next/navigation';
import {proofAdminEnabled} from '@/lib/proofadmin/server';
import {SharedPage} from '@/lib/proofadmin/page';
export default async function Page({params}:{params:Promise<{slug:string[]}>}){if(!proofAdminEnabled())notFound();return <SharedPage slug={(await params).slug.join('/')}/>;}

export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}){const p=await params;return sharingMetadata('/' + (p.slug??[]).join('/'));}
