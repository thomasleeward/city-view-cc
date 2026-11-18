// Portable published-page runtime. Preview messages can only cancel it.
function normalized(path){try{return decodeURIComponent(path).replace(/\/{2,}/g,'/').replace(/\/+$/,'').toLowerCase()||'/';}catch{return '';}}
export function mountTimedRedirect(root,{publishedMode=false}={}){
 if(!publishedMode||!root||root.dataset.redirectPreview==='true')return ()=>{};
 const win=root.ownerDocument.defaultView;
 const href=root.dataset.href,seconds=Number(root.dataset.delaySeconds);
 if(!win||!href||!Number.isInteger(seconds)||seconds<1||seconds>300||/[\\\u0000-\u0020\u007f]/.test(href))return ()=>{};
 let target,current;
 try{target=new URL(href,win.location.href);current=new URL(win.location.href);}catch{return ()=>{};}
 if(!(href.startsWith('/')&&!href.startsWith('//'))&&!href.startsWith('https://'))return ()=>{};
 if(!['https:','http:'].includes(target.protocol)||target.username||target.password)return ()=>{};
 if(target.origin===current.origin&&normalized(target.pathname)===normalized(current.pathname))return ()=>{};
 const status=root.querySelector('[data-redirect-status]'),cancel=root.querySelector('[data-redirect-cancel]');
 if(!status||!cancel)return ()=>{};
 let stopped=false,timer;const deadline=Date.now()+seconds*1000;
 const cleanup=()=>{stopped=true;win.clearInterval(timer);cancel.removeEventListener('click',stop);win.removeEventListener('message',preview);win.removeEventListener('pagehide',cleanup);};
 const stop=()=>{cleanup();status.textContent='Automatic redirect canceled. You can still use Continue.';status.setAttribute('role','status');cancel.hidden=true;};
 const preview=event=>{if(typeof event.data?.type==='string'&&event.data.type.startsWith('proofadmin-preview')){root.dataset.redirectPreview='true';stop();}};
 const tick=()=>{if(stopped)return;const remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));status.textContent=`Continuing in ${remaining} ${remaining===1?'second':'seconds'}.`;if(remaining===0){cleanup();win.location.replace(target.href);}};
 cancel.hidden=false;cancel.addEventListener('click',stop);win.addEventListener('message',preview);win.addEventListener('pagehide',cleanup);timer=win.setInterval(tick,250);tick();return cleanup;
}
