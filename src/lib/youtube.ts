export function youtubeEmbedUrl(value:string):string|null {
 try {
  const url=new URL(value);
  if(!['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(url.hostname))return null;
  const list=url.searchParams.get('list');
  if(list&&/^[A-Za-z0-9_-]+$/.test(list))return `https://www.youtube.com/embed/videoseries?list=${list}`;
  const id=url.hostname==='youtu.be'?url.pathname.slice(1):url.pathname==='/watch'?url.searchParams.get('v'):url.pathname.match(/^\/(?:shorts|embed|live)\/([A-Za-z0-9_-]+)/)?.[1];
  return id&&/^[A-Za-z0-9_-]{11}$/.test(id)?`https://www.youtube.com/embed/${id}`:null;
 } catch {return null;}
}
