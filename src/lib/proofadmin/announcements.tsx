'use client';
import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
import {RichInline} from './rich-text';
import type {Announcements as AnnouncementData} from './announcements-schema';
import {setupAnnouncements} from './announcements-runtime';
import {AnnouncementPopupLayout,type AnnouncementDestination} from './announcement-popup-layout';
import './announcements.css';
export function Announcements({value,documents=[]}:{value?:AnnouncementData;documents?:AnnouncementDestination[]}){
 const pathname=usePathname();const root=useRef<HTMLDivElement>(null);
 const excluded=!pathname||/^\/(admin|proof-preview|api)(\/|$)/.test(pathname);
 useEffect(()=>{if(excluded)return;return setupAnnouncements(root.current);},[value,pathname,excluded]);
 if(!value||excluded)return null;
 const home=pathname==='/';const banner=value.banner;const popups=value.popups.filter(p=>p.enabled&&(p.scope==='all'||home));
 const visible=banner.enabled&&(banner.scope==='all'||home);
 const bannerProps={className:'proof-announcement-banner',hidden:Boolean(banner.schedule),'data-announcement-schedule':banner.schedule?'true':undefined,'data-starts-at':banner.schedule?.startsAt,'data-ends-at':banner.schedule?.endsAt,style:{background:banner.background,color:banner.textColor}};
 return <div ref={root} data-proof-announcements>
 {visible?(banner.href?<a {...bannerProps} href={banner.href}>{banner.text}</a>:<div {...bannerProps}>{banner.text}</div>):null}
 {popups.map(p=><dialog key={p.id} aria-label={p.name} className="proof-announcement-popup" data-column-layout={p.layout?'true':undefined} data-announcement-id={p.id} data-trigger={p.trigger} style={{background:p.background,color:p.textColor}}><button type="button" data-announcement-close className="proof-announcement-close" aria-label="Close announcement">×</button>{p.layout?<AnnouncementPopupLayout layout={p.layout} documents={documents} background={p.background} text={p.textColor}/>:<>{p.image?<img src={p.image} alt={p.imageAlt}/>:null}<div className="proof-announcement-body"><RichInline text={p.body}/></div>{p.buttonLabel&&p.buttonHref?<a className="proof-announcement-button" href={p.buttonHref} style={{background:p.buttonColor,color:p.buttonTextColor}}>{p.buttonLabel}</a>:null}</>}</dialog>)}
 </div>;
}
