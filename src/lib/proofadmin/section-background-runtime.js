/** Portable motion controller. All text/buttons remain outside this background layer. */
export function mountSectionBackground(root){
 if(!root)return ()=>{};
 const doc=root.ownerDocument,win=doc.defaultView;if(!win)return ()=>{};
 const media=win.matchMedia('(prefers-reduced-motion: reduce)'),mobile=win.matchMedia('(max-width: 767px)');
 const slides=Array.from(root.querySelectorAll('[data-background-slide]')),video=root.querySelector('video'),button=root.querySelector('[data-background-toggle]');
 const seconds=Number(root.dataset.durationSeconds),speed=Number(root.dataset.transitionMs);
 if(!['image','video','slideshow','none'].includes(root.dataset.type)||!Number.isInteger(seconds)||seconds<3||seconds>10||!Number.isInteger(speed)||speed<200||speed>2000)return ()=>{};
 let manual=false,pointerHover=false,focusWithin=false,visible=true,index=0,timer,preload,disposed=false,pendingCleanup=()=>{};
 const load=img=>{if(img?.dataset.src&&img.getAttribute('src')!==img.dataset.src){img.src=img.dataset.src;if(img.dataset.srcset)img.srcset=img.dataset.srcset;}};
 const stopTimers=()=>{win.clearInterval(timer);win.clearTimeout(preload);pendingCleanup();pendingCleanup=()=>{};};
 const advance=()=>{
  if(disposed||slides.length<2)return;const next=(index+1)%slides.length,candidate=slides[next];load(candidate);
  const activate=()=>{if(disposed||root.dataset.paused==='true')return;index=next;slides.forEach((slide,i)=>{slide.dataset.active=String(i===index);slide.setAttribute('aria-hidden',String(i!==index));});preload=win.setTimeout(()=>load(slides[(index+1)%slides.length]),Math.max(0,seconds*1000-1000));};
  pendingCleanup();pendingCleanup=()=>{};
  if(candidate.complete===false||candidate.naturalWidth===0){const ready=()=>{pendingCleanup();pendingCleanup=()=>{};const decoded=candidate.decode?.();if(decoded)decoded.then(activate,()=>{});else activate();};const failed=()=>{pendingCleanup();pendingCleanup=()=>{};};candidate.addEventListener('load',ready,{once:true});candidate.addEventListener('error',failed,{once:true});pendingCleanup=()=>{candidate.removeEventListener('load',ready);candidate.removeEventListener('error',failed);};}else activate();
 };
 const refresh=()=>{
  stopTimers();const fallback=media.matches||(root.dataset.mobileFallback==='true'&&mobile.matches);
  const paused=manual||pointerHover||focusWithin||doc.hidden||!visible||media.matches;
  root.dataset.paused=String(paused);root.dataset.reducedMotion=String(media.matches);
  if(media.matches){index=0;slides.forEach((slide,i)=>{slide.dataset.active=String(i===0);slide.setAttribute('aria-hidden',String(i!==0));});}
  if(button){button.hidden=media.matches||root.dataset.type==='none'||root.dataset.type==='image'||(root.dataset.type==='slideshow'&&slides.length<2)||(root.dataset.type==='video'&&(fallback||!video));button.textContent=`${manual?'Play':'Pause'} background ${root.dataset.type==='video'?'video':'slideshow'}`;button.setAttribute('aria-pressed',String(manual));}
  if(video){video.hidden=fallback;video.muted=true;if(fallback||paused){video.pause();}else{if(video.dataset.src&&video.getAttribute('src')!==video.dataset.src)video.src=video.dataset.src;const promise=video.play();promise?.catch(()=>{if(!disposed){manual=true;refresh();}});}}
  if(root.dataset.type==='slideshow'&&!paused&&slides.length>1){preload=win.setTimeout(()=>load(slides[(index+1)%slides.length]),Math.max(0,seconds*1000-1000));timer=win.setInterval(advance,seconds*1000);}
 };
 const toggle=()=>{manual=!manual;refresh();};
 const enter=()=>{if(root.dataset.pauseOnHover==='true'){pointerHover=true;refresh();}};
 const leave=()=>{pointerHover=false;refresh();};
 const focus=event=>{if(event.target===button)return;focusWithin=true;refresh();};
 const blur=event=>{if(event.relatedTarget===button||!host.contains?.(event.relatedTarget)){focusWithin=false;refresh();}};
 const host=root.parentElement??root;
 button?.addEventListener('click',toggle);host.addEventListener('mouseenter',enter);host.addEventListener('mouseleave',leave);host.addEventListener('focusin',focus);host.addEventListener('focusout',blur);
 media.addEventListener('change',refresh);mobile.addEventListener('change',refresh);doc.addEventListener('visibilitychange',refresh);
 let observer;if(win.IntersectionObserver){observer=new win.IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting!==false;refresh();});observer.observe(root);}
 refresh();
 return ()=>{disposed=true;stopTimers();video?.pause();observer?.disconnect();button?.removeEventListener('click',toggle);host.removeEventListener('mouseenter',enter);host.removeEventListener('mouseleave',leave);host.removeEventListener('focusin',focus);host.removeEventListener('focusout',blur);media.removeEventListener('change',refresh);mobile.removeEventListener('change',refresh);doc.removeEventListener('visibilitychange',refresh);};
}
