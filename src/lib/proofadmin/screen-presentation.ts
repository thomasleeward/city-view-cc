import type {CSSProperties} from 'react';
import type {ScreenContent, SectionLayout} from './contract';
type Appearance={background:string;text:string};

export const SCREEN_CONTENT_WIDTH = 1200;
type Block = ScreenContent['blocks'][number];

/** Choose the higher contrast of black and white using WCAG relative luminance. */
export function automaticSurfaceText(background: string) {
  const channels = background.slice(1).match(/../g)?.map(channel => {
    const value = parseInt(channel, 16) / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  });
  if (!/^#[\da-f]{6}$/i.test(background) || !channels) return '#000000';
  const luminance = channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  return (luminance + .05) / .05 >= 1.05 / (luminance + .05) ? '#000000' : '#ffffff';
}

export function layoutPadding(layout: SectionLayout) {
  return {paddingInline: layout.paddingX ?? layout.padding, paddingBlock: layout.paddingY ?? layout.padding};
}

/** One band owns spacing and its surface; nested rows/columns add no inset. */
export function screenBlockPresentation(block: Pick<Block,'presentation'|'grid'> | undefined, appearance: Pick<Appearance,'background'|'text'>) {
  const presentation = block?.presentation;
  const background = presentation?.background ?? appearance.background;
  const text = presentation?.text ?? (presentation?.background ? automaticSurfaceText(background) : appearance.text);
  const paddingX = presentation?.paddingX ?? block?.grid?.paddingX ?? block?.grid?.padding ?? 48;
  const paddingY = presentation?.paddingY ?? block?.grid?.paddingY ?? block?.grid?.padding ?? 48;
  const style = {backgroundColor: presentation?.background, color: text, '--proof-screen-padding-x': `${paddingX}px`, '--proof-screen-padding-y': `${paddingY}px`} as CSSProperties;
  return {background, text, paddingX, paddingY, style, innerStyle: {maxWidth: block?.grid?.fullWidth ? 'none' : 'var(--proof-screen-content-width,1200px)'} as CSSProperties};
}

