export function BackgroundVideo({source,poster,overlay='#000000',opacity=0}:{source?:string;poster?:string|null;overlay?:string|null;opacity?:number}) {
  if(!source)return null;
  return <div className="proof-background-video" aria-hidden="true" style={{position:'absolute',inset:0,zIndex:0,pointerEvents:'none',overflow:'hidden'}}>
    <video key={source} src={source} poster={poster||undefined} autoPlay muted loop playsInline preload="metadata" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
    <div style={{position:'absolute',inset:0,backgroundColor:overlay||'#000000',opacity}}/>
  </div>;
}
