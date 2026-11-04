'use client';
import {useEffect,useState,type ReactNode} from 'react';
import {eventPageSchema,type PublicEvent} from './event-catalog';
import './event-collection.css';
type Settings={type:'featured_events';count?:number;order?:'soonest'|'latest';emptyMessage?:string}|{type:'all_events';pageSize?:number;order?:'soonest'|'latest';emptyMessage?:string};
type Props={element:Settings;site:string;api?:string;viewAll?:ReactNode;compactDates?:boolean;hideImages?:boolean};
export function eventDateLabel(event:PublicEvent,compact=false){const value=event.content;return new Intl.DateTimeFormat('en-US',{timeZone:value.timezone,month:'short',day:compact?'2-digit':'numeric',...(compact?{}:{year:'numeric' as const})}).format(new Date(value.startsAt));}
export function EventCollection({element,site,api='https://login.proofcreatives.com/api/public/events/'+encodeURIComponent(site),viewAll,compactDates=false,hideImages=false}:Props){
 const featured=element.type==='featured_events',limit=element.type==='featured_events'?element.count??3:element.pageSize??9,order=element.order??'soonest';
 const [page,setPage]=useState(1),[retry,setRetry]=useState(0),[result,setResult]=useState<ReturnType<typeof eventPageSchema.parse>|null>(null),[error,setError]=useState(false);
 useEffect(()=>setPage(1),[api,featured,limit,order]);
 useEffect(()=>{const abort=new AbortController();setResult(null);setError(false);const query=new URLSearchParams({kind:featured?'featured':'all',limit:String(limit),order,page:String(featured?1:page)});fetch(api+'?'+query,{signal:abort.signal,credentials:'omit',cache:'no-store'}).then(response=>{if(!response.ok)throw Error();return response.json();}).then(json=>{const value=eventPageSchema.parse(json);if(!abort.signal.aborted)setResult(value);}).catch(()=>{if(!abort.signal.aborted)setError(true);});return()=>abort.abort();},[api,featured,limit,order,page,retry]);
 return <div className="proof-event-collection" data-proof-events={element.type} aria-label={featured?'Featured events':'All events'}>
  {error?<div role="alert"><p>Events are temporarily unavailable.</p><button type="button" onClick={()=>setRetry(value=>value+1)}>Try again</button></div>:!result?<p role="status">Loading events…</p>:<>
   {!result.items.length?<p className="proof-event-empty">{element.emptyMessage??(featured?'No featured events right now.':'No upcoming events. Please check back soon.')}</p>:<div className="proof-event-list">{result.items.map(event=><article className="proof-event-row" data-proof-event={event.id} key={event.id}>
    <time className="proof-event-date" dateTime={event.content.startsAt} aria-label={eventDateLabel(event)}>{eventDateLabel(event,compactDates)}</time>
    {event.content.image&&!hideImages&&<img className="proof-event-image" src={event.content.image} alt="" loading="lazy"/>}
    <div className="proof-event-copy"><h3>{event.content.title}</h3><p className="proof-event-meta">{[event.content.allDay?'All day':new Intl.DateTimeFormat('en-US',{timeZone:event.content.timezone,hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date(event.content.startsAt)),event.content.location].filter(Boolean).join(' · ')}</p>{event.content.description&&<p className="proof-event-description">{event.content.description}</p>}</div>
    {event.content.actionUrl&&<a className="proof-event-action" href={event.content.actionUrl}>{event.content.actionLabel||'Learn more'} <span aria-hidden="true">↗</span></a>}
   </article>)}</div>}
   {!featured&&(result.pages>1||page>1)&&<nav className="proof-event-pagination" aria-label="Event pages"><button type="button" disabled={page<=1} onClick={()=>setPage(value=>Math.max(1,Math.min(value-1,result.pages)))}>Previous</button><span aria-live="polite">{page>result.pages?'No events on this page':`Page ${page} of ${result.pages}`}</span><button type="button" disabled={!result.hasNext} onClick={()=>setPage(value=>value+1)}>Next</button></nav>}
  </>}
  {viewAll&&<div className="proof-event-view-all">{viewAll}</div>}
 </div>;
}
