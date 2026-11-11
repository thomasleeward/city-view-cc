import {z} from 'zod';
import {safeUrl,layoutSchema} from './contract';
import {announcementScheduleSchema} from './announcement-schedule';
export const announcementPopupLayoutSchema=layoutSchema.superRefine((layout,ctx)=>{
 if(layout.rows.length!==1||layout.rows[0].columns.length!==1)ctx.addIssue({code:'custom',message:'Pop ups require exactly one row and one column.'});
 for(const row of layout.rows)for(const column of row.columns)for(const element of column.elements)if(!['text','image','video','button'].includes(element.type))ctx.addIssue({code:'custom',message:'Pop ups support text, image, video and button elements only.'});
});
const color=z.string().regex(/^#[\da-f]{6}$/i,'Use a six-digit hex color.');
const destination=z.union([z.literal(''),safeUrl]);
const scope=z.enum(['home','all']);
export const bannerSchema=z.object({schedule:announcementScheduleSchema.optional(),enabled:z.boolean(),text:z.string().max(300).refine(v=>!/[\r\n]/.test(v),'Use a single line of text.'),href:destination,background:color,textColor:color,scope}).strict();
export const popupSchema=z.object({layout:announcementPopupLayoutSchema.optional(),id:z.uuid(),name:z.string().trim().min(1).max(100),enabled:z.boolean(),body:z.string().max(60000),image:z.union([z.literal(''),z.url().max(2000).refine(v=>v.startsWith('https://'),'Use an HTTPS image URL.')]),imageAlt:z.string().max(300),buttonLabel:z.string().max(80),buttonHref:destination,background:color,textColor:color,buttonColor:color,buttonTextColor:color,scope,trigger:z.enum(['auto','exit'])}).strict();
export const announcementsSchema=z.object({banner:bannerSchema,popups:z.array(popupSchema).max(8)}).strict().superRefine((v,c)=>{if(new Set(v.popups.map(p=>p.id)).size!==v.popups.length)c.addIssue({code:'custom',path:['popups'],message:'Pop ups must have unique IDs.'});});
export type Announcements=z.infer<typeof announcementsSchema>;
export type AnnouncementPopup=z.infer<typeof popupSchema>;
export const emptyAnnouncements=():Announcements=>({banner:{enabled:false,text:'',href:'',background:'#1d385a',textColor:'#ffffff',scope:'home'},popups:[]});
export function announcementHasText(value:string):boolean{
 if(!value.startsWith("richtext:v1:"))return Boolean(value.trim());
 try{const text=(node:unknown):string=>{if(!node||typeof node!=="object")return "";const n=node as {type?:string;text?:string;content?:unknown[]};return n.type==="text"&&typeof n.text==="string"?n.text:Array.isArray(n.content)?n.content.map(text).join(""):"";};return Boolean(text(JSON.parse(value.slice(12))).trim());}catch{return false;}
}
export function validateAnnouncementPublish(value:Announcements){
 if(value.banner.enabled&&!value.banner.text.trim())throw Error('Announcement Banner needs text before publishing.');
 for(const p of value.popups.filter(p=>p.enabled)){
  if(p.layout&&!p.layout.rows[0].columns[0].elements.some(e=>e.type==='text'?announcementHasText(e.text):e.type==='image'?Boolean(e.image):e.type==='video'?Boolean(e.source):e.type==='button'?announcementHasText(e.action.label)&&Boolean(e.action.value):false))throw Error(`Pop up “${p.name}” needs visible content before publishing.`);
  if(!p.layout&&!p.body.trim()&&!p.image)throw Error(`Pop up “${p.name}” needs text or an image before publishing.`);
  if(!p.layout&&Boolean(p.buttonLabel.trim())!==Boolean(p.buttonHref))throw Error(`Pop up “${p.name}” needs both a button label and destination.`);
 }
}
