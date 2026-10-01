import {it,expect,vi,afterEach} from 'vitest';
vi.mock('server-only',()=>({}));
vi.mock('@/lib/planning-center',()=>({withPlanningCenterBridge:async(fn:()=>unknown)=>fn(),findPlanningCenterPeople:vi.fn(),listPlanningCenterCustomFields:vi.fn().mockResolvedValue([]),syncAssessmentToPlanningCenter:vi.fn()}));
import {POST} from './route';
import {syncAssessmentToPlanningCenter} from '@/lib/planning-center';
const key='a'.repeat(64),ticket={id:'40000000-0000-4000-8000-000000000001',token:'b'.repeat(64)};
function request(auth=true){return new Request('https://city-view.example/api/proofadmin/planning-center',{method:'POST',headers:{Authorization:auth?`Bearer ${key}`:'Bearer wrong'},body:JSON.stringify(ticket)});}
function setup(){vi.stubEnv('CITY_VIEW_ASSESSMENT_KEY',key);vi.stubEnv('PROOFADMIN_ENABLED','true');vi.stubEnv('VERCEL_ENV','preview');}
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();vi.clearAllMocks();});
it('rejects unauthorized and spent job tickets before touching Planning Center',async()=>{
 setup();const fetch=vi.fn().mockResolvedValue(new Response(null,{status:409}));vi.stubGlobal('fetch',fetch);
 expect((await POST(request(false))).status).toBe(401);expect(fetch).not.toHaveBeenCalled();
 expect((await POST(request())).status).toBe(409);expect(syncAssessmentToPlanningCenter).not.toHaveBeenCalled();
});
it('rejects even a valid staff sync ticket in a preview deployment',async()=>{
 setup();vi.stubEnv('PROOFADMIN_PCO_WRITES','true');vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({payload:{operation:'sync',value:{personId:'123',name:'Synthetic',email:'synthetic@example.invalid',assessmentType:'disc',primaryResult:'D',summary:'D',scores:{D:24},selectedResults:['D']}}})));
 expect((await POST(request())).status).toBe(403);expect(syncAssessmentToPlanningCenter).not.toHaveBeenCalled();
});
