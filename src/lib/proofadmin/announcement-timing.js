/** @param {{startsAt?: string, endsAt?: string} | undefined} schedule */
function bounds(schedule){
 if(!schedule)return null;
 const start=schedule.startsAt===undefined?-Infinity:Date.parse(schedule.startsAt);
 const end=schedule.endsAt===undefined?Infinity:Date.parse(schedule.endsAt);
 if((schedule.startsAt===undefined&&schedule.endsAt===undefined)||Number.isNaN(start)||Number.isNaN(end)||end<=start)return false;
 return {start,end};
}
/** Shared by dynamic and static announcement renderers. Start inclusive, expiry exclusive.
 * @param {boolean} enabled
 * @param {{startsAt?: string, endsAt?: string} | undefined} schedule
 * @param {number} [now]
 * @returns {'disabled'|'scheduled'|'active'|'expired'|'invalid'}
 */
export function announcementTiming(enabled,schedule,now=Date.now()){
 if(!enabled)return 'disabled';
 const window=bounds(schedule);
 if(window===false||!Number.isFinite(now))return 'invalid';
 if(!window)return 'active';
 return now<window.start?'scheduled':now>=window.end?'expired':'active';
}
/** @param {{startsAt?: string, endsAt?: string} | undefined} schedule @param {number} [now] */
export function nextAnnouncementBoundary(schedule,now=Date.now()){
 const window=bounds(schedule);
 if(!window||!Number.isFinite(now))return null;
 const next=Math.min(...[window.start,window.end].filter(time=>Number.isFinite(time)&&time>now));
 return Number.isFinite(next)?next:null;
}
