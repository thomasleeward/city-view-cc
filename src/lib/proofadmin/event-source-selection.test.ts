import {test} from 'vitest';
import assert from 'node:assert/strict';
import {readNativeEventSource,nativeEventFeeds,nativeEventSourceSchema} from './native-event-source';
import {eventSourceSettingsSchema,configurationSchema} from './site-configuration';
const event=(provider:'manual'|'planningcenter'='planningcenter')=>({id:'opaque',reference:provider==='manual'?{provider,organizationId:'',sourceId:'61000000-0000-4000-8000-000000000001'}:{provider,organizationId:'org',sourceId:'instance'},featured:false,content:{kind:'event',title:'Public event',description:'',image:'',startsAt:'2030-06-01T12:00:00Z',endsAt:'',timezone:'America/New_York',allDay:false,location:'',actionLabel:'Details',actionUrl:'https://example.com/event'}});
test('native source reads live unfeatured events without cache or provider credentials',async()=>{
 const calls:unknown[][]=[];const fetcher=async(...args:unknown[])=>{calls.push(args);return {ok:true,json:async()=>({mode:'planningcenter',items:[event()]})};};
 const source=await readNativeEventSource('fixture',['one','two'],fetcher as typeof fetch);assert.equal(String(calls[0][0]),'https://login.proofcreatives.com/api/public/event-source/fixture?tagIds=one%2Ctwo');assert.equal((calls[0][1] as RequestInit).cache,'no-store');assert.equal((calls[0][1] as RequestInit).credentials,'omit');assert.equal(nativeEventFeeds(source)[0].id,'instance');assert.equal(source.items[0].featured,false);
});
test('native source rejects mixed providers, stale fallback responses and invalid selectors',async()=>{
 assert.equal(nativeEventSourceSchema.safeParse({mode:'manual',items:[event()]}).success,false);assert.equal(nativeEventFeeds(nativeEventSourceSchema.parse({mode:'manual',items:[event('manual')]}))[0].id,'61000000-0000-4000-8000-000000000001');
 let calls=0;const fail=async()=>{calls++;return new Response(null,{status:503});};await assert.rejects(()=>readNativeEventSource('fixture',undefined,fail as typeof fetch));assert.equal(calls,1);await assert.rejects(()=>readNativeEventSource('../foreign',undefined,fail as typeof fetch));assert.equal(calls,1);
});
test('event source settings are optional for old configuration and strictly validate new fields',()=>{
 for(const mode of ['manual','planningcenter'])assert.equal(eventSourceSettingsSchema.safeParse({mode,timezone:'America/New_York'}).success,true);
 for(const value of [{mode:'both',timezone:'America/New_York'},{mode:'manual',timezone:'Invalid/Nowhere'},{mode:'manual',timezone:'UTC',token:'no'}])assert.equal(eventSourceSettingsSchema.safeParse(value).success,false);
 const old={settings:{church_name:'Fixture',email:'',phone:'',services:'',address:'',city_state_zip:'',footer_tagline:'',instagram:'',youtube:''},navigation:[]};assert.equal(configurationSchema.parse(old).eventSource,undefined);assert.deepEqual(configurationSchema.parse({...old,eventSource:{mode:'manual',timezone:'UTC'}}).eventSource,{mode:'manual',timezone:'UTC'});
});
