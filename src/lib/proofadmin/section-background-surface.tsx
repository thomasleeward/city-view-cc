import './section-background-client.css';
import {Children,cloneElement,isValidElement,type CSSProperties,type ReactElement,type ReactNode} from 'react';
import {SectionBackground} from './section-background-view';
import type {SectionBackgroundMedia} from './section-background';
export type BackgroundSection={id?:string;anchor?:string;backgroundMedia?:SectionBackgroundMedia;appearance:{background:string;text?:string;overlay:string;opacity:number}};
type ElementProps={children?:ReactNode;className?:string;style?:CSSProperties;id?:string;'data-content-section'?:string;'data-proof-section'?:string};
function legacyVisual(node:ReactNode,types:unknown[]){
 if(!isValidElement<ElementProps>(node))return false;
 if(types.includes(node.type))return true;
 const name=node.props.className??'';
 if(/(?:^|\s)(?:hero-image|hero-overlay|hero-shade|cms-layout-background|cms-background-video|proof-background-video)(?:\s|$)/.test(name))return true;
 return /(?:^|\s)absolute(?:\s|$)/.test(name)&&/(?:^|\s)inset-0(?:\s|$)/.test(name)&&Boolean(node.props.style?.backgroundImage||node.props.style?.backgroundColor||/(?:^|\s)bg-(?:gradient|green)/.test(name)||node.type==='video');
}
/** Enhances an actual section surface. Absent metadata returns the original tree. */
export function withSectionBackground(node:ReactNode,section:BackgroundSection,legacyTypes:unknown[]=[]):ReactNode{
 if(!section.backgroundMedia||!isValidElement<ElementProps>(node)||typeof node.type!=='string')return node;
 const children=Children.toArray(node.props.children).filter(child=>!legacyVisual(child,legacyTypes));
 return cloneElement(node as ReactElement<ElementProps>,{className:[node.props.className,'proof-section-background-host'].filter(Boolean).join(' '),style:{...node.props.style,backgroundColor:section.appearance.background,backgroundImage:'none'},'data-proof-section':node.props['data-proof-section']??section.id},<SectionBackground key="proof-section-background" media={section.backgroundMedia} overlay={section.appearance.overlay} opacity={section.appearance.opacity}/>,...children);
}
/** Native template trees identify their real section roots before render. */
export function sectionBackgroundTree(node:ReactNode,sections:BackgroundSection[],legacyTypes:unknown[]=[]):ReactNode{
 const enabled=sections.filter(s=>s.backgroundMedia);if(!enabled.length)return node;
 const lookup=new Map(enabled.flatMap(section=>[section.id,section.anchor].filter((id):id is string=>Boolean(id)).map(id=>[id,section] as const)));
 function visit(value:ReactNode):ReactNode{
  if(!isValidElement<ElementProps>(value))return value;
  const id=value.props['data-proof-section']??value.props['data-content-section']??value.props.id;
  const selected=id?lookup.get(id):undefined;
  if(selected&&typeof value.type==='string')return withSectionBackground(value,selected,legacyTypes);
  if(value.props.children===undefined)return value;
  return cloneElement(value as ReactElement<ElementProps>,{},Children.map(value.props.children,visit));
 }
 return Children.map(node,visit);
}
