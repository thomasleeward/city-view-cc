import type {LayoutElement} from './contract';
import {mapLinks} from './map-links';
import './map-element.css';

export function MapElement({element}:{element:Extract<LayoutElement,{type:'map'}>}) {
 const links=mapLinks(element.address);
 return <div className="proof-map" data-proof-map={element.id}>
  {links?<>
   <iframe className="proof-map-frame" title={`Map of ${element.address}`} src={links.embed} width="100%" height={element.height} style={{height:element.height}} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/>
   <p className="proof-map-address">{element.address}</p>
   {element.showDirections&&<a className="proof-map-directions" href={links.directions} target="_blank" rel="noopener noreferrer">Get directions<span className="proof-map-new-tab"> (opens in a new tab)</span></a>}
  </>:<div className="proof-map-placeholder" style={{height:element.height}}>Add an address to show a map.</div>}
 </div>;
}
