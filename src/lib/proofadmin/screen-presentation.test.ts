import {it as test} from 'vitest';
import assert from 'node:assert/strict';
import {blockSchema,layoutSchema} from './contract';
import {automaticSurfaceText,layoutPadding,screenBlockPresentation} from './screen-presentation';

const appearance={background:'#f6f1e9',text:'#101820'};
test('separate axes honor zero and legacy padding, and section values override grid spacing',()=>{
 const grid=layoutSchema.parse({padding:48,paddingX:0,paddingY:64,rows:[{id:'row',columns:[{id:'column',elements:[]}]}]});
 assert.deepEqual(layoutPadding(grid),{paddingInline:0,paddingBlock:64});
 const block=blockSchema.parse({id:'block',type:'layout',grid,presentation:{paddingX:48,paddingY:0}});
 const surface=screenBlockPresentation(block,appearance);assert.equal(surface.paddingX,48);assert.equal(surface.paddingY,0);
 assert.equal(screenBlockPresentation(undefined,appearance).paddingX,48);
});
test('background-only sections choose contrast, manual text persists, and default bands preserve media',()=>{
 const dark=blockSchema.parse({id:'block',type:'text',presentation:{background:'#101820'}});
 assert.equal(screenBlockPresentation(dark,appearance).text,'#ffffff');assert.equal(automaticSurfaceText('#faf5e8'),'#000000');
 const manual=blockSchema.parse({...dark,presentation:{...dark.presentation,text:'#faf5e8'}});assert.equal(screenBlockPresentation(manual,appearance).text,'#faf5e8');
 assert.equal(screenBlockPresentation(undefined,appearance).style.backgroundColor,undefined);
 assert.equal(screenBlockPresentation(undefined,appearance).text,appearance.text);
 const before=JSON.stringify(manual);screenBlockPresentation(manual,appearance);assert.equal(JSON.stringify(manual),before);
});
test('invalid spacing, colors and executable presentation fields are rejected',()=>{
 for(const presentation of [{paddingX:-1},{paddingY:161},{paddingX:48.5},{paddingY:'48'},{background:'url(https://bad.example)'},{text:'red'},{css:'body{}'},{html:'<iframe>'}])assert.equal(blockSchema.safeParse({id:'block',type:'text',presentation}).success,false,JSON.stringify(presentation));
 for(const axes of [{paddingX:-1},{paddingY:161},{paddingY:1.5}])assert.equal(layoutSchema.safeParse({rows:[{id:'row',columns:[{id:'column',elements:[]}]}],...axes}).success,false);
});

import {parsePreviewMessage} from './preview-protocol';
test('read-only preview metadata is validated without weakening site/document matching',()=>{
 const message={type:'proofadmin-preview-content',protocol:1,siteId:'site',id:'doc',readOnly:true,content:{kind:'screen',name:'Synthetic',slug:'synthetic',title:'Title',eyebrow:'',intro:'',appearance:{},blocks:[]}};
 assert.equal(parsePreviewMessage(message,'site','doc')?.readOnly,true);
 assert.equal(parsePreviewMessage({...message,readOnly:'yes'},'site','doc'),null);
 assert.equal(parsePreviewMessage(message,'other','doc'),null);
 assert.equal(parsePreviewMessage(message,'site','other'),null);
});
