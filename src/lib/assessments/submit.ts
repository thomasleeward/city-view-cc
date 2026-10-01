import 'server-only';
import {createHmac} from 'node:crypto';
import {headers} from 'next/headers';
import {scoreSubmission} from './contract';
export async function submitSharedAssessment(value:unknown){
 const key=process.env.CITY_VIEW_ASSESSMENT_KEY;if(!key)throw Error('Assessment saving is not configured');
 const submission=scoreSubmission(value),h=await headers();
 const address=h.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()??'unknown';
 const clientHash=createHmac('sha256',key).update(address).digest('hex');
 const response=await fetch('https://login.proofcreatives.com/api/city-view/assessments',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({submission,clientHash}),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Could not save assessment');
}
