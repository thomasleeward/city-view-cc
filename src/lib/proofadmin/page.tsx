import {notFound} from 'next/navigation';
import {sharedContent} from './server';
import {Website} from './renderer';
import {pageKey} from './contract';
export async function SharedPage({slug}:{slug:string}){
 const {documents,configuration}=await sharedContent();
 const page=documents.find(d=>d.content.kind==='page'&&pageKey(d.content)===slug);
 if(!page)notFound();
 return <Website frame={false} documents={documents} content={page.content} configuration={configuration}/>;
}
