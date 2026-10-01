import {z} from 'zod';
import {feedSchema,type Feed} from './feeds';
import {configurationSchema,type SiteConfiguration} from "./site-configuration";
import { contentSchema, references, type ContentRecord, type Content } from "./contract";
export const PREVIEW_PROTOCOL = 1;
export type PreviewPayload = {
  type: "proofadmin-preview-content";
  protocol: 1;
  siteId: string;
  id: string;
  content: Content;
  related?: { id: string; content: Content }[];
  selected?: string;
  configuration?: SiteConfiguration;
  feed?: {id:string;content:Feed};
};
export function parsePreviewMessage(
  value: unknown,
  siteId: string,
  id: string,
): PreviewPayload | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  if (
    data.type !== "proofadmin-preview-content" ||
    data.protocol !== PREVIEW_PROTOCOL ||
    data.siteId !== siteId ||
    data.id !== id
  )
    return null;
  const parsed = contentSchema.safeParse(data.content);
  if (!parsed.success) return null;
  const feed=data.feed===undefined?undefined:z.object({id:z.uuid(),content:feedSchema}).strict().safeParse(data.feed);
  if(feed&&!feed.success)return null;
  const configuration=data.configuration===undefined?undefined:configurationSchema.safeParse(data.configuration);
  if(configuration&&!configuration.success)return null;
  let related: { id: string; content: Content }[] | undefined;
  if (data.related !== undefined) {
    if (!Array.isArray(data.related) || data.related.length > 200) return null;
    related = [];
    for (const item of data.related) {
      if (!item || typeof item.id !== "string" || item.id.length > 100 || item.id === id || related.some(r => r.id === item.id)) return null;
      const document = contentSchema.safeParse(item.content);
      if (!document.success) return null;
      related.push({ id: item.id, content: document.data });
    }
    const allowed = new Set<string>();
    const visit = (content: Content) => { for (const ref of references(content)) {
      if (allowed.has(ref.id) || ref.id === id) continue;
      allowed.add(ref.id); const target = related!.find(r => r.id === ref.id);
      if (target) visit(target.content);
    }};
    visit(parsed.data);
    if(configuration?.success)for(const n of configuration.data.navigation.filter(n=>n.is_visible&&n.action_kind==='screen')){
      const target=related.find(r=>r.content.kind==='screen'&&r.content.slug===n.action_value);
      if(target){allowed.add(target.id);visit(target.content);}
    }
    if (related.some(r => !allowed.has(r.id))) return null;
  }
  return {
    type: "proofadmin-preview-content",
    protocol: 1,
    siteId,
    id,
    content: parsed.data,
    ...(feed?.success?{feed:feed.data}:{}),
    ...(configuration?.success?{configuration:configuration.data}:{}),
    ...(related ? { related } : {}),
    ...(typeof data.selected === "string" ? { selected: data.selected } : {}),
  };
}
// Run inside the client site's empty preview shell. It must never fetch drafts with a public key.
// The parent admin supplies in-memory changes only after its normal authentication and site checks.
export function connectPreviewReceiver(options: {
  adminOrigin: string;
  siteId: string;
  id: string;
  onContent: (payload: PreviewPayload) => void;
}) {
  if (window.parent === window)
    throw new Error("Open preview from Proof Admin.");
  const origin = new URL(options.adminOrigin).origin;
  const receive = (event: MessageEvent) => {
    if (event.origin !== origin || event.source !== window.parent) return;
    const parsed = parsePreviewMessage(event.data, options.siteId, options.id);
    if (parsed) options.onContent(parsed);
  };
  window.addEventListener("message", receive);
  window.parent.postMessage(
    {
      type: "proofadmin-preview-ready",
      protocol: 1,
      siteId: options.siteId,
      id: options.id,
    },
    origin,
  );
  return {
    select: (selected: string) =>
      window.parent.postMessage(
        {
          type: "proofadmin-preview-select",
          protocol: 1,
          siteId: options.siteId,
          id: options.id,
          selected,
        },
        origin,
      ),
    disconnect: () => window.removeEventListener("message", receive),
  };
}
export function externalPreviewUrl(url: string, siteId: string, id: string) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.username || parsed.password)
    throw new Error("Preview requires a registered HTTPS address.");
  parsed.searchParams.set("siteId", siteId);
  parsed.searchParams.set("documentId", id);
  return parsed.toString();
}

// Only documents reachable from the selected draft's explicit references leave the admin.
export function previewDependencies(id: string, content: Content, records: ContentRecord[], configuration?: SiteConfiguration) {
  const result: { id: string; content: Content }[] = [];
  const visited = new Set([id]);
  const visit = (document: Content) => { for (const ref of references(document)) {
    if (visited.has(ref.id)) continue;
    visited.add(ref.id);
    const target = records.find(r => r.id === ref.id && !r.archived && r.draft.kind === ref.kind);
    if (!target) continue;
    if (result.length >= 200) throw new Error("Preview has too many linked documents.");
    result.push({ id: target.id, content: target.draft }); visit(target.draft);
  }};
  visit(content);
  if(configuration)for(const n of configuration.navigation.filter(n=>n.is_visible&&n.action_kind==='screen')){
    const target=records.find(r=>!r.archived&&r.draft.kind==='screen'&&r.draft.slug===n.action_value);
    if(target&&!visited.has(target.id)){if(result.length>=200)throw new Error("Preview has too many linked documents.");visited.add(target.id);result.push({id:target.id,content:target.draft});visit(target.draft);}
  }
  return result;
}
