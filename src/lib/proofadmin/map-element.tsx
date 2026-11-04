import {layoutButtonColors} from './button-colors';
import type {LayoutElement} from './contract';
import {mapLinks} from './map-links';
import './map-element.css';

export function MapElement({element,background,color,directionsClassName='proof-layout-button'}:{element:Extract<LayoutElement,{type:'map'}>;background?:string;color?:string;directionsClassName?:string}) {
 const links=mapLinks(element.address);
 return <div className="proof-map" data-proof-map={element.id}>
  {links?<>
   <iframe className="proof-map-frame" title={`Map of ${element.address}`} src={links.embed} width="100%" height={element.height} style={{height:element.height}} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/>
   {element.showAddress!==false&&<p className="proof-map-address">{element.address}</p>}
   {element.showDirections&&<a className={`proof-map-directions${element.directionsStyle==='button'?` proof-map-directions-button ${directionsClassName}`:''}`} style={element.directionsStyle==='button'?layoutButtonColors(undefined,background??'var(--cms-background, #ffffff)',color??'var(--cms-text, #1b1c20)'):undefined} href={links.directions} target="_blank" rel="noopener noreferrer">Get directions<span className="proof-map-new-tab"> (opens in a new tab)</span></a>}
  </>:<div className="proof-map-placeholder" style={{height:element.height}}>Add an address to show a map.</div>}
 </div>;
}
