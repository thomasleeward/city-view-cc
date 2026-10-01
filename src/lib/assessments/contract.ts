import {z} from 'zod';
import {discQuestions,discNames,spiritualGiftQuestions,spiritualGiftNames} from './data';
export const CITY_VIEW_ID='10000000-0000-4000-8000-000000000003';
export const submissionSchema=z.object({id:z.uuid(),name:z.string().trim().min(1).max(160),email:z.email().max(254).transform(v=>v.toLowerCase()),assessmentType:z.enum(['disc','spiritual_gifts']),answers:z.record(z.string(),z.number().int())});
// Scores and labels from the browser are intentionally ignored. Keep tie ordering identical to City View.
export function scoreSubmission(value:unknown){
 const input=submissionSchema.parse(value),disc=input.assessmentType==='disc';
 const questions=disc?discQuestions:spiritualGiftQuestions;
 if(Object.keys(input.answers).length!==questions.length||questions.some((_,i)=>!Object.hasOwn(input.answers,String(i))))throw Error('Answer every question.');
 const scores:Record<string,number>=Object.fromEntries(Object.keys(disc?discNames:spiritualGiftNames).map(k=>[k,0]));
 for(let i=0;i<questions.length;i++){
  const answer=input.answers[i];
  if(disc){if(answer<0||answer>3)throw Error('Invalid DISC answer.');scores[discQuestions[i].keys[answer]]++;}
  else {if(answer<1||answer>5)throw Error('Invalid spiritual gifts answer.');scores[spiritualGiftQuestions[i].gift]+=answer;}
 }
 const ranked=Object.keys(scores).sort((a,b)=>scores[b]-scores[a]);
 const selectedResults=disc?ranked.filter(k=>scores[k]===scores[ranked[0]]):ranked.slice(0,3);
 const names:Record<string,string>=disc?discNames:spiritualGiftNames;
 const primaryResult=selectedResults.map(k=>disc?`${names[k]} (${k})`:names[k]).join(disc?' & ':', ');
 return {...input,scores,primaryResult,selectedResults};
}
export const personIdSchema=z.string().regex(/^[1-9][0-9]{0,19}$/);
export const syncPayloadSchema=z.object({personId:personIdSchema,name:z.string().max(160),email:z.email().max(254),assessmentType:z.enum(['disc','spiritual_gifts']),primaryResult:z.string().max(1000),summary:z.string().max(4000),scores:z.record(z.string().max(80),z.number().finite()),selectedResults:z.array(z.string().max(120)).max(20)});
export const jobPayloadSchema=z.discriminatedUnion('operation',[
 z.object({operation:z.literal('search'),query:z.string().trim().min(2).max(254)}),
 z.object({operation:z.literal('fields')}),
 z.object({operation:z.literal('sync'),value:syncPayloadSchema})
]);
export type JobPayload=z.infer<typeof jobPayloadSchema>;
export const jobTicketSchema=z.object({id:z.uuid(),token:z.string().regex(/^[a-f0-9]{64}$/)});
