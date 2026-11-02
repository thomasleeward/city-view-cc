import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {layoutSchema} from '../src/lib/proofadmin/contract';
import {semanticTextValue} from '../src/lib/proofadmin/text-styles';
import {SemanticText} from '../src/lib/proofadmin/semantic-text';
import {SectionLayoutView} from '../src/lib/proofadmin/section-layout';
const rich='richtext:v1:'+JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'What we',marks:[{type:'textStyle',attrs:{fontSize:'48px',fontFamily:'Inter',color:'#123456'}},{type:'bold'}]},{type:'hardBreak'},{type:'text',text:'value.',marks:[{type:'textStyle',attrs:{fontSize:'48px',fontFamily:'Cormorant Garamond',color:'#4568a1'}},{type:'italic'},{type:'link',attrs:{href:'https://example.com/values'}}]}]},{type:'paragraph',content:[{type:'text',text:'Together'}]}]});
const layout=(elements:unknown[])=>layoutSchema.parse({gap:24,padding:48,rows:[{id:'row',columns:[{id:'column',elements}]}]});
test('native presets preserve source and Body restores exact manual formatting',()=>{
 const original=rich;const view=semanticTextValue(rich,'heading');assert.equal(rich,original);assert.equal(semanticTextValue(rich,undefined),original);assert.equal(semanticTextValue(rich,'body'),original);
 assert.doesNotMatch(view,/fontSize|fontFamily|#4568a1/);assert.match(view,/#123456/);assert.match(view,/italic|https:\/\/example.com\/values/);
 const doc=JSON.parse(view.slice('richtext:v1:'.length));assert.equal(doc.content.length,1);assert.equal(doc.content[0].content.filter((n:{type:string})=>n.type==='hardBreak').length,2);
 assert.match(semanticTextValue(rich,'eyebrow'),/#4568a1/);
});
test('actual renderer emits native semantic tags and hard breaks without nested paragraphs',()=>{
 const element={id:'heading',type:'text' as const,text:rich,textStyle:'heading' as const};
 const html=renderToStaticMarkup(createElement(SemanticText,{element}));assert.match(html,/cms-layout-text-heading/);assert.match(html,/<h2/);assert.match(html,/<br\s*\/?\s*>/);assert.doesNotMatch(html,/<p[ >]|font-size:48px|#4568a1/);assert.match(html,/<em/);assert.match(html,/href="https:\/\/example.com\/values"/);
 assert.match(renderToStaticMarkup(createElement(SemanticText,{element:{...element,textStyle:'hero_heading'}})),/<h1/);
 assert.match(renderToStaticMarkup(createElement(SemanticText,{element:{...element,textStyle:'eyebrow'}})),/data-proof-text-style="eyebrow"/);
 assert.match(renderToStaticMarkup(createElement(SemanticText,{element:{...element,textStyle:'body'}})),/font-size:48px/);
});
test('actual row renderer retains optional roles and rejects executable style choices',()=>{
 const grid=layout([{id:'text',type:'text',text:rich,textStyle:'heading'}]);const before=JSON.stringify(grid);const html=renderToStaticMarkup(createElement(SectionLayoutView,{layout:grid,background:'#1d3456',color:'#ffffff',accent:'#ffd05a'}));assert.match(html,/data-proof-text-style="heading"/);assert.equal(JSON.stringify(grid),before);
 assert.throws(()=>layout([{id:'text',type:'text',text:rich,textStyle:'<script>'}]));assert.equal('textStyle'in layout([{id:'text',type:'text',text:rich}]).rows[0].columns[0].elements[0],false);
});
test('accordion Heading is an optional label skin and preserves native disclosure behavior',()=>{
 const grid=layout([{id:'faq',type:'accordion',labelStyle:'heading',items:[{id:'question',title:'A question?',body:'Editable answer'}],openFirst:true}]);const html=renderToStaticMarkup(createElement(SectionLayoutView,{layout:grid,background:'#1d3456',color:'#ffffff',accent:'#ffd05a'}));assert.match(html,/proof-accordion-label-heading/);assert.match(html,/<summary/);assert.match(html,/<details[^>]*open/);assert.throws(()=>layout([{id:'faq',type:'accordion',labelStyle:'giant',items:[{id:'question',title:'A question?',body:'Answer'}]}]));
});
