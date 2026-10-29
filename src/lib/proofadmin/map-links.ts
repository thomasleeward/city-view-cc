/** Address-only web embed: callers cannot supply iframe markup, hosts or query parameters. */
export function mapLinks(address: string) {
 const query=address.trim();
 if(!query)return null;
 const embed=new URL('https://maps.google.com/maps');
 embed.search=new URLSearchParams({q:query,output:'embed'}).toString();
 const directions=new URL('https://www.google.com/maps/dir/');
 directions.search=new URLSearchParams({api:'1',destination:query}).toString();
 return {embed:embed.href,directions:directions.href};
}
