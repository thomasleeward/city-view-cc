import { z } from "zod";
import { isReservedRoutePath } from "./routes";

// Structured rich text includes paragraph and formatting metadata as well as copy.
const text = z
  .string()
  .max(60000)
  .refine(
    (value) => value.startsWith("richtext:v1:") || value.length <= 12000,
    "Text must be 12,000 characters or fewer.",
  );
const label = z.string().trim().min(1).max(160);
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const safeUrl = z
  .string()
  .max(2000)
  .refine((value) => {
    if (!value) return true;
    if (
      value.includes("\\") ||
      Array.from(value).some((character) => character.charCodeAt(0) <= 32)
    )
      return false;
    if (value.startsWith("/") && !value.startsWith("//")) return true;
    if (/^#[a-zA-Z][\w-]*$/.test(value)) return true;
    try {
      return ["https:", "mailto:", "tel:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Use a website path, HTTPS address, email link, or phone link.");
export const imageUrl = safeUrl.refine(
  (value) => !value || value.startsWith("/") || value.startsWith("https://"),
  "Choose an image or enter an HTTPS image URL.",
);
export const videoUrl = z.string().max(2000).refine(value => {
  if (!value) return true;
  if (!safeUrl.safeParse(value).success || !(value.startsWith('/videos/') || value.startsWith('https://'))) return false;
  try { return /\.mp4$/i.test(new URL(value, 'https://website.example').pathname); } catch { return false; }
}, 'Upload an MP4 video, choose a saved video, or enter an HTTPS MP4 URL.');
export const appearanceSchema = z.object({
  background: color.default("#f5f1e9"),
  text: color.default("#1b1c20"),
  accent: color.default("#ff8575"),
  image: imageUrl.default(""),
  video: videoUrl.default(""),
  overlay: color.default("#000000"),
  opacity: z.number().min(0).max(1).default(0),
  focalX: z.number().min(0).max(100).default(50),
  focalY: z.number().min(0).max(100).default(50),
});
export const actionSchema = z
  .object({
    label: text,
    colors: z.object({ background: color.optional(), text: color.optional() }).optional(),
    kind: z.enum(["url", "screen"]),
    value: z.string().max(2000),
  })
  .superRefine((action, ctx) => {
    if (action.kind === "screen" && !id.safeParse(action.value).success)
      ctx.addIssue({
        code: "custom",
        message: "Choose a Screen.",
        path: ["value"],
      });
    if (action.kind === "url" && !safeUrl.safeParse(action.value).success)
      ctx.addIssue({
        code: "custom",
        message:
          "Use a website path, HTTPS address, email link, or phone link.",
        path: ["value"],
      });
  });
export const cardSchema = z.object({
  id,
  title: text,
  description: text,
  image: imageUrl,
  imageAlt: z.string().max(500),
  appearance: appearanceSchema,
  action: actionSchema,
  compactTitle: z.boolean().default(false),
  subtitle: text.optional(),
  details: z.array(text).max(20).optional(),
  hidden: z.boolean().optional(),
  video: imageUrl.optional(),
  seriesDates: z.object({start: z.union([z.literal(''),z.iso.date()]), end: z.union([z.literal(''),z.iso.date()])}).strict().optional(),
});
export const sectionTypes = [
  "hero",
  "intro",
  "visit",
  "card_group",
  "pathway",
  "events",
  "sermon",
  "cta",
  "text",
  "image_left",
  "image_right",
  "full_bleed",
  "pastors",
  "marquee",
] as const;
export const nativeGroupPresentation:Record<string,string>={'slideshow':'slides','sermon-series':'series','ministries':'ministries','team':'team','beliefs':'beliefs','connect-groups':'groups','serve-teams':'teams','gospel':'beliefs'};
export const nativeSectionSchema = z.object({
  template: z.enum(['city-view-home-0','city-view-home-1','city-view-home-2','city-view-home-3','city-view-home-4','city-view-home-5','city-view-about-0','city-view-about-1','city-view-about-2','city-view-about-3','city-view-get-connected-0','city-view-get-connected-1','city-view-get-connected-2','city-view-get-connected-3','city-view-get-connected-4','city-view-get-connected-5','city-view-sermon-archive-0','city-view-sermon-archive-1']),
  fields: z.array(z.object({id, label, type: z.enum(['text','richtext','image','url']), value: text}).strict().superRefine((v,c)=>{
    if((v.type==='url'&&!safeUrl.safeParse(v.value).success)||(v.type==='image'&&!imageUrl.safeParse(v.value).success)) c.addIssue({code:'custom',path:['value'],message:'Enter a valid image or link address.'});
  })).max(60),
  groups: z.array(z.object({key:id,label,id}).strict()).max(10),
}).strict();
export const layoutElementSchema = z.discriminatedUnion("type", [
  z.object({id,type:z.literal("video"),source:videoUrl, label:z.string().max(500).default("")}).strict(),
  z.object({id,type:z.literal("card_group"),groupId:z.string().max(100)}).strict(),
  z.object({id, type:z.literal("text"), text}).strict(),
  z.object({id, type:z.literal("image"), image:imageUrl, alt:z.string().max(500), fill:z.boolean().default(false), focalX:z.number().min(0).max(100).default(50), focalY:z.number().min(0).max(100).default(50)}).strict(),
  z.object({id, type:z.literal("button"), alignment:z.enum(["left","center","right"]).optional(), action:actionSchema}).strict(),
]);
export const layoutSchema = z.object({
  rows:z.array(z.object({id, columns:z.array(z.object({id, elements:z.array(layoutElementSchema).max(20)}).strict()).min(1).max(6)}).strict()).min(1).max(20),
  gap:z.number().int().min(0).max(80).default(24),
  padding:z.number().int().min(0).max(160).default(48),
  fullWidth:z.boolean().default(false),
}).strict().superRefine((layout,ctx)=>{
  const ids=layout.rows.flatMap(row=>[row.id,...row.columns.flatMap(column=>[column.id,...column.elements.map(element=>element.id)])]);
  if(new Set(ids).size!==ids.length)ctx.addIssue({code:"custom",message:"Rows, columns and elements must have unique IDs."});
});
export type SectionLayout = z.infer<typeof layoutSchema>;
export type LayoutElement = z.infer<typeof layoutElementSchema>;

export const blockSchema = z.object({
  id,
  grid: layoutSchema.optional(),
  showAction: z.boolean().optional(),
  type: z.enum([
    "layout",
    "text",
    "heading",
    "list",
    "callout",
    "feature",
    "image",
    "button",
    "card_group",
    "spacer",
  ]),
  layout: z
    .enum(["plain", "lead", "card", "image-left", "image-right"])
    .default("plain"),
  text: text.default(""),
  image: imageUrl.default(""),
  alt: z.string().max(500).default(""),
  caption: text.default(""),
  groupId: z.string().max(100).default(""),
  size: z.number().int().min(16).max(240).default(64),
  action: actionSchema.default({
    label: "Learn more",
    kind: "url",
    value: "/",
  }),
}).superRefine((block,ctx)=>{if(block.type==='layout'&&!block.grid)ctx.addIssue({code:'custom',message:'A layout section needs rows and columns.'});if(block.grid&&block.type!=='layout')ctx.addIssue({code:'custom',message:'Rows and columns require a layout section.'});});

export const sectionSchema = z.object({
  layout: layoutSchema.optional(),
  native: nativeSectionSchema.optional(),
  id,
  type: z.enum(sectionTypes),
  anchor: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/).max(100).optional(),
  details: z.object({
    names: text.optional(),
    quote: text.optional(),
    serviceTimes: z.union([text, z.array(text).max(20)]).optional(),
    location: text.optional(),
    marqueeText: text.optional(),
    speaker: text.optional(),
    panelBackground: color.optional(),
    panelText: color.optional(),
  }).strict().optional(),
  name: label,
  hidden: z.boolean().default(false),
  eyebrow: text.default(""),
  title: text.default(""),
  body: text.default(""),
  image: imageUrl.default(""),
  imageAlt: z.string().max(500).default(""),
  appearance: appearanceSchema,
  appearanceCustomized: z.boolean().default(false),
  buttons: z.array(actionSchema).max(3).default([]),
  facts: z.array(text).max(8).default([]),
  groupId: z.string().max(100).default(""),
  items: z
    .array(z.object({ title: text, body: text, action: actionSchema, color }))
    .max(8)
    .default([]),
});
const common = {
  name: label,
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(100),
};
export const editablePageSlugs = ["home"] as const;
export const pageGroups: { slug: string; name: string }[] = [];
export const pageGroupSchema = z.object({
  name: label,
  slug: common.slug.refine(
    (slug) =>
      slug !== "all" &&
      (slug === "missionary" || !isReservedRoutePath(`/${slug}`)),
    "That group URL is reserved. Choose another.",
  ),
});
export type PageGroup = z.infer<typeof pageGroupSchema>;
export const contentSchema = z
  .discriminatedUnion("kind", [
    z.object({
      ...common,
      kind: z.literal("page"),
      description: z.string().max(2000).optional(),
      group: pageGroupSchema.shape.slug.optional(),
      sections: z.array(sectionSchema).min(1).max(40),
    }),
    z.object({
      ...common,
      kind: z.literal("screen"),
      backgroundKind: z.enum(["image", "color"]).optional(),
      title: text,
      eyebrow: text,
      intro: text,
      appearance: appearanceSchema,
      blocks: z.array(blockSchema).max(40),
    }),
    z.object({
      ...common,
      kind: z.literal("card_group"),
      description: text,
      presentation: z.enum(["slides","ministries","team","beliefs","groups","teams","series"]).optional(),
      cardSize: z.enum(["small", "medium", "large"]).optional(),
      cards: z.array(cardSchema).max(100),
    }),
  ])
  .superRefine((content, ctx) => {
    const list =
      content.kind === "page"
        ? content.sections
        : content.kind === "screen"
          ? content.blocks
          : content.cards;
    if (new Set(list.map((item) => item.id)).size !== list.length)
      ctx.addIssue({
        code: "custom",
        message: "Items must have unique identifiers.",
      });
    if (content.kind === "page") {
      const anchors = content.sections.map(s => s.anchor ?? s.id);
      if (new Set(anchors).size !== anchors.length) ctx.addIssue({ code: "custom", message: "Section links must be unique within a page." });
      if (
        !content.group &&
        isReservedRoutePath(`/${content.slug}`) &&
        !editablePageSlugs.includes(
          content.slug as (typeof editablePageSlugs)[number],
        )
      )
        ctx.addIssue({
          code: "custom",
          message: "This page route is not supported by the editor.",
        });
      if (
        !content.group &&
        content.slug === "home" &&
        (content.sections[0]?.type !== "hero" ||
          content.sections[0]?.hidden ||
          content.sections.filter((s) => s.type === "hero").length !== 1)
      )
        ctx.addIssue({
          code: "custom",
          message: "Keep one visible hero as the first section.",
        });
      if (!content.group && content.slug === "home")
        for (const type of ["events", "sermon", "pathway"] as const)
          if (content.sections.filter((s) => s.type === type).length > 1)
            ctx.addIssue({
              code: "custom",
              message: `Only one ${type} section is allowed.`,
            });
    }
  });
export type Content = z.infer<typeof contentSchema>;
export function isFixedPage(
  page: Pick<PageContent, "group" | "slug">,
): boolean {
  void page;
  return false;
}
export type ScreenContent = Extract<Content, { kind: "screen" }>;
export type GroupContent = Extract<Content, { kind: "card_group" }>;
export type PageContent = Extract<Content, { kind: "page" }>;
export function pageKey(page: Pick<PageContent, "group" | "slug">): string {
  return page.group ? `${page.group}/${page.slug}` : page.slug;
}
export function pagePath(page: Pick<PageContent, "group" | "slug">): string {
  return page.group || page.slug !== "home" ? `/${pageKey(page)}` : "/";
}
export type Section = z.infer<typeof sectionSchema>;
export type Appearance = z.infer<typeof appearanceSchema>;
export type ContentAction = z.infer<typeof actionSchema>;
export type ContentRecord = {
  id: string;
  version: number;
  draft: Content;
  published: Content | null;
  archived: boolean;
  updatedAt: string;
};
export type PublicContent = {
  home: PageContent;
  pages: Record<string, PageContent>;
  screens: Record<string, ScreenContent>;
  groups: Record<string, GroupContent>;
};
export const palette = [
  "#1b1c20",
  "#f5f1e9",
  "#ffffff",
  "#1d385a",
  "#ff8575",
  "#10b5ba",
  "#ffd451",
  "#a7ce97",
  "#456faa",
];
export const sectionLabels: Record<Section["type"], string> = {
  hero: "Hero",
  intro: "Welcome / introduction",
  visit: "Visit invitation",
  card_group: "Card collection",
  pathway: "Discipleship steps",
  events: "Events",
  sermon: "Latest sermon",
  cta: "Call to action",
  text: "Centered text",
  image_left: "Image on left",
  image_right: "Image on right",
  full_bleed: "Full-width image",
  pastors: "Pastors",
  marquee: "Scrolling text banner",
};
export function references(
  content: Content,
): { id: string; kind: "screen" | "card_group" }[] {
  const result: { id: string; kind: "screen" | "card_group" }[] = [];
  const action = (a: ContentAction) => {
    if (a.kind === "screen") result.push({ id: a.value, kind: "screen" });
  };
  if (content.kind === "card_group")
    content.cards.forEach((card) => action(card.action));
  if (content.kind === "screen")
    content.blocks.forEach((block) => {
      block.grid?.rows.forEach(row=>row.columns.forEach(column=>column.elements.forEach(element=>{if(element.type === "button")action(element.action);if(element.type === "card_group"&&element.groupId)result.push({id:element.groupId,kind:"card_group"});})));
      if (block.type === "card_group")
        result.push({ id: block.groupId, kind: "card_group" });
      if (block.type === "button" || block.showAction || ["feature", "callout"].includes(block.type)) action(block.action);
    });
  if (content.kind === "page")
    content.sections.forEach((section) => {
      section.native?.groups.forEach(group => result.push({id:group.id,kind:"card_group"}));
      if (section.type === "card_group")
        result.push({ id: section.groupId, kind: "card_group" });
      section.layout?.rows.forEach(row=>row.columns.forEach(column=>column.elements.forEach(element=>{if(element.type === "button")action(element.action);if(element.type === "card_group"&&element.groupId)result.push({id:element.groupId,kind:"card_group"});})));
      section.buttons.forEach(action);
      section.items.forEach((item) => action(item.action));
    });
  return result;
}
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length)
    return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
export function makeSection(type: Section["type"], itemId: string): Section {
  return sectionSchema.parse({
    id: itemId,
    type,
    name: sectionLabels[type],
    title: "Make room for *something new.*",
    body: "Add your content here.",
    appearance: appearanceSchema.parse({}),
  });
}
