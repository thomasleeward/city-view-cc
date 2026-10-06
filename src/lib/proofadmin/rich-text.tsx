import { isValidElement, type ReactNode } from "react";
import { safeUrl } from "@/lib/proofadmin/contract";

const tokenPattern =
  /\[([^\]\n]+)\]\(([^)\s]+)\)|\*{2,}([^*\n]+)\*{2,}|\*([^*\n]+)\*/g;
export const richTextSizes = [14, 16, 18, 20, 24, 28, 32, 40, 48] as const;
const styleOpenPattern =
  /\{style(?: size=\d{1,2})?(?: color=#[\da-fA-F]{6})?\}/g;
const styleTagPattern = new RegExp(
  `${styleOpenPattern.source}|\\{\\/style\\}`,
  "g",
);

function styleEnd(text: string, start: number) {
  const tags = new RegExp(styleTagPattern);
  tags.lastIndex = start;
  let depth = 1;
  let tag: RegExpExecArray | null;
  while ((tag = tags.exec(text))) {
    depth += tag[0] === "{/style}" ? -1 : 1;
    if (depth === 0) return { start: tag.index, end: tags.lastIndex };
  }
  return null;
}

function formatInline(text: string, keyPrefix: string, depth = 0): ReactNode[] {
  if (depth > 32) return [text];
  const nodes: ReactNode[] = [];
  let cursor = 0;
  const tokens = new RegExp(
    `${styleOpenPattern.source}|${tokenPattern.source}`,
    "g",
  );
  let match: RegExpExecArray | null;
  while ((match = tokens.exec(text))) {
    const index = match.index;
    if (index > cursor) nodes.push(text.slice(cursor, index));
    const key = `${keyPrefix}-${index}`;
    if (match[0].startsWith("{style")) {
      const end = styleEnd(text, tokens.lastIndex);
      const size = match[0].match(/size=(\d+)/)?.[1];
      const color = match[0].match(/color=(#[\da-fA-F]{6})/)?.[1];
      if (
        end &&
        (!size || richTextSizes.some((option) => option === Number(size)))
      ) {
        const fontSize = size
          ? Number(size) > 24
            ? `clamp(${Math.max(24, Number(size) * 0.7)}px, ${Number(size) / 10}vw, ${size}px)`
            : `${size}px`
          : undefined;
        nodes.push(
          <span key={key} style={{ fontSize, color }}>
            {formatInline(
              text.slice(tokens.lastIndex, end.start),
              key,
              depth + 1,
            )}
          </span>,
        );
        tokens.lastIndex = end.end;
      } else {
        nodes.push(match[0]);
      }
    } else if (match[1] !== undefined && match[2] !== undefined) {
      const href = match[2];
      nodes.push(
        safeUrl.safeParse(href).success && href ? (
          <a
            key={key}
            href={href}
            rel={
              href.startsWith("https://") ? "noopener noreferrer" : undefined
            }
          >
            {formatInline(match[1], key, depth + 1)}
          </a>
        ) : (
          match[0]
        ),
      );
    } else if (match[3] !== undefined) {
      nodes.push(
        <strong key={key}>{formatInline(match[3], key, depth + 1)}</strong>,
      );
    } else if (match[4] !== undefined) {
      nodes.push(<em key={key}>{formatInline(match[4], key, depth + 1)}</em>);
    }
    cursor = tokens.lastIndex;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export function RichInline({ text, links = true }: { text: string; links?: boolean }) {
  const document = readDocument(text);
  if (document) return <>{renderDocumentNodes(document.content ?? [], links)}</>;
  return <>{text.split('\n').map((line,index)=><span key={index}>{index>0&&<br/>}{formatInline(line,'rich-'+index)}</span>)}</>;
}

export type RichDocumentNode = {
  type: string;
  attrs?: {textAlign?: string};
  text?: string;
  content?: RichDocumentNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};
const documentPrefix = "richtext:v1:";

function colorValue(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  if (/^#[\da-f]{6}$/i.test(value)) return value;
  const rgb = value.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (rgb && rgb.slice(1).every((part) => Number(part) <= 255))
    return `#${rgb
      .slice(1)
      .map((part) => Number(part).toString(16).padStart(2, "0"))
      .join("")}`;
}

function cleanNode(node: RichDocumentNode, depth = 0): RichDocumentNode | null {
  if (!node || depth > 32) return null;
  if (node.type === "hardBreak") return { type: "hardBreak" };
  if (node.type === "text" && typeof node.text === "string") {
    const marks: NonNullable<RichDocumentNode["marks"]> = [];
    for (const mark of Array.isArray(node.marks) ? node.marks : []) {
      if (!mark) continue;
      if (["bold", "italic", "underline", "strike"].includes(mark.type))
        marks.push({ type: mark.type });
      if (
        mark.type === "link" &&
        typeof mark.attrs?.href === "string" &&
        safeUrl.safeParse(mark.attrs.href).success
      )
        marks.push({ type: "link", attrs: { href: mark.attrs.href } });
      if (mark.type === "textStyle") {
        const color = colorValue(mark.attrs?.color);
        const fontSize =
          typeof mark.attrs?.fontSize === "string" &&
          richTextSizes.some((size) => `${size}px` === mark.attrs?.fontSize)
            ? mark.attrs.fontSize
            : undefined;
        if (color || fontSize)
          marks.push({
            type: "textStyle",
            attrs: {
              ...(color ? { color } : {}),
              ...(fontSize ? { fontSize } : {}),
            },
          });
      }
    }
    return {
      type: "text",
      text: node.text,
      ...(marks.length ? { marks } : {}),
    };
  }
  if (["doc", "paragraph", "bulletList", "orderedList", "listItem"].includes(node.type))
    return {
      type: node.type,
      ...(node.type === "paragraph" && ["left","center","right","justify"].includes(node.attrs?.textAlign ?? "") ? {attrs:{textAlign:node.attrs!.textAlign}} : {}),
      content: (Array.isArray(node.content) ? node.content : [])
        .map((child) => cleanNode(child, depth + 1))
        .filter((child): child is RichDocumentNode => child !== null),
    };
  return null;
}

function readDocument(text: string): RichDocumentNode | null {
  if (!text.startsWith(documentPrefix)) return null;
  try {
    const parsed = JSON.parse(text.slice(documentPrefix.length));
    return parsed?.type === "doc" ? cleanNode(parsed) : null;
  } catch {
    return null;
  }
}

function renderDocumentNodes(nodes: RichDocumentNode[], links = true): ReactNode[] {
 return nodes.map((node,index)=>{
  if(node.type==='hardBreak')return <br key={index}/>;
  if(node.type==='paragraph')return <span key={index} style={{display:'block',whiteSpace:'pre-wrap',textAlign:node.attrs?.textAlign as 'left'|'center'|'right'|'justify'|undefined,minHeight:'1em',...(index?{marginTop:'.5em'}:{})}}>{renderDocumentNodes(node.content??[],links)}</span>;
  if(node.type==='bulletList'||node.type==='orderedList')return <span key={index} role="list" style={{display:'block',paddingLeft:'1.5em',marginTop:'.5em'}}>{(node.content??[]).map((item,i)=><span key={i} role="listitem" style={{display:'block',position:'relative'}}><span aria-hidden="true" style={{position:'absolute',left:'-1.5em'}}>{node.type==='orderedList'?`${i+1}.`:'•'}</span>{renderDocumentNodes(item.content??[],links)}</span>)}</span>;
  if(node.type==='listItem'||node.type==='doc')return <span key={index}>{renderDocumentNodes(node.content??[],links)}</span>;
  let result:ReactNode=node.text??'';
  for(const mark of node.marks??[]){
   if(mark.type==='bold')result=<strong style={{fontWeight:700}}>{result}</strong>;
   if(mark.type==='italic')result=<em style={{fontStyle:'italic'}}>{result}</em>;
   if(mark.type==='underline')result=<u>{result}</u>;
   if(mark.type==='strike')result=<s>{result}</s>;
   if(mark.type==='link'&&links)result=<a href={String(mark.attrs?.href)} rel="noopener noreferrer" style={{textDecoration:'underline'}}>{result}</a>;
   if(mark.type==='textStyle')result=<span style={{color:mark.attrs?.color as string|undefined,fontSize:mark.attrs?.fontSize as string|undefined}}>{result}</span>;
  }
  return <span key={index} style={{whiteSpace:'pre-wrap'}}>{result}</span>;
 });
}

function legacyNodes(
  nodes: ReactNode[],
  marks: NonNullable<RichDocumentNode["marks"]> = [],
): RichDocumentNode[] {
  const mergedMarks = [...new Set(marks.map((mark) => mark.type))].map(
    (type) => ({
      type,
      ...(type === "textStyle" || type === "link"
        ? {
            attrs: Object.assign(
              {},
              ...marks
                .filter((mark) => mark.type === type)
                .map((mark) => mark.attrs ?? {}),
            ) as Record<string, unknown>,
          }
        : {}),
    }),
  );
  return nodes.flatMap((node): RichDocumentNode[] => {
    if (typeof node === "string")
      return node
        .split("\n")
        .flatMap((line, index) => [
          ...(index ? [{ type: "hardBreak" }] : []),
          ...(line
            ? [
                {
                  type: "text",
                  text: line,
                  ...(mergedMarks.length ? { marks: mergedMarks } : {}),
                },
              ]
            : []),
        ]);
    if (
      !isValidElement<{
        children?: ReactNode;
        style?: { color?: string; fontSize?: string };
        href?: string;
      }>(node)
    )
      return [];
    const next = [...marks];
    if (node.type === "strong") next.push({ type: "bold" });
    if (node.type === "em") next.push({ type: "italic" });
    if (node.type === "a")
      next.push({ type: "link", attrs: { href: node.props.href } });
    if (node.type === "span" && node.props.style) {
      const rawSize = node.props.style.fontSize;
      const fontSize = rawSize?.startsWith("clamp")
        ? rawSize.match(/([\d.]+px)\)$/)?.[1]
        : rawSize;
      next.push({
        type: "textStyle",
        attrs: {
          ...(node.props.style.color ? { color: node.props.style.color } : {}),
          ...(fontSize ? { fontSize } : {}),
        },
      });
    }
    const children = Array.isArray(node.props.children)
      ? node.props.children
      : [node.props.children];
    return legacyNodes(children, next);
  });
}

export function richEditorDocument(
  text: string,
  list = false,
): RichDocumentNode {
  return (
    readDocument(text) ?? {
      type: "doc",
      content: text.split(list ? /\n/ : /\n\s*\n/).map((paragraph, index) => ({
        type: "paragraph",
        content: legacyNodes(formatInline(paragraph, `legacy-${index}`)),
      })),
    }
  );
}

export function richEditorValue(document: RichDocumentNode): string {
  if (!richPlainText(documentPrefix + JSON.stringify(document)).trim())
    return "";
  return (
    documentPrefix +
    JSON.stringify(cleanNode(document) ?? { type: "doc", content: [] })
  );
}

export function richPlainText(text: string): string {
  function plain(node: RichDocumentNode): string {
    if (node.type === "text") return node.text ?? "";
    if (node.type === "hardBreak") return "\n";
    return (node.content ?? [])
      .map(plain)
      .join(["doc","bulletList","orderedList"].includes(node.type) ? "\n" : "");
  }
  return plain(richEditorDocument(text));
}

export function RichList({ text }: { text: string }) {
  const document = richEditorDocument(text, true);
  return (
    <>
      {document.content
        ?.filter((paragraph) => paragraph.content?.length)
        .map((paragraph, index) => (
          <li key={index}>{renderDocumentNodes(paragraph.content ?? [])}</li>
        ))}
    </>
  );
}

export function RichParagraphs({text}:{text:string}) {return <RichInline text={text}/>;}

// Array-backed layouts retain each item's formatting instead of splitting serialized JSON.
export function richEditorLines(text:string):string[]{
 const doc=richEditorDocument(text,true);
 return (doc.content??[]).map(node=>richEditorValue({type:'doc',content:[node]}));
}
export function richLinesValue(lines:string[]):string{
 return richEditorValue({type:'doc',content:lines.flatMap(line=>richEditorDocument(line,true).content??[])});
}
