// Absent overrides retain the website's own button design. Validate legacy data too.
export function buttonColors(action: { colors?: unknown;appearance?:unknown } | undefined, defaults?:{background?:string;text?:string;outlineText?:string}) {
  const valid=(color:unknown):color is string=>typeof color==='string'&&/^#[0-9a-fA-F]{6}$/.test(color);
  const colors=action?.colors&&typeof action.colors==='object'?action.colors as Record<string,unknown>:{};
  const appearance=action?.appearance&&typeof action.appearance==='object'?action.appearance as Record<string,unknown>:{};
  const outline=appearance.variant==='outline',solid=appearance.variant==='solid';
  const border=outline||valid(appearance.borderColor)||appearance.borderWidth===1||appearance.borderWidth===2;
  return {
    ...(valid(colors.background)?{backgroundColor:colors.background,borderColor:colors.background}:{}),
    ...(valid(colors.text)?{color:colors.text}:{}),
    ...(solid?{backgroundColor:valid(colors.background)?colors.background:defaults?.background??'var(--proof-button-background, #1b1c20)',color:valid(colors.text)?colors.text:defaults?.text??'var(--proof-button-text, #ffffff)'}:{}),
    ...(outline?{color:valid(colors.text)?colors.text:defaults?.outlineText??'inherit'}:{}),
    ...(border?{borderStyle:'solid',borderWidth:appearance.borderWidth===1?1:2,borderColor:valid(appearance.borderColor)?appearance.borderColor:outline?'currentColor':valid(colors.background)?colors.background:'currentColor'}:{}),
    ...(outline?{background:'transparent',backgroundColor:'transparent',backgroundImage:'none'}:{}),
  };
}

// Screen layouts inherit their surface. CSS keywords cannot be swapped as colors:
// using `transparent` for the label makes an otherwise valid new button invisible.
export function layoutButtonColors(action: { colors?: unknown;appearance?:unknown } | undefined, background: string, text: string) {
  const solid = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value);
  return {
    backgroundColor: solid(text) ? text : 'var(--proof-button-background, var(--cms-text, #1b1c20))',
    color: solid(background) ? background : 'var(--proof-button-text, var(--cms-background, #ffffff))',
    ...buttonColors(action,{background:solid(text)?text:'var(--proof-button-background, var(--cms-text, #1b1c20))',text:solid(background)?background:'var(--proof-button-text, var(--cms-background, #ffffff))',outlineText:solid(text)?text:'inherit'}),
  };
}

/** Native renderers keep their exact old style path when every optional leaf is reset. */
export function hasButtonAppearance(action:unknown){if(!action||typeof action!=='object'||!('appearance' in action)||!action.appearance||typeof action.appearance!=='object')return false;return Object.values(action.appearance).some(value=>value!==undefined);}
