import {announcementTiming,nextAnnouncementBoundary} from './announcement-timing.js';
const memorySeen=new Set();
/** @param {HTMLElement | null} root */
export function setupAnnouncements(root){
 if(!root)return ()=>{};
 const scheduled=Array.from(root.querySelectorAll('[data-announcement-schedule]'));
 let boundaryTimer;
 const refreshSchedule=()=>{
  clearTimeout(boundaryTimer);let next=Infinity;const now=Date.now();
  for(const item of scheduled){const schedule={...(item.dataset.startsAt?{startsAt:item.dataset.startsAt}:{}),...(item.dataset.endsAt?{endsAt:item.dataset.endsAt}:{})};item.hidden=announcementTiming(true,schedule,now)!=='active';const boundary=nextAnnouncementBoundary(schedule,now);if(boundary!==null)next=Math.min(next,boundary);}
  if(Number.isFinite(next))boundaryTimer=setTimeout(refreshSchedule,Math.min(2147483647,Math.max(1,next-now)));
 };
 refreshSchedule();document.addEventListener('visibilitychange',refreshSchedule);window.addEventListener?.('pageshow',refreshSchedule);
 const dialogs=Array.from(root.querySelectorAll('dialog[data-announcement-id]'));
 let active=null;let previousFocus=null;let stopped=false;
 const timers=[];
 const seen=id=>{try{return sessionStorage.getItem('proof-announcement:'+id)==='seen'||memorySeen.has(id)}catch{return memorySeen.has(id)}};
 const remember=id=>{memorySeen.add(id);try{sessionStorage.setItem('proof-announcement:'+id,'seen')}catch{}};
 const onClose=()=>{active=null;if(previousFocus instanceof HTMLElement&&previousFocus.isConnected)previousFocus.focus();};
 const open=trigger=>{
  if(stopped||active||document.querySelector('dialog[open], [aria-modal="true"]:not([hidden])'))return;
  const dialog=dialogs.find(d=>d.dataset.trigger===trigger&&!seen(d.dataset.announcementId));
  if(!dialog||typeof dialog.showModal!=='function')return;
  previousFocus=document.activeElement;dialog.showModal();active=dialog;remember(dialog.dataset.announcementId);
  dialog.querySelector('[data-announcement-close]')?.focus();
 };
 const click=e=>{const button=e.target.closest?.('[data-announcement-close]');if(button){button.closest('dialog')?.close();return;}if(e.target===active){const box=active.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)active.close();}};
 const exit=e=>{if(e.relatedTarget===null&&e.clientY<=0&&window.matchMedia('(hover: hover) and (pointer: fine)').matches)open('exit');};
 root.addEventListener('click',click);dialogs.forEach(d=>d.addEventListener('close',onClose));
 timers.push(setTimeout(()=>open('auto'),1500));
 timers.push(setTimeout(()=>document.addEventListener('mouseout',exit),2000));
 return ()=>{stopped=true;clearTimeout(boundaryTimer);document.removeEventListener('visibilitychange',refreshSchedule);window.removeEventListener?.('pageshow',refreshSchedule);timers.forEach(clearTimeout);document.removeEventListener('mouseout',exit);root.removeEventListener('click',click);dialogs.forEach(d=>d.removeEventListener('close',onClose));if(active?.open)active.close();};
}
