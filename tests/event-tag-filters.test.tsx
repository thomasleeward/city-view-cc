import {test} from 'vitest';
import assert from 'node:assert/strict';
import {contentSchema} from '../src/lib/proofadmin/contract';
import {eventQuerySchema} from '../src/lib/proofadmin/event-catalog';
const filter={organizationId:'synthetic-org',tagIds:['women','families']};
function page(tagFilter?:unknown){return {kind:'page',name:'Synthetic',slug:'synthetic',sections:[{id:'section',type:'text',name:'Synthetic',appearance:{},layout:{rows:[{id:'row',columns:[{id:'column',elements:[{id:'events',type:'all_events',...(tagFilter===undefined?{}:{tagFilter})}]}]}]}}]};}
test('per-element Planning Center tags retain organization and multiple IDs without changing default lists',()=>{
 const value=contentSchema.parse(page(filter));assert.equal(value.kind,'page');
 if(value.kind!=='page')throw Error();assert.deepEqual(value.sections[0].layout!.rows[0].columns[0].elements[0],{id:'events',type:'all_events',tagFilter:filter});
 const plain=contentSchema.parse(page());if(plain.kind!=='page')throw Error();assert.equal('tagFilter' in plain.sections[0].layout!.rows[0].columns[0].elements[0],false);
 assert.deepEqual(eventQuerySchema.parse({tagFilter:JSON.stringify(filter)}).tagFilter,filter);
 for(const invalid of [{...filter,tagIds:[]},{...filter,tagIds:['women','women']},{...filter,url:'https://example.com'}])assert.equal(contentSchema.safeParse(page(invalid)).success,false);
});
