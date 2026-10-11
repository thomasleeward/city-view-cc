export const googleFonts = ['Archivo','Barlow','Bebas Neue','Bitter','Bodoni Moda','Cabin','Cormorant Garamond','DM Sans','DM Serif Display','Figtree','Fraunces','IBM Plex Sans','Inter','Josefin Sans','Lato','Libre Baskerville','Lora','Manrope','Merriweather','Montserrat','Nunito Sans','Open Sans','Oswald','Outfit','Playfair Display','Plus Jakarta Sans','Poppins','Raleway','Roboto','Roboto Slab','Source Sans 3','Space Grotesk','Work Sans'] as const;
export type GoogleFont = typeof googleFonts[number];
export type Typography = {heading?:GoogleFont|'';body?:GoogleFont|''};
export function isGoogleFont(value:unknown):value is GoogleFont {return typeof value==='string'&&(googleFonts as readonly string[]).includes(value);}
export function fontStack(value:unknown){return isGoogleFont(value)?`"${value}", sans-serif`:undefined;}
export function googleFontUrl(value:unknown){return isGoogleFont(value)?`https://fonts.googleapis.com/css2?family=${encodeURIComponent(value).replaceAll('%20','+')}${['Bebas Neue','DM Serif Display'].includes(value)?'':':wght@400;700'}&display=swap`:undefined;}
export function typographyCss(value?:Typography){
 const body=fontStack(value?.body),heading=fontStack(value?.heading);
 return (body?`body{--font-body:${body};--font-sans:${body};font-family:${body}!important}body p,body li,body nav,body a,body button,body input,body select,body textarea,body .font-body,body .font-sans,body .eyebrow{font-family:${body}}`:'')+(heading?`body h1,body h2,body h3,body h4,body h5,body h6,body .display,body .font-display,body .font-serif{font-family:${heading}!important}`:'');
}
