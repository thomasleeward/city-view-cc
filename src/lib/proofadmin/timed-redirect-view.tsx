'use client';
import {useEffect,useRef} from 'react';
import {mountTimedRedirect} from './timed-redirect-runtime';
import './timed-redirect.css';
/** Only public snapshot callsites may opt into publishedMode. Never use frame visibility. */
export function TimedRedirect({href,label,delaySeconds,showCountdown=true,publishedMode=false}:{href:string;label?:string;delaySeconds:number;showCountdown?:boolean;publishedMode?:boolean}){
 const ref=useRef<HTMLElement>(null);
 useEffect(()=>mountTimedRedirect(ref.current,{publishedMode}),[href,delaySeconds,publishedMode]);
 if(!publishedMode)return null;
 return <aside ref={ref} className="proof-timed-redirect" aria-label="Page redirect" data-presentation={showCountdown?'visible':'hidden'} data-href={href} data-delay-seconds={delaySeconds}><p data-redirect-status>Continue to {label||'the next page'}.</p><div><a data-redirect-continue href={href}>Continue</a><button type="button" data-redirect-cancel hidden>Cancel automatic redirect</button></div></aside>;
}
