import {test} from 'vitest';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {RichInline,richEditorDocument,richEditorValue} from '../src/lib/proofadmin/rich-text';
import {googleFontUrl} from '../src/lib/proofadmin/typography';
test('existing Gloock brand font remains selectable, stored and rendered',()=>{
 const value='richtext:v1:'+JSON.stringify({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Synthetic brand copy',marks:[{type:'textStyle',attrs:{fontFamily:'Gloock'}}]}]}]});
 assert.match(richEditorValue(richEditorDocument(value)),/Gloock/);
 assert.match(renderToStaticMarkup(createElement(RichInline,{text:value})),/font-family[^>]*Gloock/);
 assert.equal(googleFontUrl('Gloock'),'https://fonts.googleapis.com/css2?family=Gloock&display=swap');
});
