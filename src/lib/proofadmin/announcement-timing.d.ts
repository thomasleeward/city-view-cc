type Window={startsAt?:string;endsAt?:string};
export function announcementTiming(enabled:boolean,schedule?:Window,now?:number):'disabled'|'scheduled'|'active'|'expired'|'invalid';
export function nextAnnouncementBoundary(schedule?:Window,now?:number):number|null;
