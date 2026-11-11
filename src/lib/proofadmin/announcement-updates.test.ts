import {it,expect} from 'vitest';
import {createElement} from 'react';import {renderToStaticMarkup} from 'react-dom/server';
import {announcementsSchema,emptyAnnouncements} from '@/lib/proofadmin/announcements-schema';
import {AnnouncementPopupLayout} from '@/lib/proofadmin/announcement-popup-layout';
import {announcementTiming} from '@/lib/proofadmin/announcement-timing.js';
const id='11111111-1111-4111-8111-111111111111';
it('keeps legacy schedules absent and honors inclusive start/exclusive expiry',()=>{expect(announcementsSchema.parse(emptyAnnouncements()).banner).not.toHaveProperty('schedule');const schedule={startsAt:'2030-01-01T12:00:00Z',endsAt:'2030-01-01T13:00:00Z'};expect(announcementTiming(true,schedule,Date.parse(schedule.startsAt))).toBe('active');expect(announcementTiming(true,schedule,Date.parse(schedule.endsAt))).toBe('expired');});
it('renders resolved native Screen links and hides unresolved targets',()=>{const layout={rows:[{id:'row',columns:[{id:'column',elements:[{id,type:'button' as const,action:{kind:'screen' as const,value:id,label:'Visit'}}]}]}],gap:24,padding:0,fullWidth:false};const html=(documents:{id:string;content:{kind:string;slug:string}}[])=>renderToStaticMarkup(createElement(AnnouncementPopupLayout,{layout,documents,background:'#ffffff',text:'#000000'}));expect(html([])).not.toContain('href=');expect(html([{id,content:{kind:'screen',slug:'visit'}}])).toContain('href="/?screen=visit"');});
