import {it,expect} from 'vitest';
import {Website} from '@/lib/proofadmin/renderer';
import {emptyConfiguration} from '@/lib/proofadmin/site-configuration';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import {contentSchema,makeSection} from '@/lib/proofadmin/contract';
import {resolveTimedRedirect} from '@/lib/proofadmin/timed-redirect';
import {TimedRedirect} from '@/lib/proofadmin/timed-redirect-view';
const sourceId='11111111-1111-4111-8111-111111111111',targetId='22222222-2222-4222-8222-222222222222';
const source=contentSchema.parse({kind:'page',name:'Synthetic Thanks',slug:'thanks',sections:[makeSection('text','thanks-section')],timedRedirect:{enabled:true,destination:{kind:'page',value:targetId},delaySeconds:10}});
const target=contentSchema.parse({kind:'page',name:'Synthetic Next',slug:'next',group:'welcome',sections:[makeSection('text','next-section')]});
const documents=[{id:sourceId,content:source},{id:targetId,content:target}];
const verify=(condition:unknown)=>{if(!condition)throw Error('Redirect integration failed');};
it('keeps redirect destinations in the canonical public schema and resolves only supplied published pages',()=>{
 if(source.kind!=='page')throw Error('fixture');
 const redirect=resolveTimedRedirect(sourceId,source,documents);
 verify(redirect?.href==='/welcome/next'&&redirect.delaySeconds===10);
 verify(resolveTimedRedirect(sourceId,source,[documents[0]])===null);
 verify(resolveTimedRedirect(sourceId,{...source,timedRedirect:{...source.timedRedirect!,enabled:false}},documents)===null);
});
it('keeps default preview inert and provides an SSR manual link only with explicit published opt-in',()=>{
 const props={href:'/welcome/next',label:'the next page',delaySeconds:10};
 verify(renderToStaticMarkup(createElement(TimedRedirect,props))==='');
 const html=renderToStaticMarkup(createElement(TimedRedirect,{...props,publishedMode:true}));
 verify(html.includes('href="/welcome/next"')&&html.includes('data-delay-seconds="10"')&&html.includes('data-redirect-cancel'));
});
it('passes the opt-in through the actual website renderer while the private preview remains inert',()=>{
 const props={documents,content:source,configuration:emptyConfiguration('Synthetic').draft,frame:false};
 verify(!renderToStaticMarkup(createElement(Website,props)).includes('data-delay-seconds'));
 verify(renderToStaticMarkup(createElement(Website,{...props,publishedMode:true})).includes('data-delay-seconds="10"'));
});
