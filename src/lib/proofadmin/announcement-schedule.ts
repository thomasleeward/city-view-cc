import {z} from 'zod';
export {announcementTiming,nextAnnouncementBoundary} from './announcement-timing.js';
const timezone=z.string().min(1).max(100).refine(value=>{try{new Intl.DateTimeFormat('en',{timeZone:value});return true;}catch{return false;}},'Choose a valid IANA time zone.');
const instant=z.iso.datetime({offset:true}).max(100).refine(value=>Number.isFinite(Date.parse(value)),'Choose a valid date and time.');
export const announcementScheduleSchema=z.object({startsAt:instant.optional(),endsAt:instant.optional(),timezone}).strict().superRefine((value,context)=>{
 if(value.startsAt===undefined&&value.endsAt===undefined)context.addIssue({code:'custom',message:'Choose a start or expiry time, or remove the schedule.'});
 if(value.startsAt&&value.endsAt&&Date.parse(value.endsAt)<=Date.parse(value.startsAt))context.addIssue({code:'custom',path:['endsAt'],message:'Expiry must be after the start time.'});
});
export type AnnouncementSchedule=z.infer<typeof announcementScheduleSchema>;
function civilParts(instant:number,zone:string){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(instant);
 return Object.fromEntries(parts.filter(part=>part.type!=='literal').map(part=>[part.type,part.value]));
}
function civilEpoch(year:number,month:number,day:number,hour:number,minute:number,second=0){
 const date=new Date(0);date.setUTCFullYear(year,month-1,day);date.setUTCHours(hour,minute,second,0);return date.getTime();
}
/** Wall-clock value for a datetime-local input, always in the explicitly selected zone. */
export function formatAnnouncementLocalTime(value:string,zone:string){
 timezone.parse(zone);const time=Date.parse(value);if(!Number.isFinite(time))throw Error('Choose a valid date and time.');
 const p=civilParts(time,zone);return `${p.year.padStart(4,'0')}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
/** Zero candidates means a DST gap; two means a repeated hour requiring an explicit choice. */
export function announcementLocalTimeCandidates(value:string,zone:string):string[]{
 timezone.parse(zone);const match=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
 if(!match)throw Error('Choose a complete date and time.');
 const [year,month,day,hour,minute]=match.slice(1).map(Number),wall=civilEpoch(year,month,day,hour,minute),date=new Date(wall);
 if(year<1||month<1||month>12||day<1||hour>23||minute>59||date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)throw Error('Choose a valid date and time.');
 const offsets=new Set<number>();
 for(let hours=-48;hours<=48;hours+=6){const sample=wall+hours*3600000,p=civilParts(sample,zone);offsets.add(civilEpoch(Number(p.year),Number(p.month),Number(p.day),Number(p.hour),Number(p.minute),Number(p.second))-sample);}
 return [...offsets].map(offset=>wall-offset).filter(candidate=>formatAnnouncementLocalTime(new Date(candidate).toISOString(),zone)===value).sort((a,b)=>a-b).map(candidate=>new Date(candidate).toISOString());
}
