import {test} from 'vitest';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {layoutSchema} from '../src/lib/proofadmin/contract';
import {rowSpacing,columnSpacing,layoutSpacingCss} from '../src/lib/proofadmin/layout-spacing';
import {SectionLayoutView} from '../src/lib/proofadmin/section-layout';
const fixture=()=>({gap:32,padding:72,fullWidth:false,rows:[{id:'row',verticalAlign:'top',columns:[{id:'first',elements:[{id:'copy',type:'text',text:'Synthetic spacing copy'}]},{id:'last',elements:[{id:'other',type:'text',text:'Second column'}]}]}]});
const html=(value:ReturnType<typeof layoutSchema.parse>)=>renderToStaticMarkup(createElement(SectionLayoutView,{layout:value,background:'#fff9f2',color:'#252822'}));
test('legacy columns preserve their exact data and emit no spacing override attributes',()=>{
 const grid=layoutSchema.parse(fixture()),before=JSON.stringify(grid);assert.equal(grid.rows[0].spacing,undefined);assert.equal(grid.rows[0].columns[0].padding,undefined);assert.deepEqual(rowSpacing(grid.rows[0],grid.gap),{style:{},attributes:{}});assert.deepEqual(columnSpacing(grid.rows[0].columns[0],0,2),{style:{},attributes:{}});html(grid);assert.equal(JSON.stringify(grid),before);
});
test('the real client renderer preserves row, mobile and individual column spacing',()=>{
 const grid=layoutSchema.parse(fixture());grid.rows[0].spacing={above:64,below:0,gap:40,inset:16,mobile:{above:16,gap:8}};grid.rows[0].columns[0].padding={top:0,left:40,alignToSectionEdge:true,mobile:{top:8,left:16},mobileAlignToSectionEdge:false};grid.rows[0].columns[1].padding={alignToSectionEdge:true};
 const parsed=layoutSchema.parse(grid),rendered=html(parsed);assert.deepEqual(parsed,grid);
 for(const result of [rowSpacing(parsed.rows[0],parsed.gap),columnSpacing(parsed.rows[0].columns[0],0,2),columnSpacing(parsed.rows[0].columns[1],1,2)]){assert.ok(Object.keys(result.attributes).length);for(const [key,value] of Object.entries(result.attributes))assert.ok(rendered.includes(`${key}="${value}"`),key);for(const value of Object.values(result.style))assert.ok(rendered.includes(String(value)),String(value));}
 assert.match(layoutSpacingCss,/@media/);assert.match(layoutSpacingCss,/767px/);
});
test('the client rejects unknown fields, invalid px values and malformed mobile overrides',()=>{
 for(const value of [-1,241,3.5,'24',null]){const grid=fixture();assert.equal(layoutSchema.safeParse({...grid,rows:[{...grid.rows[0],spacing:{above:value}}]}).success,false);assert.equal(layoutSchema.safeParse({...grid,rows:[{...grid.rows[0],columns:[{...grid.rows[0].columns[0],padding:{left:value}}]}]}).success,false);}
 for(const spacing of [{html:'bad'},{mobile:{inset:'40'}},{mobile:{mobile:{above:8}}}]){const grid=fixture();assert.equal(layoutSchema.safeParse({...grid,rows:[{...grid.rows[0],spacing}]}).success,false);}
 const grid=fixture();assert.equal(layoutSchema.safeParse({...grid,rows:[{...grid.rows[0],columns:[{...grid.rows[0].columns[0],padding:{alignToSectionEdge:'true'}}]}]}).success,false);
});
