import {validBearer} from '@/lib/assessments/bearer';
import {jobTicketSchema,jobPayloadSchema} from '@/lib/assessments/contract';
import {withPlanningCenterBridge,findPlanningCenterPeople,listPlanningCenterCustomFields,syncAssessmentToPlanningCenter} from '@/lib/planning-center';
export const runtime='nodejs';
export const maxDuration=120;
export async function POST(request:Request){
 const headers={'Cache-Control':'private, no-store'};
 const key=process.env.CITY_VIEW_ASSESSMENT_KEY;
 if(process.env.PROOFADMIN_ENABLED!=='true'||!validBearer(request.headers.get('authorization'),key))return Response.json({error:'Unauthorized'},{status:401,headers});
 try{
  const raw=await request.text();if(raw.length>1000)throw Error('Too large');const ticket=jobTicketSchema.parse(JSON.parse(raw));
  // The payload is fetched once from Proof Admin after a verified staff action, never accepted from the caller.
  const response=await fetch('https://login.proofcreatives.com/api/city-view/planning-center/claim',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(ticket),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!response.ok)return Response.json({error:'Expired or already used request'},{status:409,headers});
  const payload=jobPayloadSchema.parse((await response.json()).payload);
  if(payload.operation==='sync'&&(process.env.VERCEL_ENV!=='production'||process.env.PROOFADMIN_PCO_WRITES!=='true'))return Response.json({error:'Planning Center changes are disabled during review'},{status:403,headers});
  const result=await withPlanningCenterBridge(async()=>{
   if(payload.operation==='search')return {people:await findPlanningCenterPeople(payload.query)};
   if(payload.operation==='fields')return {fields:await listPlanningCenterCustomFields()};
   await syncAssessmentToPlanningCenter(payload.value);return {ok:true};
  });
  return Response.json(result,{headers});
 }catch{return Response.json({error:'City View Planning Center request failed'},{status:502,headers});}
}
