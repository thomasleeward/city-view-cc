import {test} from 'vitest';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import {layoutSchema,layoutElementSchema,actionSchema} from '../src/lib/proofadmin/contract';
import {SemanticText} from '../src/lib/proofadmin/semantic-text';
import {MapElement} from '../src/lib/proofadmin/map-element';
import {SectionLayoutView} from '../src/lib/proofadmin/section-layout';
import {buttonColors,layoutButtonColors,hasButtonAppearance} from '../src/lib/proofadmin/button-colors';
const action={label:'Visit',kind:'url' as const,value:'/visit',colors:{text:'#5A8473'},appearance:{variant:'outline' as const,borderColor:'#5A8473',borderWidth:2 as const}};
const rich='richtext:v1:'+JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Synthetic copy',marks:[{type:'textStyle',attrs:{fontSize:'48px'}}]}]}]});
const grid=()=>layoutSchema.parse({gap:24,padding:48,rows:[{id:'row',columnWidths:'40-60',verticalAlign:'top',columns:[{id:'left',elements:[{id:'copy',type:'text',text:rich,mobileFontSize:36}]},{id:'right',elements:[{id:'map',type:'map',address:'Synthetic City Hall',height:400,showDirections:false,showAddress:false,directionsStyle:'button'},{id:'cta',type:'button',action}]}]}]});
test('new optional controls round-trip without materializing defaults on old content',()=>{
 const value=grid();assert.equal(value.rows[0].columnWidths,'40-60');assert.equal(value.rows[0].verticalAlign,'top');assert.equal(value.rows[0].columns[0].elements[0].type,'text');
 const old=layoutSchema.parse({rows:[{id:'row',columns:[{id:'column',elements:[{id:'copy',type:'text',text:'Legacy'}]}]}]});assert.equal(old.rows[0].columnWidths,undefined);assert.equal(old.rows[0].verticalAlign,undefined);assert.equal(actionSchema.parse({label:'Go',kind:'url',value:'/'}).appearance,undefined);
 for(const mobileFontSize of [11,97,12.5,'36'])assert.equal(layoutElementSchema.safeParse({id:'copy',type:'text',text:'Copy',mobileFontSize}).success,false);
 for(const appearance of [{variant:'ghost'},{borderColor:'red'},{borderWidth:0},{borderWidth:3},{html:'<script/>'}])assert.equal(actionSchema.safeParse({...action,appearance}).success,false);
 assert.equal(layoutSchema.safeParse({...value,rows:[{...value.rows[0],columnWidths:'20-80'}]}).success,false);
});
test('actual layout renderer uses responsive ratios, nested alignment and all new element settings',()=>{
 const html=renderToStaticMarkup(createElement(SectionLayoutView,{layout:grid(),background:'#FFF9F2',color:'#252822'}));assert.match(html,/--proof-column-widths:minmax\(0,40fr\) minmax\(0,60fr\)/);assert.match(html,/justify-content:flex-start/);assert.match(html,/data-proof-mobile-text-size/);assert.match(html,/font-size:48px/);assert.match(html,/border-width:2px/);assert.match(html,/background:transparent/);assert.match(html,/Map of Synthetic City Hall/);assert.doesNotMatch(html,/class="proof-map-address"/);assert.doesNotMatch(html,/class="proof-map-directions/);
 const three=grid();three.rows[0].columns.push({id:'third',elements:[]});const threeHtml=renderToStaticMarkup(createElement(SectionLayoutView,{layout:three,background:'#FFF9F2',color:'#252822'}));assert.doesNotMatch(threeHtml,/--proof-column-widths:/);assert.equal(three.rows[0].columnWidths,'40-60');
});
test('native text ignores retained mobile sizing while Body preserves desktop marks',()=>{
 const value={id:'copy',type:'text' as const,text:rich,mobileFontSize:36};const body=renderToStaticMarkup(createElement(SemanticText,{element:value}));assert.match(body,/--proof-mobile-font-size:36px/);assert.match(body,/font-size:48px/);
 const native=renderToStaticMarkup(createElement(SemanticText,{element:{...value,textStyle:'heading'}}));assert.doesNotMatch(native,/data-proof-mobile-text-size/);assert.doesNotMatch(native,/font-size:48px/);
});
test('directions button is themed independently of the hidden caption and keeps derived safe links',()=>{
 const html=renderToStaticMarkup(createElement(MapElement,{element:{id:'map',type:'map',address:'Synthetic City Hall',height:400,showDirections:true,showAddress:false,directionsStyle:'button'},background:'#FFF9F2',color:'#252822'}));assert.match(html,/proof-map-directions-button/);assert.match(html,/proof-layout-button/);assert.match(html,/noopener noreferrer/);assert.match(html,/background-color:#252822/);assert.doesNotMatch(html,/proof-map-address/);
});
test('reset appearance preserves native defaults and outline uses effective text color',()=>{
 assert.equal(hasButtonAppearance({appearance:{}}),false);assert.deepEqual(buttonColors(undefined),{});assert.deepEqual(buttonColors({colors:{text:'#5A8473'}}),{color:'#5A8473'});assert.equal(buttonColors({appearance:{variant:'outline'}}).color,'inherit');assert.equal(layoutButtonColors({appearance:{variant:'outline'}},'#FFF9F2','#252822').color,'#252822');assert.equal(layoutButtonColors(action,'#FFF9F2','#252822').backgroundColor,'transparent');
});

test('phone styles stack even with ratio variables and limit custom sizes to phones',()=>{const css=readFileSync(new URL('../src/lib/proofadmin/section-layout.css',import.meta.url),'utf8'),mobile=readFileSync(new URL('../src/lib/proofadmin/semantic-text.css',import.meta.url),'utf8');assert.match(css,/grid-template-columns:var\(--proof-column-widths/);assert.match(css,/@media\(max-width:767px\)/);assert.match(mobile,/@media\(max-width:767px\)\{\[data-proof-mobile-text-size\]/);});

import {contentSchema as parseCardContent} from '../src/lib/proofadmin/contract';
test('nested card outline defaults use the card text surface inside a differently colored section',()=>{
 const group=parseCardContent.parse({kind:'card_group',name:'Synthetic cards',slug:'cards',description:'',cards:[{id:'card',title:'Card',description:'Copy',image:'',imageAlt:'',appearance:{background:'#FFF9F2',text:'#252822'},action:{label:'Visit',kind:'url',value:'/visit',appearance:{variant:'outline'}}}]});if(group.kind!=='card_group')throw Error('group');
 const layout=layoutSchema.parse({rows:[{id:'row',columns:[{id:'column',elements:[{id:'cards',type:'card_group',groupId:'group'}]}]}]});const html=renderToStaticMarkup(createElement(SectionLayoutView,{layout,background:'#252822',color:'#FFF9F2',groups:{group}}));assert.match(html,/<a[^>]+style="[^"]*color:#252822/);assert.match(html,/background:transparent/);
});
