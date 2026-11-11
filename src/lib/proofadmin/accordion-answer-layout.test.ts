import {test} from 'vitest';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {layoutSchema} from './contract';
import {SectionLayoutView} from './section-layout';
const answer=()=>({id:'question',title:'Question',body:'Original retained answer',grid:{gap:16,padding:0,fullWidth:false,rows:[{id:'answer-row',columnWidths:'40-60',columns:[{id:'answer-left',elements:[{id:'nested-copy',type:'text',text:'Nested copy'}]},{id:'answer-right',elements:[{id:'nested-photo',type:'image',image:'/cropped-sample.jpg',alt:'Cropped photo'},{id:'nested-cta',type:'button',action:{label:'Details',kind:'screen',value:'screen-id'}}]}]}]}});
const layout=()=>layoutSchema.parse({rows:[{id:'outer-row',columns:[{id:'outer-column',elements:[{id:'questions',type:'accordion',items:[answer()]}]}]}]});
test('bounded answer schema retains body and rejects deeper accordions and colliding IDs',()=>{
 const source=layout(),outer=source.rows[0].columns[0].elements[0];if(outer.type!=='accordion')throw Error();assert.equal(outer.items[0].body,'Original retained answer');
 const duplicate=structuredClone(source);const e=duplicate.rows[0].columns[0].elements[0];if(e.type!=='accordion')throw Error();e.items[0].grid!.rows[0].id='outer-row';assert.equal(layoutSchema.safeParse(duplicate).success,false);
 const deep=answer();deep.grid.rows[0].columns[0].elements=[{id:'nested',type:'accordion',items:[{id:'child',title:'Bad',body:''}]} as never];assert.equal(layoutSchema.safeParse({rows:[{id:'r',columns:[{id:'c',elements:[{id:'a',type:'accordion',items:[deep]}]}]}]}).success,false);
});
test('actual native renderer shows nested photo/text/Screen action and restores retained body when grid is removed',()=>{
 const value=layout();const props={layout:value,background:'#ffffff',color:'#111111'};
 const html=renderToStaticMarkup(createElement(SectionLayoutView,props));assert.match(html,/Cropped photo/);assert.match(html,/cropped-sample.jpg/);assert.match(html,/Nested copy/);assert.match(html,/Details/);assert.doesNotMatch(html,/Original retained answer/);
 const e=value.rows[0].columns[0].elements[0];if(e.type!=='accordion')throw Error();delete e.items[0].grid;
 const restored=renderToStaticMarkup(createElement(SectionLayoutView,props));assert.match(restored,/Original retained answer/);assert.doesNotMatch(restored,/cropped-sample.jpg/);
});

import {readFileSync} from 'node:fs';
test('Link Page styles retain nested answer column ratios',()=>{const css=readFileSync(new URL('./link-page.css',import.meta.url),'utf8');assert.doesNotMatch(css,/\.proof-link-inner \.proof-layout-row\{grid-template-columns:1fr!important\}/);});
