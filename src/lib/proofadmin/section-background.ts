import {z} from 'zod';
const mediaUrl=z.string().max(2000).refine(value=>{if(!value)return true;if(/[\\\u0000-\u0020\u007f]/.test(value))return false;if(value.startsWith('/')&&!value.startsWith('//'))return true;try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}},'Choose a saved image or a complete HTTPS media URL.');
const mp4=mediaUrl.refine(value=>{if(!value)return true;try{return (value.startsWith('/videos/')||value.startsWith('https://'))&&/\.mp4$/i.test(new URL(value,'https://website.example').pathname);}catch{return false;}},'Choose an MP4 video.');
export const backgroundImageSchema=z.object({src:mediaUrl.default(''),alt:z.string().max(500).default(''),focalX:z.number().min(0).max(100).default(50),focalY:z.number().min(0).max(100).default(50)}).strict();
export const sectionBackgroundSchema=z.object({
 type:z.enum(['none','image','video','slideshow']),
 image:backgroundImageSchema.prefault({}),
 video:z.object({src:mp4.default(''),poster:backgroundImageSchema.prefault({}),mobileFallback:z.boolean().default(false)}).strict().prefault({}),
 slides:z.array(backgroundImageSchema.extend({id:z.string().min(1).max(100)})).max(12).default([]),
 durationSeconds:z.number().int().min(3).max(10).default(5),
 transition:z.enum(['crossfade','ken_burns']).default('crossfade'),
 transitionMs:z.number().int().min(200).max(2000).default(800),
 pauseOnHover:z.boolean().default(false),
}).strict().superRefine((value,ctx)=>{const ids=new Set<string>();value.slides.forEach((slide,index)=>{if(ids.has(slide.id))ctx.addIssue({code:'custom',path:['slides',index,'id'],message:'Slide IDs must be unique.'});ids.add(slide.id);});});
export type SectionBackgroundMedia=z.infer<typeof sectionBackgroundSchema>;
export type BackgroundImage=z.infer<typeof backgroundImageSchema>;
type LegacySection={id?:string;native?:unknown;type:string;image?:string;imageAlt?:string;appearance:{image?:string;video?:string;focalX?:number;focalY?:number};backgroundMedia?:SectionBackgroundMedia};
/** Native template photos and the About hero portrait are foreground content. */
export function sectionImageIsBackground(section:{id?:string;native?:unknown;type:string}){return !section.native&&section.id!=='about-hero'&&['hero','full_bleed'].includes(section.type);}
/** Seed editor controls without rewriting a stored legacy section. Clients may supply their native background image. */
export function initialSectionBackground(section:LegacySection,legacy?:{legacyImage?:string;legacyImageAlt?:string;legacyVideo?:string;legacySlides?:(BackgroundImage&{id:string})[];durationSeconds?:number;transitionMs?:number}):SectionBackgroundMedia{
 if(section.backgroundMedia)return section.backgroundMedia;
 const originalImage=legacy?.legacyImage??(sectionImageIsBackground(section)?section.image:section.appearance.image)??'';
 const cleanImage=(source:string)=>{if(mediaUrl.safeParse(source).success)return source;try{if(/[\\\u0000-\u001f\u007f]/.test(source)||source.startsWith('//'))return '';const url=new URL(source,'https://website.example');if(url.username||url.password||url.protocol!=='https:')return '';const normalized=source.startsWith('/')?url.pathname+url.search+url.hash:url.href;return mediaUrl.safeParse(normalized).success?normalized:'';}catch{return '';}};
 const originalVideo=legacy?.legacyVideo??section.appearance.video??'';
 const candidateVideo=cleanImage(originalVideo),video=mp4.safeParse(candidateVideo).success?candidateVideo:'';
 const slides=(legacy?.legacySlides??[]).map(slide=>({...slide,src:cleanImage(slide.src)}));
 const picture={src:cleanImage(originalImage),alt:legacy?.legacyImageAlt??section.imageAlt??'',focalX:section.appearance.focalX??50,focalY:section.appearance.focalY??50};
 return sectionBackgroundSchema.parse({type:originalVideo?'video':slides.length>=2?'slideshow':originalImage?'image':'none',slides,durationSeconds:legacy?.durationSeconds??5,transitionMs:legacy?.transitionMs??800,image:picture,video:{src:video,poster:picture}});
}
/** Null means preserve the client's legacy renderer exactly, including its layering. */
export function resolveSectionBackground(section:{backgroundMedia?:SectionBackgroundMedia}){return section.backgroundMedia??null;}
/** Responsive variants are available only for supported public Supabase image objects. Other hosts are untouched. */
export function backgroundImageSrcSet(src:string){try{const u=new URL(src);if(u.origin!=='https://lqhgemgmduxhvmfurtob.supabase.co'||!/^\/storage\/v1\/object\/public\/site-media\/[0-9a-f-]{36}\//i.test(u.pathname))return undefined;return [480,768,1280,1920].map(width=>{const target=new URL(u);target.pathname=target.pathname.replace('/object/public/','/render/image/public/');target.searchParams.set('width',String(width));target.searchParams.set('quality','80');target.searchParams.set('resize','contain');return `${target.href} ${width}w`;}).join(', ');}catch{return undefined;}}
