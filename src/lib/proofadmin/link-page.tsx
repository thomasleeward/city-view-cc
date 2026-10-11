import {SectionLayoutView} from './section-layout';
import type {PageContent,GroupContent,ContentAction} from './contract';
import './link-page.css';
export function LinkPageView({page,groups={},logo,name,href}:{page:PageContent;groups?:Record<string,GroupContent>;logo?:string;name:string;href?:(action:ContentAction)=>string}){
 const section=page.sections[0],image=page.linkPage?.logo||logo;
 return <main className="proof-link-page" style={{background:section.appearance.background,color:section.appearance.text}}><div className="proof-link-inner"><a href="/" className="proof-link-logo" aria-label={`${name} home`}>{image?<img src={image} alt={page.linkPage?.logoAlt||name}/>:name}</a>{section.layout&&<SectionLayoutView layout={section.layout} background={section.appearance.background} color={section.appearance.text} groups={groups} href={href}/>}</div></main>;
}
