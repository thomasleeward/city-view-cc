import {it as test} from 'vitest';
import assert from 'node:assert/strict';
import {layoutSchema} from './contract';
const accordion={id:'accordion',type:'accordion',items:[{id:'q1',title:'Question one',body:'An **editable** answer.'},{id:'q2',title:'Question two',body:''}]};
const layout={gap:24,padding:48,fullWidth:false,rows:[{id:'row',columns:[{id:'left',elements:[{id:'intro',type:'text',text:'Keep this'}]},{id:'right',elements:[accordion]}]}]};
test('accepts accordion items in a multi-column layout with backward-compatible defaults',()=>{
 const parsed=layoutSchema.parse(layout),element=parsed.rows[0].columns[1].elements[0];
 assert.equal(element.type,'accordion');if(element.type!=='accordion')throw Error('Wrong element');
 assert.equal(element.allowMultiple,false);assert.equal(element.openFirst,false);
 assert.equal(element.items[0].body,'An **editable** answer.');
 assert.deepEqual(parsed.rows[0].columns[0].elements,layout.rows[0].columns[0].elements);
 const plain=structuredClone(layout);plain.rows[0].columns[1].elements=[];
 assert.ok(layoutSchema.safeParse(plain).success);
});
test('rejects invalid accordion content and identifiers colliding with other layout nodes',()=>{
 for(const patch of [{items:[]},{items:Array.from({length:21},(_,i)=>({...accordion.items[0],id:`q${i}`}))},{items:[{...accordion.items[0],title:' '}]},{items:[{...accordion.items[0],title:'richtext:v1:{}'}]},{items:[{...accordion.items[0],id:'right'}]},{items:[{...accordion.items[0],body:'x'.repeat(12001)}]},{items:[{...accordion.items[0],html:'<script>bad</script>'}]},{allowMultiple:'yes'},{openFirst:1},{css:'body{display:none}'}]){
  const candidate=structuredClone(layout) as unknown as {rows:{columns:{elements:unknown[]}[]}[]};
  candidate.rows[0].columns[1].elements=[{...accordion,...patch}];
  assert.equal(layoutSchema.safeParse(candidate).success,false,JSON.stringify(Object.keys(patch)));
 }
});
