'use client';
import {SectionLayoutView} from './section-layout';
import {BackgroundVideo} from './background-video';
import {buttonColors} from './button-colors';
import {useState} from 'react';
import Image from 'next/image';
import {Button} from '@/components/ui/Button';
import {Section as SiteSection} from '@/components/site/Section';
import {SermonSeriesCard} from '@/components/site/SermonSeriesCard';
import {HeroCarousel} from '@/components/site/HeroCarousel';
import {Header} from '@/components/site/Header';
import {Footer} from '@/components/site/Footer';
import {withSermons,type PublishedSermon} from './sermons';
import {NativeSection} from './native-sections';
import {RichInline,RichParagraphs,RichList,richPlainText} from './rich-text';
import {type Content,type ContentAction,type GroupContent,type ScreenContent,type Section} from './contract';
import type {SiteConfiguration} from './site-configuration';
export type Document={id:string;content:Content};
const href=(a:ContentAction)=>a.kind==='screen'?`#proof-screen-${a.value}`:a.value;
export function Group({group}:{group:GroupContent}){
 const cards=group.cards.filter(c=>!c.hidden);if(group.presentation==='series')cards.sort((a,b)=>(b.seriesDates?.start??'').localeCompare(a.seriesDates?.start??''));
 if(group.presentation==='slides')return <HeroCarousel content={{eyebrow:'',headline:'',subheadline:'',ctaLabel:'',ctaHref:''}} slides={cards.map((c,i)=>({id:c.id,imageUrl:c.image||null,videoUrl:c.video||null,sortOrder:i}))}/>;
 return <div className="grid gap-5 md:grid-cols-3">{cards.map(c=><div key={c.id} id={`proof-item-${c.id}`} data-proof-item={c.id}>
 {group.presentation==='series'?<SermonSeriesCard series={{id:c.id,name:c.title,dateLabel:c.description,startDate:c.seriesDates?.start??'',endDate:c.seriesDates?.end??null,imageUrl:c.image,youtubePlaylistUrl:c.action.value,isPublished:true}}/>:<article className="overflow-hidden rounded-lg bg-white shadow-sm">
 {c.image&&<div className="relative aspect-video"><Image src={c.image} alt={c.imageAlt} fill sizes="(min-width:768px) 33vw,100vw" className="object-contain"/></div>}
 <div className="p-5"><h3 className="font-display text-2xl font-bold"><RichInline text={c.title}/></h3>{c.subtitle&&<p className="mt-3 font-bold text-terracotta"><RichInline text={c.subtitle}/></p>}{c.details?.map((d,i)=><p key={i} className="font-bold text-terracotta"><RichInline text={d}/></p>)}<div className="mt-3 text-muted"><RichParagraphs text={c.description}/></div>{c.action.value&&<Button href={href(c.action)} className="mt-5"><RichInline links={false} text={c.action.label}/></Button>}</div>
 </article>}
 </div>)}</div>;
}
function StandardSection({s,groups}:{s:Section;groups:Record<string,GroupContent>}){
 return <section className="py-16 sm:py-24" style={{background:s.appearance.background,color:s.appearance.text}}><BackgroundVideo source={s.appearance.video} poster={s.appearance.image||s.image} overlay={s.appearance.overlay} opacity={s.appearance.opacity}/><div className="mx-auto max-w-6xl px-5">
 {s.eyebrow&&<p className="mb-3 text-sm font-bold uppercase tracking-widest"><RichInline text={s.eyebrow}/></p>}
 <div className={['image_left','image_right','visit'].includes(s.type)?'grid items-center gap-8 md:grid-cols-2':''}>
 {s.image&&<div className={`relative mb-8 aspect-video ${s.type==='image_right'?'md:order-2':''}`}><Image src={s.image} alt={s.imageAlt} fill sizes="100vw" className="object-cover" style={{objectPosition:`${s.appearance.focalX}% ${s.appearance.focalY}%`}}/></div>}
 <div><h2 className="font-display text-4xl font-bold"><RichInline text={s.title}/></h2><div className="mt-5 space-y-5 text-lg leading-8"><RichParagraphs text={s.body}/></div>{s.facts.length>0&&<ul>{s.facts.map((f,i)=><li key={i}><RichInline text={f}/></li>)}</ul>}<div className="mt-6 flex flex-wrap gap-3">{s.buttons.map((b,i)=><Button key={i} style={buttonColors(b)} href={href(b)}><RichInline links={false} text={b.label}/></Button>)}</div></div></div>
 {s.type==='card_group'&&groups[s.groupId]&&<Group group={groups[s.groupId]}/>}
 </div></section>;
}
function Screen({content,groups,close}:{content:ScreenContent;groups:Record<string,GroupContent>;close:()=>void}){
 return <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={richPlainText(content.title)}><div className="proof-video-surface mx-auto max-w-4xl rounded-lg p-8" style={{background:content.appearance.background,color:content.appearance.text}}><BackgroundVideo source={content.appearance.video} poster={content.appearance.image} overlay={content.appearance.overlay} opacity={content.appearance.opacity}/><button type="button" onClick={close} className="float-right rounded border px-4 py-2">Close</button><p><RichInline text={content.eyebrow}/></p><h1 className="font-display text-4xl"><RichInline text={content.title}/></h1><RichParagraphs text={content.intro}/>{content.blocks.map(b=><div key={b.id} id={`proof-item-${b.id}`} data-proof-item={b.id} className="mt-6">{b.grid?<SectionLayoutView layout={b.grid} groups={groups} background={content.appearance.background} color={content.appearance.text} href={href}/>:b.type==='card_group'?groups[b.groupId]&&<Group group={groups[b.groupId]}/>:b.type==='image'?b.image&&<Image src={b.image} alt={b.alt} width={1000} height={650}/>:b.type==='button'?<Button style={buttonColors(b.action)} href={href(b.action)}><RichInline links={false} text={b.action.label}/></Button>:b.type==='spacer'?<div style={{height:b.size}}/>:<>{b.caption&&<h2 className="font-display text-2xl"><RichInline text={b.caption}/></h2>}{b.type==='list'?<ul><RichList text={b.text}/></ul>:<RichParagraphs text={b.text}/>} {(b.showAction || b.type==='callout' || b.type==='feature') && b.action.value && <Button className="mt-5" style={buttonColors(b.action)} href={href(b.action)}><RichInline links={false} text={b.action.label}/></Button>}</>}</div>)}</div></div>;
}
export function Website({documents,content,configuration,frame=true,sermons}:{documents:Document[];content:Content;configuration:SiteConfiguration;frame?:boolean;sermons?:PublishedSermon[]}){
 const [opened,setOpened]=useState<string|null>(null);
 const groups=Object.fromEntries(documents.flatMap(d=>d.content.kind==='card_group'?[[d.id,sermons&&d.content.presentation==='series'?withSermons(d.content,sermons):d.content]]:[])) as Record<string,GroupContent>;
 const screen=documents.find(d=>d.id===opened)?.content;
 return <div onClickCapture={e=>{const link=(e.target as HTMLElement).closest('a');const target=link?.getAttribute('href');if(target?.startsWith('#proof-screen-')){e.preventDefault();setOpened(target.slice('#proof-screen-'.length));}}}>
 {frame&&<Header configuration={configuration}/>}
 <main>{content.kind==='page'?content.sections.filter(s=>!s.hidden).map(s=><div key={s.id} id={s.anchor??s.id} data-proof-item={s.id}>{s.layout?<SectionLayoutView groups={groups} layout={s.layout} background={s.appearance.background} color={s.appearance.text} href={href}/>:s.native?<NativeSection s={s} groups={groups} configuration={configuration}/>:<StandardSection s={s} groups={groups}/>}</div>):content.kind==='card_group'?<SiteSection><Group group={content}/></SiteSection>:<Screen content={content} groups={groups} close={()=>setOpened(null)}/>}</main>
 {frame&&<Footer configuration={configuration}/>}
 {screen?.kind==='screen'&&<Screen content={screen} groups={groups} close={()=>setOpened(null)}/>}
 </div>;
}
