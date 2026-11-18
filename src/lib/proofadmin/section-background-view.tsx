'use client';
import {useEffect,useRef,type CSSProperties} from 'react';
import {backgroundImageSrcSet,type SectionBackgroundMedia,type BackgroundImage} from './section-background';
import {mountSectionBackground} from './section-background-runtime';
import './section-background.css';
/** Parent must use proof-section-background-host; omit this component for legacy sections. */
export function SectionBackground({media,overlay='#000000',opacity=0,label='Section background'}:{media:SectionBackgroundMedia;overlay?:string;opacity?:number;label?:string}){
 const ref=useRef<HTMLDivElement>(null);
 const signature=JSON.stringify(media);
 useEffect(()=>mountSectionBackground(ref.current),[signature]);
 const image=(value:BackgroundImage,index:number,slide=false)=>value.src?<img key={slide?media.slides[index].id:index} data-background-slide={slide?true:undefined} data-active={index===0?'true':'false'} data-src={index>0?value.src:undefined} data-srcset={index>0?backgroundImageSrcSet(value.src):undefined} src={index===0?value.src:undefined} srcSet={index===0?backgroundImageSrcSet(value.src):undefined} sizes="100vw" loading={index===0?'eager':'lazy'} decoding="async" alt={value.alt} aria-hidden={index>0||!value.alt?true:undefined} style={{objectPosition:`${value.focalX}% ${value.focalY}%`}}/>:null;
 return <div ref={ref} className="proof-section-background" role="group" aria-label={label} data-type={media.type} data-transition={media.transition} data-duration-seconds={media.durationSeconds} data-transition-ms={media.transitionMs} data-pause-on-hover={String(media.pauseOnHover)} data-mobile-fallback={String(media.video.mobileFallback)} style={{'--proof-background-transition':`${media.transitionMs}ms`,'--proof-background-duration':`${media.durationSeconds*1000+media.transitionMs}ms`} as CSSProperties}>
  {media.type==='image'?image(media.image,0):media.type==='slideshow'?media.slides.map((slide,index)=>image(slide,index,true)):media.type==='video'?<>{image(media.video.poster,0)}{media.video.src&&<video data-src={media.video.src} poster={media.video.poster.src||undefined} muted loop playsInline preload="none" style={{objectPosition:`${media.video.poster.focalX}% ${media.video.poster.focalY}%`}} aria-hidden="true" hidden/>}</>:null}
  {media.type!=='none'&&<div className="proof-section-background-overlay" aria-hidden="true" style={{backgroundColor:overlay,opacity}}/>}
  <button type="button" data-background-toggle hidden>Pause background {media.type==='video'?'video':'slideshow'}</button>
 </div>;
}
