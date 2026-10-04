import {expect,it} from 'vitest';
import {contentSchema} from './contract';
import {feedSchema} from './feeds';
import {withSermons} from './sermons';
import {youtubeEmbedUrl} from '../youtube';
it('uses published feed entries instead of the retired series cards, including an empty feed',()=>{
 const group=contentSchema.parse({kind:'card_group',name:'Series',slug:'series',presentation:'series',description:'',cards:[]});
 if(group.kind!=='card_group')throw Error('fixture');
 const content=feedSchema.parse({kind:'sermon',entryType:'series',title:'Series',description:'old label',image:'/art.webp',date:'2026-10-04',endDate:'2026-10-25',speaker:'',series:'',scripture:'',topics:[],videoUrl:'https://youtube.com/playlist?list=PLexample',audioUrl:'',featured:false});
 if(content.kind!=='sermon')throw Error('fixture');
 const next=withSermons(group,[{id:'40000000-0000-4000-8000-000000000001',content}]);
 expect(next.cards[0].action).toEqual({label:'Watch',kind:'url',value:content.videoUrl});
 expect(next.cards[0].description).toBe('10/4/2026 – 10/25/2026');
 expect(withSermons(next,[]).cards).toEqual([]);
});
it('embeds single videos and playlists without trusting arbitrary hosts',()=>{
 expect(youtubeEmbedUrl('https://youtu.be/abcdefghijk')).toBe('https://www.youtube.com/embed/abcdefghijk');
 expect(youtubeEmbedUrl('https://www.youtube.com/watch?v=abcdefghijk')).toBe('https://www.youtube.com/embed/abcdefghijk');
 expect(youtubeEmbedUrl('https://www.youtube.com/playlist?list=PLexample')).toBe('https://www.youtube.com/embed/videoseries?list=PLexample');
 expect(youtubeEmbedUrl('https://evil.example/?list=PLexample')).toBeNull();
});
