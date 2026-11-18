import {it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {contentSchema,makeSection,type PageContent} from '@/lib/proofadmin/contract';
import {sectionBackgroundSchema,initialSectionBackground} from '@/lib/proofadmin/section-background';
const check=(value:unknown,message='Background integration failed')=>{if(!value)throw Error(message);};
const media=sectionBackgroundSchema.parse({type:'slideshow',slides:[{id:'first',src:'/slide-1.jpg',alt:'First'},{id:'second',src:'/slide-2.jpg',alt:'Second',focalX:25},{id:'third',src:'/slide-3.jpg',alt:''}]});
const section=()=>({...makeSection('hero','hero'),title:'Fixed headline',image:'/legacy-hero.jpg',appearance:{...makeSection('hero','unused').appearance,video:'/videos/legacy.mp4'}});
function page(value=section()):PageContent{const parsed=contentSchema.parse({kind:'page',name:'Synthetic',slug:'home',sections:value.type==='hero'?[value]:[section(),value]});if(parsed.kind!=='page')throw Error('fixture');return parsed;}
import {Website} from '@/lib/proofadmin/renderer';
import {emptyConfiguration} from '@/lib/proofadmin/site-configuration';
const render=(content:PageContent)=>renderToStaticMarkup(createElement(Website,{content,documents:[{id:'synthetic',content}],configuration:emptyConfiguration('Synthetic').draft,frame:false}));
it('keeps old sections on their legacy rendering path and infers media without mutating their stored values',()=>{
 const content=page(),before=JSON.stringify(content),html=render(content);
 check(!html.includes('proof-section-background-host'));
 check(initialSectionBackground(content.sections[0]).type==='video');
 check(JSON.stringify(content)===before);
});
it('renders the selected slideshow with fixed copy and only the first slide loaded in server HTML',()=>{
 const content=page({...section(),backgroundMedia:media}),html=render(content);
 check(html.includes('Fixed headline')&&html.includes('data-type="slideshow"'));
 const images=[...html.matchAll(/<img\b[^>]*data-background-slide[^>]*>/g)].map(m=>m[0]);
 check(images.length===3);check(/\ssrc=/.test(images[0]));check(!/\ssrc=/.test(images[1])&&!/\ssrc=/.test(images[2]));
 check(!html.includes('/legacy-hero.jpg')&&!html.includes('/videos/legacy.mp4'));
 check(html.includes('object-position:25% 50%'));
});
it('uses explicit color-only selection without deleting dormant images or videos',()=>{
 const selected=sectionBackgroundSchema.parse({...media,type:'none',image:{src:'/dormant.jpg'},video:{src:'/videos/dormant.mp4'}});
 const content=page({...section(),backgroundMedia:selected}),before=JSON.stringify(content),html=render(content);
 check(html.includes('data-type="none"'));check(!html.includes('/legacy-hero.jpg')&&!html.includes('/videos/legacy.mp4'));
 check(!html.includes('/dormant.jpg')&&!html.includes('/videos/dormant.mp4'));check(before===JSON.stringify(content));
});
it('supports a video background on an ordinary multi-column layout section',()=>{
 const layout={...makeSection('text','layout'),layout:{rows:[{id:'row',columns:[{id:'left',elements:[]},{id:'right',elements:[]}]}],gap:24,padding:48,fullWidth:false}},video=sectionBackgroundSchema.parse({type:'video',video:{src:'/videos/new.mp4',poster:{src:'/poster.jpg'},mobileFallback:true}});
 const content=page({...layout,title:'Fixed headline',backgroundMedia:video}),html=render(content);
 check(html.includes('data-type="video"')&&html.includes('data-src="/videos/new.mp4"'));
 check(html.includes('poster="/poster.jpg"')&&html.includes('muted=""')&&html.includes('loop=""')&&html.includes('data-mobile-fallback="true"'));
 check(html.includes('data-proof-column'));
});

import {withSectionBackground} from '@/lib/proofadmin/section-background-surface';
it('preserves foreground content while replacing a legacy decorative background',()=>{
 const value={...section(),backgroundMedia:media},before=JSON.stringify(value);
 const html=renderToStaticMarkup(withSectionBackground(createElement('section',{},createElement('img',{src:'/portrait.jpg',alt:'Foreground portrait'}),createElement('div',{className:'hero-overlay'}),createElement('p',{},'Fixed content')),value));
 check(html.includes('/portrait.jpg')&&html.includes('Fixed content'));check(!html.includes('hero-overlay'));check(JSON.stringify(value)===before);
});

import {LinkPageView} from '@/lib/proofadmin/link-page';
it('uses one full-height background on a single-column Link Page without duplicating the media',()=>{
 const content=contentSchema.parse({kind:'page',name:'Links',slug:'links',linkPage:{logo:'',logoAlt:''},sections:[{...makeSection('text','link-section'),backgroundMedia:media,layout:{rows:[{id:'row',columns:[{id:'column',elements:[{id:'copy',type:'text',text:'Link Page copy'}]}]}],gap:24,padding:0,fullWidth:false}}]});
 if(content.kind!=='page')throw Error('fixture');
 const html=renderToStaticMarkup(createElement(LinkPageView,{page:content,name:'Synthetic'}));
 check(html.includes('Link Page copy'));check((html.match(/data-type="slideshow"/g)||[]).length===1);
});

import {NativeSection} from '@/lib/proofadmin/native-sections';
it('uses the selected media on the native City View carousel and retains a native foreground photo',()=>{
 const native={...section(),native:{template:'city-view-home-0' as const,fields:[{id:'headline',label:'Headline',type:'text' as const,value:'Native fixed title'}],groups:[]},backgroundMedia:media};
 const configuration=emptyConfiguration('Synthetic').draft;
 const html=renderToStaticMarkup(createElement(NativeSection,{s:native,configuration,groups:{}}));
 check(html.includes('Native fixed title')&&html.includes('data-type="slideshow"'));check(!html.includes('Show slide 1'));
 const about={...native,native:{template:'city-view-about-1' as const,fields:[{id:'field-1',label:'Portrait',type:'image' as const,value:'/portrait.jpg'}],groups:[]}};
 check(renderToStaticMarkup(createElement(NativeSection,{s:about,configuration,groups:{}})).includes(encodeURIComponent('/portrait.jpg')));
});
