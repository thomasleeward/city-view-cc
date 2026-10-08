'use client';
import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
import {RichInline} from './rich-text';
import type {Announcements as AnnouncementData} from './announcements-schema';
import {setupAnnouncements} from './announcements-runtime';
import './announcements.css';
export function Announcements({value}:{value?:AnnouncementData}){
 const pathname=usePathname();const root=useRef<HTMLDivElement>(null);
 const excluded=!pathname||/^\/(admin|proof-preview|api)(\/|$)/.test(pathname);
 useEffect(()=>{if(excluded)return;return setupAnnouncements(root.current);},[value,pathname,excluded]);
 if(!value||excluded)return null;
 const home=pathname==='/';const banner=value.banner;const popups=value.popups.filter(p=>p.enabled&&(p.scope==='all'||home));
 const visible=banner.enabled&&(banner.scope==='all'||home);
 return <div ref={root} data-proof-announcements>
 {visible?(banner.href?<a className="proof-announcement-banner" href={banner.href} style={{background:banner.background,color:banner.textColor}}>{banner.text}</a>:<div className="proof-announcement-banner" style={{background:banner.background,color:banner.textColor}}>{banner.text}</div>):null}
 {popups.map(p=><dialog key={p.id} aria-label={p.name} className="proof-announcement-popup" data-announcement-id={p.id} data-trigger={p.trigger} style={{background:p.background,color:p.textColor}}><button type="button" data-announcement-close className="proof-announcement-close" aria-label="Close announcement">×</button>{p.image?<img src={p.image} alt={p.imageAlt}/>:null}<div className="proof-announcement-body"><RichInline text={p.body}/></div>{p.buttonLabel&&p.buttonHref?<a className="proof-announcement-button" href={p.buttonHref} style={{background:p.buttonColor,color:p.buttonTextColor}}>{p.buttonLabel}</a>:null}</dialog>)}
 </div>;
}
