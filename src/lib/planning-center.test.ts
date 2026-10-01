import {it,expect,vi,afterEach} from 'vitest';
vi.mock('server-only',()=>({}));
import {withPlanningCenterBridge,findPlanningCenterPeople,listPlanningCenterCustomFields,syncAssessmentToPlanningCenter} from './planning-center';
const value={personId:'123',name:'Synthetic',email:'synthetic@example.invalid',assessmentType:'disc' as const,primaryResult:'Dominance (D)',summary:'Synthetic summary',scores:{D:24,I:0,S:0,C:0},selectedResults:['D']};
function configured(env='preview'){vi.stubEnv('VERCEL_ENV',env);vi.stubEnv('PROOFADMIN_ENABLED','true');vi.stubEnv('PLANNING_CENTER_APP_ID','fixture-id');vi.stubEnv('PLANNING_CENTER_SECRET','fixture-secret');}
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
it('blocks legacy callers in shared mode but allows explicit bridge reads',async()=>{
 configured();const fetch=vi.fn().mockResolvedValue(Response.json({data:[]}));vi.stubGlobal('fetch',fetch);
 await expect(findPlanningCenterPeople('synthetic')).rejects.toThrow(/not configured/);expect(fetch).not.toHaveBeenCalled();
 await expect(withPlanningCenterBridge(()=>findPlanningCenterPeople('synthetic'))).resolves.toEqual([]);expect(fetch).toHaveBeenCalledTimes(1);
});
it('prevents credentials from following an untrusted pagination URL',async()=>{
 configured();const fetch=vi.fn().mockResolvedValue(Response.json({data:[],links:{next:'https://example.invalid/people/v2/field_definitions'}}));vi.stubGlobal('fetch',fetch);
 await expect(withPlanningCenterBridge(listPlanningCenterCustomFields)).rejects.toThrow(/Invalid Planning Center URL/);expect(fetch).toHaveBeenCalledTimes(1);
});
it('does not allow preview requests to modify Planning Center',async()=>{
 configured();const fetch=vi.fn().mockResolvedValue(Response.json({data:[]}));vi.stubGlobal('fetch',fetch);
 await expect(withPlanningCenterBridge(()=>syncAssessmentToPlanningCenter(value))).rejects.toThrow(/writes are disabled/);
 expect(fetch.mock.calls.every(([,init])=>!init.method||init.method==='GET')).toBe(true);
});
it('retains City View DISC field mappings with synthetic mocked requests',async()=>{
 configured('production');const writes:{field_definition_id:string;value:string}[]=[];vi.stubGlobal('fetch',vi.fn(async(_url,init)=>{if(init.method==='POST')writes.push(JSON.parse(init.body).data.attributes);return Response.json({data:[]});}));
 await withPlanningCenterBridge(()=>syncAssessmentToPlanningCenter(value));
 expect(writes).toEqual(expect.arrayContaining([{field_definition_id:'1064952',value:'Dominance (D)'},{field_definition_id:'1064953',value:'24'},{field_definition_id:'1064954',value:'0'},{field_definition_id:'1064955',value:'0'},{field_definition_id:'1064956',value:'0'}]));expect(writes).toHaveLength(5);
});
