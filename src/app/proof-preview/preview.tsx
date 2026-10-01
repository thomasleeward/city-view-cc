"use client";
import {useEffect,useRef,useState} from 'react';
import {Website} from '@/lib/proofadmin/renderer';
import {connectPreviewReceiver,type PreviewPayload} from '@/lib/proofadmin/preview-protocol';
import type {SiteConfiguration} from '@/lib/proofadmin/site-configuration';
export default function Preview({siteId,id,configuration}:{siteId:string;id:string;configuration:SiteConfiguration}){
 const [payload,setPayload]=useState<PreviewPayload|null>(null);const select=useRef<((id:string)=>void)|null>(null);
 useEffect(()=>{if(window.parent===window)return;const origins=['https://login.proofcreatives.com','https://proofadmin-kappa.vercel.app',...(process.env.NODE_ENV==='development'?['http://127.0.0.1:3100']:[])];const connections=origins.map(adminOrigin=>connectPreviewReceiver({adminOrigin,siteId,id,onContent:setPayload}));select.current=id=>connections.forEach(c=>c.select(id));return ()=>{select.current=null;connections.forEach(c=>c.disconnect());};},[siteId,id]);
 useEffect(()=>{document.querySelectorAll('[data-proof-selected]').forEach(n=>n.removeAttribute('data-proof-selected'));if(!payload?.selected)return;const c=payload.content;const anchor=c.kind==='page'?c.sections.find(s=>s.id===payload.selected)?.anchor??payload.selected:payload.selected;const el=document.getElementById(anchor)||document.getElementById('proof-item-'+anchor);el?.setAttribute('data-proof-selected','true');el?.scrollIntoView({behavior:'smooth',block:'center'});},[payload]);
 if(!payload)return <main className="p-10">Open this preview from Proof Admin.</main>;
 return <div onClickCapture={event=>{const target=event.target as HTMLElement;const item=target.closest<HTMLElement>('[data-proof-item]');if(item?.dataset.proofItem)select.current?.(item.dataset.proofItem);if(target.closest('a'))event.preventDefault();}}><style>{'[data-proof-selected="true"]{outline:3px solid #EFAF65;outline-offset:-3px}'}</style><Website documents={[{id,content:payload.content},...(payload.related??[])]} content={payload.content} configuration={payload.configuration??configuration}/></div>;
}
