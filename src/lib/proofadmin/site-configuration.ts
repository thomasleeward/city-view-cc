import {z} from 'zod';
import {announcementsSchema,validateAnnouncementPublish} from './announcements-schema';
import {safeUrl,type ContentRecord} from './contract';
const short=z.string().max(300);
const social=z.union([z.literal('#'),z.literal(''),z.url().refine(v=>v.startsWith('https://'),'Use an HTTPS social link.')]);
export const configurationSchema=z.object({
 announcements:announcementsSchema.optional(),
 brandColors:z.array(z.object({name:z.string().trim().min(1).max(60),color:z.string().regex(/^#[\da-f]{6}$/i,'Use a six-digit hex color.')}).strict()).min(1).max(16).optional(),
 settings:z.object({church_name:short.trim().min(1),email:z.union([z.literal(''),z.email()]),phone:short,services:short,address:short,city_state_zip:short,footer_tagline:z.string().max(1000),instagram:social,youtube:social}).strict(),
 navigation:z.array(z.object({id:z.uuid(),label:z.string().trim().min(1).max(80),action_kind:z.enum(['screen','section','page','url']),action_value:z.string().min(1).max(2000),location:z.enum(['header','footer']),group_label:z.string().max(80),sort_order:z.number().int().min(0),is_visible:z.boolean()}).strict().superRefine((n,c)=>{
  if(n.action_kind==='url'?!safeUrl.safeParse(n.action_value).success:!(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/).test(n.action_value))c.addIssue({code:'custom',path:['action_value'],message:'Choose a valid destination.'});
 })).max(60),
}).strict().superRefine((v,c)=>{if(new Set(v.navigation.map(n=>n.id)).size!==v.navigation.length)c.addIssue({code:'custom',path:['navigation'],message:'Menu items must have unique IDs.'});});
export type SiteConfiguration=z.infer<typeof configurationSchema>;
export type ConfigurationRecord={version:number;draft:SiteConfiguration;published:SiteConfiguration|null;updatedAt:string};
export function emptyConfiguration(name:string):ConfigurationRecord{return {version:0,draft:{settings:{church_name:name,email:'',phone:'',services:'',address:'',city_state_zip:'',footer_tagline:'',instagram:'',youtube:''},navigation:[]},published:null,updatedAt:''};}
export function validateConfigurationLinks(value:SiteConfiguration,records:ContentRecord[],published:boolean){
 const docs=records.filter(r=>!r.archived).map(r=>published?r.published:r.draft).filter(c=>c!==null);
 for(const item of value.navigation.filter(n=>n.is_visible)){
  let exists=true;
  if(item.action_kind==='screen'||item.action_kind==='page')exists=docs.some(d=>d.kind===item.action_kind&&d.slug===item.action_value);
  if(item.action_kind==='section')exists=docs.some(d=>d.kind==='page'&&d.slug==='home'&&d.sections.some(s=>!s.hidden&&(s.anchor??s.id)===item.action_value));
  if(!exists)throw Error(`Menu item “${item.label}” needs a ${published?'published ':' '}destination. Update the menu before removing or renaming its destination.`);
 }
}
export function applyConfiguration(current:ConfigurationRecord,version:number,value:unknown,action:'save'|'publish',records:ContentRecord[]):ConfigurationRecord{
 if(current.version!==version)throw Error('These settings changed in another window. Reload before saving.');
 const draft=configurationSchema.parse(value);
 validateConfigurationLinks(draft,records,action==='publish');
 if(action==='publish'&&draft.announcements)validateAnnouncementPublish(draft.announcements);
 return {version:version+1,draft,published:action==='publish'?structuredClone(draft):current.published,updatedAt:new Date().toISOString()};
}

export function applyAnnouncements(current:ConfigurationRecord,version:number,value:unknown,action:'save'|'publish'):ConfigurationRecord {
 if(current.version!==version)throw Error('These settings changed in another window. Reload before saving.');
 const announcements=announcementsSchema.parse(value);
 if(action==='publish')validateAnnouncementPublish(announcements);
 return {...current,version:version+1,draft:{...current.draft,announcements},
  published:action==='publish'?{...(current.published??emptyConfiguration(current.draft.settings.church_name).draft),announcements:structuredClone(announcements)}:current.published,
  updatedAt:new Date().toISOString()};
}
