"use client";
import {mountPreviewPencils} from '@/lib/proofadmin/preview-pencils';
import {useEffect,useRef,useState} from 'react';
import {Website} from '@/lib/proofadmin/renderer';
import {connectPreviewReceiver,type PreviewPayload} from '@/lib/proofadmin/preview-protocol';
import type {SiteConfiguration} from '@/lib/proofadmin/site-configuration';
import type {PublishedSermon} from '@/lib/proofadmin/sermons';
export default function Preview({siteId,id,configuration,sermons}:{siteId:string;id:string;configuration:SiteConfiguration;sermons:PublishedSermon[]}){
 const [payload,setPayload]=useState<PreviewPayload|null>(null);const select=useRef<((id:string)=>void)|null>(null);
 useEffect(()=>{if(window.parent===window)return;const origins=['https://login.proofcreatives.com','https://proofadmin-kappa.vercel.app',...(process.env.NODE_ENV==='development'?['http://127.0.0.1:3100']:[])];const connections=origins.map(adminOrigin=>connectPreviewReceiver({adminOrigin,siteId,id,onContent:setPayload}));select.current=id=>connections.forEach(c=>c.select(id));return ()=>{select.current=null;connections.forEach(c=>c.disconnect());};},[siteId,id]);
 useEffect(()=>{document.querySelectorAll('[data-proof-selected]').forEach(n=>n.removeAttribute('data-proof-selected'));if(!payload?.selected)return;const c=payload.content;const anchor=c.kind==='page'?c.sections.find(s=>s.id===payload.selected)?.anchor??payload.selected:payload.selected;const el=document.getElementById(anchor)||document.getElementById('proof-item-'+anchor);el?.setAttribute('data-proof-selected','true');el?.scrollIntoView({behavior:'smooth',block:'center'});},[payload]);
 useEffect(()=>{if(!payload)return;return mountPreviewPencils({id,content:payload.content},payload.related??[],(selected,documentId)=>{
  const origins=['https://login.proofcreatives.com','https://proofadmin-kappa.vercel.app',...(process.env.NODE_ENV==='development'?['http://127.0.0.1:3100']:[])];
  for(const origin of origins)window.parent.postMessage({type:'proofadmin-preview-select',protocol:1,siteId,id,selected,documentId},origin);
 });},[payload,id,siteId]);
 if(!payload)return <main className="p-10">Open this preview from Proof Admin.</main>;
 return <div onClickCapture={event=>{const target=event.target as HTMLElement;const item=target.closest<HTMLElement>('[data-proof-item]');if(item?.dataset.proofItem)select.current?.(item.dataset.proofItem);if(target.closest('a'))event.preventDefault();}}><style>{'[data-proof-selected="true"]{outline:3px solid #EFAF65;outline-offset:-3px}'}</style><Website sermons={sermons} documents={[{id,content:payload.content},...(payload.related??[])]} content={payload.content} configuration={payload.configuration??configuration}/></div>;
}
