// Only mounted by authenticated draft preview shells. Public renderers never call this.
type PreviewElement={id:string;type?:string;text?:string;textStyle?:'body'|'eyebrow'|'heading'|'hero_heading';action?:{label:string};items?:{id:string;title:string;body:string;grid?:Layout}[]};
type Layout={rows:{id:string;columns:{id:string;elements:PreviewElement[]}[]}[]};
type PreviewDocument = {
  id: string;
  content: {
    kind: string;
    sections?: { id: string; anchor?: string; name: string; hidden?: boolean; title?:string;body?:string;eyebrow?:string;buttons?:{label:string}[]; layout?: Layout }[];
    blocks?: { id: string; caption?: string; type: string; text?:string;action?:{label:string}; grid?: Layout }[];
    cards?: { id: string; title: string; description?:string;action?:{label:string};hidden?:boolean }[];
  };
};
export type PreviewTarget = { sectionId: string; rowId?: string; columnId?: string; elementId?: string;accordion?:{itemId:string;rowId?:string;columnId?:string;elementId?:string} };
export type PreviewBounds = { x: number; y: number; width: number; height: number };
type Focus = (target: PreviewTarget | null, bounds: PreviewBounds | null, action: 'select' | 'position' | 'dismiss' | 'insert-menu') => void;
const rememberedSelection = new Map<string, PreviewTarget>();
// Referrers are intentionally suppressed by the admin. Trust explicit origins and the source window.
export function previewAdminOrigins(ownOrigin:string){
  const origins=[ownOrigin,'https://login.proofcreatives.com','https://proofadmin-kappa.vercel.app'];
  try{if(['127.0.0.1','localhost'].includes(new URL(ownOrigin).hostname))origins.push('http://127.0.0.1:3100');}catch{/* Invalid origins cannot add a development parent. */}
  return [...new Set(origins)];
}
function labelText(value: string) {
  if (!value.startsWith('richtext:v1:')) return value;
  try {
    const text = (node: { type?:string; text?: string; content?: unknown[] }): string => node.type==='hardBreak'?' ':node.text ?? (node.content ?? []).map(child => text(child as { type?:string; text?: string; content?: unknown[] })).join(node.type==='doc'?' ':'');
    return text(JSON.parse(value.slice(12)));
  } catch { return 'item'; }
}
// Legacy clients render Markdown emphasis and paragraph breaks before the shared editor mounts.
export function previewPlainText(value:string){
  return labelText(value).replace(/\[([^\]\n]+)\]\([^)\s]+\)/g,'$1').replace(/\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g,(_match,strong,emphasis)=>strong??emphasis).replace(/\{style(?: size=\d{1,2})?(?: color=#[\da-fA-F]{6})?\}|\{\/style\}/g,'').replace(/\s+/g,' ').trim();
}
function renderedText(node:Node):string{
  if(node.nodeType===Node.TEXT_NODE)return node.textContent??'';
  if(node instanceof Element&&node.tagName==='BR')return '\n';
  const text=Array.from(node.childNodes).map(renderedText).join('');
  return node instanceof Element&&/^(P|DIV|H[1-6]|LI|UL|OL|SECTION)$/.test(node.tagName)?`\n${text}\n`:text;
}
function equalTarget(a: PreviewTarget | null, b: PreviewTarget | null) {
  return a?.sectionId === b?.sectionId && a?.rowId === b?.rowId && a?.columnId === b?.columnId && a?.elementId === b?.elementId && JSON.stringify(a?.accordion)===JSON.stringify(b?.accordion);
}
export function mountPreviewPencils(
  current: PreviewDocument,
  related: PreviewDocument[],
  select: (selected: string, documentId: string) => void,
  insert?: (request: Record<string, unknown>) => void,
  focus?: Focus,
) {
  const sections = current.content.kind === 'screen'
    ? (current.content.blocks ?? []).map(block => ({ id: block.id, name: block.caption || 'Section', layout: block.grid, hidden: false, anchor: undefined }))
    : current.content.kind === 'card_group' ? (current.content.cards??[]).map(card=>({...card,name:card.title,hidden:card.hidden??false,layout:undefined,anchor:undefined})) : current.content.sections ?? [];
  const targetFor = (id: string, anchor?: string) => document.querySelector<HTMLElement>(`[data-proof-section="${CSS.escape(id)}"],[data-proof-item="${CSS.escape(id)}"],[data-content-section="${CSS.escape(id)}"],[data-content-card="${CSS.escape(id)}"]`) || document.getElementById(anchor ?? id) || document.getElementById(`proof-item-${id}`);
  const validTarget = (input: unknown): PreviewTarget | null => {
    if (!input || typeof input !== 'object') return null;
    const value = input as Record<string, unknown>;
    if (Object.keys(value).some(key => !['sectionId', 'rowId', 'columnId', 'elementId','accordion'].includes(key))) return null;
    if (typeof value.sectionId !== 'string') return null;
    const section = sections.find(item => item.id === value.sectionId && !item.hidden);
    if (!section) return null;
    if (value.rowId === undefined) return value.accordion===undefined && value.columnId === undefined && value.elementId === undefined ? { sectionId: section.id } : null;
    const row = section.layout?.rows.find(item => item.id === value.rowId);
    if (!row) return null;
    if (value.columnId === undefined) return value.accordion===undefined && value.elementId === undefined ? { sectionId: section.id, rowId: row.id } : null;
    const column = row.columns.find(item => item.id === value.columnId);
    if (!column) return null;
    if (value.elementId === undefined) return value.accordion===undefined?{ sectionId: section.id, rowId: row.id, columnId: column.id }:null;
    const element=column.elements.find(item=>item.id===value.elementId);if(!element)return null;
    const outer={sectionId:section.id,rowId:row.id,columnId:column.id,elementId:element.id};
    if(value.accordion===undefined)return outer;
    if(element.type!=='accordion'||!value.accordion||typeof value.accordion!=='object'||Array.isArray(value.accordion))return null;
    const nested=value.accordion as Record<string,unknown>;
    if(Object.keys(nested).some(key=>!['itemId','rowId','columnId','elementId'].includes(key)))return null;
    const item=element.items?.find(item=>item.id===nested.itemId);if(!item)return null;
    const context={itemId:item.id};
    if(nested.rowId===undefined)return nested.columnId===undefined&&nested.elementId===undefined?{...outer,accordion:context}:null;
    const answerRow=item.grid?.rows.find(row=>row.id===nested.rowId);if(!answerRow)return null;
    if(nested.columnId===undefined)return nested.elementId===undefined?{...outer,accordion:{...context,rowId:answerRow.id}}:null;
    const answerColumn=answerRow.columns.find(column=>column.id===nested.columnId);if(!answerColumn)return null;
    if(nested.elementId===undefined)return {...outer,accordion:{...context,rowId:answerRow.id,columnId:answerColumn.id}};
    const leaf=answerColumn.elements.find(element=>element.id===nested.elementId);return leaf?{...outer,accordion:{...context,rowId:answerRow.id,columnId:answerColumn.id,elementId:leaf.id}}:null;
  };
  const nodeFor = (target: PreviewTarget) => {
    const section = sections.find(item => item.id === target.sectionId);
    const root = targetFor(target.sectionId, section?.anchor);
    if (!root) return null;
    if(target.accordion){
      const accordion=root.querySelector<HTMLElement>(`[data-proof-element="${CSS.escape(target.elementId!)}"]`);
      const item=accordion?.querySelector<HTMLElement>(`[data-proof-accordion-item="${CSS.escape(target.accordion.itemId)}"]`);if(!item)return null;
      const nested=target.accordion;
      if(nested.elementId)return item.querySelector<HTMLElement>(`[data-proof-element="${CSS.escape(nested.elementId)}"]`);
      if(nested.columnId)return item.querySelector<HTMLElement>(`[data-proof-column="${CSS.escape(nested.columnId)}"]`);
      if(nested.rowId)return item.querySelector<HTMLElement>(`[data-proof-row="${CSS.escape(nested.rowId)}"]`);
      return item;
    }
    if (target.elementId) return root.querySelector<HTMLElement>(`[data-proof-element="${CSS.escape(target.elementId)}"]`);
    if (target.columnId) return root.querySelector<HTMLElement>(`[data-proof-column="${CSS.escape(target.columnId)}"]`);
    if (target.rowId) return root.querySelector<HTMLElement>(`[data-proof-row="${CSS.escape(target.rowId)}"]`);
    return root;
  };
  const boundsFor = (target: PreviewTarget) => {
    const node = nodeFor(target);
    let bounds = node?.getBoundingClientRect();
    if (node && (!bounds?.width || !bounds.height)) bounds = node.firstElementChild?.getBoundingClientRect();
    return bounds;
  };
  const asBounds = (bounds: DOMRect): PreviewBounds => ({ x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height });
  const layer = document.createElement('div');
  layer.dataset.previewPencils = 'true';
  Object.assign(layer.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '2147483000' });
  document.body.append(layer);
  const editingStyle = document.createElement('style');
  editingStyle.textContent = `body{padding-bottom:32px}[data-proof-map] iframe{pointer-events:none}[data-proof-column]:empty{min-height:112px}[data-proof-row]:empty{min-height:112px}[data-proof-element]{min-height:30px;margin-bottom:18px}[data-proof-selected="true"],[data-proof-selected="true"][data-proof-item]>*{outline:none!important}[data-proof-empty-text]{min-height:1.6em;cursor:text}[data-proof-empty-text]:not([data-proof-inline-active])::before{content:'Add your text here';opacity:.65}[data-preview-pencils] button:focus-visible{outline:3px solid #297cca;outline-offset:3px}[data-preview-pencils] button:hover{background:#eaf3ff!important}`;
  document.head.append(editingStyle);
  let frame = 0;
  let selected = validTarget(rememberedSelection.get(current.id));
  let hovered: PreviewTarget | null = null;
  let menu: HTMLDivElement | null = null;
  let activeInsertion: AddControl | null = null;
  let previousPosition = '';
  const makeHighlight = (insertion = false) => {
    const highlight = document.createElement('div');
    highlight.setAttribute('aria-hidden', 'true');
    Object.assign(highlight.style, { position: 'absolute', display: 'none', pointerEvents: 'none', boxSizing: 'border-box', border: `${insertion ? 3 : 2}px ${insertion ? 'dashed' : 'solid'} #2473bb`, borderRadius: '5px', background: insertion ? '#2c84d922' : 'transparent' });
    layer.append(highlight);
    return highlight;
  };
  const selectionHighlight = makeHighlight();
  selectionHighlight.dataset.proofSelectionOutline = 'true';
  const insertionHighlight = makeHighlight(true);
  const setSelected = (target: PreviewTarget | null) => {
    const changed = !equalTarget(selected, target);
    selected = target;
    if(target?.accordion?.rowId){const outer=nodeFor({...target,accordion:undefined});const details=outer?.querySelector<HTMLDetailsElement>(`details[data-proof-accordion-item="${CSS.escape(target.accordion.itemId)}"]`);if(details)details.open=true;}
    if (target) rememberedSelection.set(current.id, target);
    else rememberedSelection.delete(current.id);
    if (changed) previousPosition = '';
    schedule();
  };
  const activateTarget = (target: PreviewTarget) => {
    setSelected(target);
    const bounds = boundsFor(target);
    if (focus && bounds) focus(target, asBounds(bounds), 'select');
    else select(target.sectionId, current.id);
  };
  const closeMenu = () => { menu?.remove(); menu = null; activeInsertion = null; schedule(); };
  const entries = [current, ...related.filter(document => document.content.kind === 'card_group')].flatMap(document => {
    const content = document.content;
    return (content.kind === 'page' ? content.sections ?? [] : content.kind === 'screen' ? content.blocks ?? [] : content.cards ?? []).map(item => ({
      id: item.id, documentId: document.id,
      label: 'name' in item ? item.name : 'title' in item ? item.title : 'caption' in item ? item.caption || item.type : 'Item',
      anchor: 'anchor' in item ? item.anchor : undefined,
    }));
  });
  type InlineDescriptor={node:HTMLElement;target:PreviewTarget;field:'text'|'label'|'title'|'body'|'eyebrow'|'description';value:string;buttonIndex?:number;semantic?:boolean;textStyle?:'body'|'eyebrow'|'heading'|'hero_heading'};
  type InlineController={start:(descriptor:InlineDescriptor,event?:MouseEvent)=>void;finish:()=>void;contains:(node:Element)=>boolean;activeNode:()=>HTMLElement|undefined;destroy:()=>void};
  let inline:InlineController|null=null,disposed=false,inlineEnabled=false,accordionEnabled=false,answerLayoutsEnabled=false,mapEnabled=false,featuredEventsEnabled=false,allEventsEnabled=false,textStylesEnabled=false;
  let brandColors:unknown=[];
  let pendingText:InlineDescriptor|null=null;
  const loading=document.createElement('div');loading.setAttribute('role','status');Object.assign(loading.style,{position:'absolute',display:'none',pointerEvents:'none',background:'#fff',color:'#174b79',padding:'6px 10px',border:'1px solid #a7c4e4',borderRadius:'8px',font:'12px system-ui,sans-serif'});layer.append(loading);
  const descriptors:InlineDescriptor[]=[];
  const plain=previewPlainText;
  const addText=(root:HTMLElement|null,target:PreviewTarget,field:InlineDescriptor['field'],value:string|undefined,selector:string,buttonIndex?:number,textStyle?:InlineDescriptor['textStyle'])=>{
    if(!root||value===undefined)return;
    // Layout fields are identified by their validated element path; rich paragraph DOM does not preserve textContent whitespace.
    const explicit=Array.from(root.querySelectorAll<HTMLElement>(`[data-proof-field="${field}"]`));
    const candidates=[...(root.matches(selector)?[root]:[]),...Array.from(root.querySelectorAll<HTMLElement>(selector))];
    const matches=explicit.length?explicit:candidates.filter(node=>!!target.elementId||plain(renderedText(node))===plain(value));
    const leaves=matches.filter(candidate=>!matches.some(other=>candidate!==other&&candidate.contains(other)));
    const node=leaves.length===1?leaves[0]:undefined;
    if(node&&!descriptors.some(d=>d.node===node)){if(field==='text'&&!plain(value))node.dataset.proofEmptyText='true';descriptors.push({node,target,field,value,...(target.elementId&&field==='text'?{semantic:true,textStyle}:{}),...(buttonIndex!==undefined?{buttonIndex}:{})});}
  };
  for(const section of sections){
    const target={sectionId:section.id},root=targetFor(section.id,section.anchor);
    if(section.layout){for(const row of section.layout.rows)for(const column of row.columns)for(const element of column.elements){
      const path={...target,rowId:row.id,columnId:column.id,elementId:element.id};
      const elementNode=nodeFor(path);
      if(element.type==='text')addText(elementNode,path,'text',element.text,'.proof-layout-text',undefined,element.textStyle);
      if(element.type==='button')addText(elementNode,path,'label',element.action?.label,'a,button');
      if(element.type==='accordion')for(const item of element.items??[])for(const answerRow of item.grid?.rows??[])for(const answerColumn of answerRow.columns)for(const leaf of answerColumn.elements){
        const nested={...path,accordion:{itemId:item.id,rowId:answerRow.id,columnId:answerColumn.id,elementId:leaf.id}},node=nodeFor(nested);
        if(leaf.type==='text')addText(node,nested,'text',leaf.text,'.proof-layout-text',undefined,leaf.textStyle);
        if(leaf.type==='button')addText(node,nested,'label',leaf.action?.label,'a,button');
      }
    }}else if(current.content.kind==='page'){
      const item=current.content.sections?.find(item=>item.id===section.id);
      addText(root,target,'title',item?.title,'h1,h2,h3');addText(root,target,'eyebrow',item?.eyebrow,'p,span');addText(root,target,'body',item?.body,'p,div');
      item?.buttons?.forEach((action,index)=>addText(root,target,'label',action.label,'a,button',index));
    }else if(current.content.kind==='card_group'){
      const card=current.content.cards?.find(item=>item.id===section.id);
      addText(root,target,'title',card?.title,'h1,h2,h3,.ministry-card-title');addText(root,target,'description',card?.description,'p,div,small');addText(root,target,'label',card?.action?.label,'a,button');
    }else{
      const block=current.content.blocks?.find(item=>item.id===section.id);
      if(block?.type==='button')addText(root,target,'label',block.action?.label,'a,button');
      else if(block&&['text','heading','callout','list','feature'].includes(block.type))addText(root,target,'text',block.text,'h1,h2,h3,p,div');
    }
  }
  // This asset is self-hosted; no third-party script or authenticated data is loaded.
  const inlineUrl='/proof-inline-editor.js';
  void import(/* webpackIgnore: true */ inlineUrl).then(module=>{
    if(disposed)return;
    inline=module.createInlineEditor({layer,canUseTextStyles:()=>textStylesEnabled,getBrandColors:()=>brandColors,onEdit:(edit:unknown)=>{
      schedule();
      if(siteId&&window.parent!==window)window.parent.postMessage({type:'proofadmin-preview-inline-edit',protocol:1,siteId,id:current.id,edit},parentOrigin);
    },onSettings:(target:PreviewTarget)=>activateTarget(target)});
    loading.style.display='none';if(pendingText){inline!.start(pendingText);pendingText=null;}
  }).catch(()=>{if(disposed)return;loading.textContent='The text editor could not load. Reload this page to try again.';});
  const controls = entries.map(item => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = '✎';
    button.setAttribute('aria-label', `Edit ${labelText(item.label)}`); button.title = `Edit ${labelText(item.label)}`;
    Object.assign(button.style, { position: 'absolute', pointerEvents: 'auto', width: '34px', height: '34px', border: '1px solid #d5ddeb', borderRadius: '50%', background: '#fff', color: '#174b79', boxShadow: '0 2px 8px #0003', fontSize: '23px', lineHeight: '1', cursor: 'pointer', display: 'none' });
    button.addEventListener('click', event => {
      event.preventDefault(); event.stopPropagation(); closeMenu();
      const target = item.documentId === current.id ? validTarget({ sectionId: item.id }) : null;
      if (target) activateTarget(target); else select(item.id, item.documentId);
    });
    layer.append(button); return { item, button };
  });
  type AddControl = {
    button: HTMLButtonElement; bounds: () => DOMRect | undefined;
    target: PreviewTarget | null; placement: 'section' | 'row' | 'column' | 'element' | 'empty';
    always?: boolean;
  };
  const insertControls: AddControl[] = [];
  const plus = (label: string, title: string, bounds: AddControl['bounds'], target: PreviewTarget | null, placement: AddControl['placement'], activate: (button: HTMLButtonElement) => void, always = false) => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = `+ ${label}`; button.title = title; button.setAttribute('aria-label', title);
    Object.assign(button.style, { position: 'absolute', pointerEvents: 'auto', height: '28px', whiteSpace: 'nowrap', border: '1px solid #a7c4e4', borderRadius: '14px', background: '#fff', color: '#174b79', font: '600 12px/1.2 system-ui,sans-serif', padding: '5px 10px', boxShadow: '0 2px 6px #0002', cursor: 'pointer', display: 'none' });
    const control = { button, bounds, target, placement, always };
    button.addEventListener('pointerenter', () => { activeInsertion = control; schedule(); });
    button.addEventListener('pointerleave', () => { if (!menu) { activeInsertion = null; schedule(); } });
    button.addEventListener('focus', () => { activeInsertion = control; schedule(); });
    button.addEventListener('blur', () => { if (!menu) { activeInsertion = null; schedule(); } });
    button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); if (target?.accordion && !answerLayoutsEnabled) return; activeInsertion = control; activate(button); });
    layer.append(button); insertControls.push(control);
  };
  const showElements = (button: HTMLButtonElement, request: Record<string, unknown>) => {
    const menuTarget = validTarget({ sectionId: request.sectionId, rowId: request.rowId, columnId: request.columnId,...(request.accordion?{elementId:request.elementId,accordion:request.accordion}:{}) });
    const menuBounds = menuTarget ? boundsFor(menuTarget) : undefined;
    // The parent inspector must yield space to this chooser without clearing its selection.
    if (menuTarget && menuBounds) focus?.(menuTarget, asBounds(menuBounds), 'insert-menu');
    const insertion = activeInsertion;
    closeMenu(); activeInsertion = insertion;
    menu = document.createElement('div'); menu.setAttribute('role', 'toolbar'); menu.setAttribute('aria-label', 'Add element');
    Object.assign(menu.style, { position: 'absolute', pointerEvents: 'auto', display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '8px', maxWidth: 'calc(100vw - 16px)', borderRadius: '10px', background: '#fff', border: '1px solid #d2ddeb', boxShadow: '0 6px 24px #0003' });
    if(request.accordion&&!answerLayoutsEnabled)return;
    const types=request.accordion?['text','image','button','video','card_group',...(mapEnabled?['map']:[])]:['text','image','button','video','card_group',...(accordionEnabled?['accordion']:[]),...(mapEnabled?['map']:[]),...(featuredEventsEnabled?['featured_events']:[]),...(allEventsEnabled?['all_events']:[]),'recent_sermons','recent_series','all_sermons','all_series'];
    for (const type of types) {
      const option = document.createElement('button'); option.type = 'button';
      const sermonLabels:Record<string,string>={featured_events:'Featured Events',all_events:'All Events',recent_sermons:'Most Recent Sermons',recent_series:'Most Recent Series',all_sermons:'All Sermons',all_series:'All Series'};
      const label = sermonLabels[type]??(type === 'card_group' ? 'Cards' : type[0].toUpperCase() + type.slice(1));
      const insertRow=sections.find(section=>section.id===request.sectionId)?.layout?.rows.find(row=>row.id===request.rowId);
      if(sermonLabels[type]&&insertRow?.columns.length!==1){option.disabled=true;option.title='Sermon elements require a single-column row.';}
      option.textContent = label; option.setAttribute('aria-label', `Add ${type === 'card_group' ? 'card section' : label.toLowerCase()}`);
      Object.assign(option.style, { border: '0', background: '#edf3fa', color: '#174b79', borderRadius: '6px', padding: '9px', font: '600 12px system-ui,sans-serif', cursor: 'pointer' });
      option.addEventListener('click', () => { insert?.({ ...request, elementType: type }); closeMenu(); }); menu.append(option);
    }
    layer.append(menu);
    const buttonBounds = button.getBoundingClientRect(); const chooserBounds = menu.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(innerWidth - chooserBounds.width - 8, buttonBounds.x))}px`;
    menu.style.top = `${Math.max(8, Math.min(innerHeight - chooserBounds.height - 8, buttonBounds.bottom + 6))}px`;
    menu.querySelector('button')?.focus(); schedule();
  };
  const pageBounds = () => (document.querySelector<HTMLElement>('main') ?? document.body).getBoundingClientRect();
  if (insert && ['page', 'screen'].includes(current.content.kind)) {
    if (!sections.length) plus('Add section', 'Add first section', pageBounds, null, 'empty', () => insert({ kind: 'section', afterId: null }), true);
    for (const section of sections.filter(item => !item.hidden)) {
      const sectionTarget = { sectionId: section.id };
      const sectionBounds = () => boundsFor(sectionTarget);
      if (sections.length < 40) plus('Add section', `Add section after ${labelText(section.name)}`, sectionBounds, sectionTarget, 'section', () => insert({ kind: 'section', afterId: section.id }), true);
      if (!section.layout) continue;
      if (!section.layout.rows.length) plus('Add row', 'Add first row', sectionBounds, sectionTarget, 'empty', () => insert({ kind: 'row', sectionId: section.id, afterId: null }), true);
      for (const [rowIndex, row] of section.layout.rows.entries()) {
        const rowTarget = { ...sectionTarget, rowId: row.id };
        if (section.layout.rows.length < 20) plus('Add row', `Add row after row ${rowIndex + 1}`, () => boundsFor(rowTarget), rowTarget, 'row', () => insert({ kind: 'row', sectionId: section.id, afterId: row.id }));
        if (!row.columns.length) plus('Add column', 'Add first column', () => boundsFor(rowTarget), rowTarget, 'empty', () => insert({ kind: 'column', sectionId: section.id, rowId: row.id, afterId: null }), true);
        for (const [columnIndex, column] of row.columns.entries()) {
          const columnTarget = { ...rowTarget, columnId: column.id };
          if (row.columns.length < 6&&!row.columns.some(column=>column.elements.some(element=>['recent_sermons','recent_series','all_sermons','all_series','featured_events','all_events'].includes(element.type??'')))) plus('Add column', `Add column after column ${columnIndex + 1}`, () => boundsFor(columnTarget), columnTarget, 'column', () => insert({ kind: 'column', sectionId: section.id, rowId: row.id, afterId: column.id }));
          if (column.elements.length >= 20) continue;
          const request = { kind: 'element', sectionId: section.id, rowId: row.id, columnId: column.id };
          if (!column.elements.length) plus('Add element', 'Add element to empty column', () => boundsFor(columnTarget), columnTarget, 'empty', button => showElements(button, { ...request, afterId: null }), true);
          for (const element of column.elements) {
            const elementTarget = { ...columnTarget, elementId: element.id };
            plus('Add element', 'Add element below', () => boundsFor(elementTarget), elementTarget, 'element', button => showElements(button, { ...request, afterId: element.id }));
          }
        }
      }
    }
  }
  if(insert)for(const section of sections.filter(section=>!section.hidden&&section.layout)){
    const answerLeaves=section.layout!.rows.reduce((sum,row)=>sum+row.columns.reduce((sum,column)=>sum+column.elements.reduce((sum,element)=>sum+(element.items??[]).reduce((sum,item)=>sum+(item.grid?.rows??[]).reduce((sum,row)=>sum+row.columns.reduce((sum,column)=>sum+column.elements.length,0),0),0),0),0),0);
    for(const outerRow of section.layout!.rows)for(const outerColumn of outerRow.columns)for(const accordion of outerColumn.elements)if(accordion.type==='accordion')for(const item of accordion.items??[]){
      if(!item.grid)continue;
      const parent={sectionId:section.id,rowId:outerRow.id,columnId:outerColumn.id,elementId:accordion.id};
      for(const [ri,row]of item.grid.rows.entries()){
        const rowTarget={...parent,accordion:{itemId:item.id,rowId:row.id}};
        if(item.grid.rows.length<4)plus('Add row',`Add row after answer row ${ri+1}`,()=>boundsFor(rowTarget),rowTarget,'row',()=>insert({kind:'row',...rowTarget,afterId:row.id}));
        for(const [ci,column]of row.columns.entries()){
          const columnTarget={...parent,accordion:{itemId:item.id,rowId:row.id,columnId:column.id}};
          if(row.columns.length<4)plus('Add column',`Add column after answer column ${ci+1}`,()=>boundsFor(columnTarget),columnTarget,'column',()=>insert({kind:'column',...rowTarget,afterId:column.id}));
          if(column.elements.length>=10||answerLeaves>=120)continue;
          const request={kind:'element',...columnTarget};
          if(!column.elements.length)plus('Add element','Add element to empty answer column',()=>boundsFor(columnTarget),columnTarget,'empty',button=>showElements(button,{...request,afterId:null}),true);
          for(const element of column.elements){const target={...parent,accordion:{...columnTarget.accordion,elementId:element.id}};plus('Add element','Add element below answer element',()=>boundsFor(target),target,'element',button=>showElements(button,{...request,afterId:element.id}));}
        }
      }
    }
  }
  const targetAt = (element: Element): PreviewTarget | null => {
    for (const section of sections.filter(item => !item.hidden)) {
      const root = targetFor(section.id, section.anchor);
      if (!root?.contains(element)) continue;
      const answer=element.closest<HTMLElement>('[data-proof-accordion-item]');
      if(answer&&root.contains(answer)){
        const outer=answer.closest<HTMLElement>('[data-proof-element]');
        const outerRow=outer?.closest<HTMLElement>('[data-proof-row]'),outerColumn=outer?.closest<HTMLElement>('[data-proof-column]');
        const parent={sectionId:section.id,rowId:outerRow?.dataset.proofRow,columnId:outerColumn?.dataset.proofColumn,elementId:outer?.dataset.proofElement};
        if(!answerLayoutsEnabled)return validTarget(parent);
        const row=element.closest<HTMLElement>('[data-proof-row]'),column=element.closest<HTMLElement>('[data-proof-column]'),leaf=element.closest<HTMLElement>('[data-proof-element]');
        return validTarget({...parent,accordion:{itemId:answer.dataset.proofAccordionItem,...(row&&answer.contains(row)?{rowId:row.dataset.proofRow}:{}),...(column&&answer.contains(column)?{columnId:column.dataset.proofColumn}:{}),...(leaf&&answer.contains(leaf)?{elementId:leaf.dataset.proofElement}:{})}})??validTarget(parent);
      }
      const row = element.closest<HTMLElement>('[data-proof-row]');
      const column = element.closest<HTMLElement>('[data-proof-column]');
      const item = element.closest<HTMLElement>('[data-proof-element]');
      return validTarget({ sectionId: section.id, ...(row ? { rowId: row.dataset.proofRow } : {}), ...(column ? { columnId: column.dataset.proofColumn } : {}), ...(item ? { elementId: item.dataset.proofElement } : {}) }) ?? { sectionId: section.id };
    }
    return null;
  };
  const pointerMove = (event: PointerEvent) => {
    if (!(event.target instanceof Element) || layer.contains(event.target)) return;
    const next = targetAt(event.target);
    if (!equalTarget(next, hovered)) { hovered = next; schedule(); }
  };
  const pointerLeave = () => { hovered = null; schedule(); };
  const click = (event: MouseEvent) => {
    if (!(event.target instanceof Element))return;
    if(layer.contains(event.target)){if(!event.target.closest('[data-proof-inline-toolbar]'))inline?.finish();return;}
    if(inline?.contains(event.target)){event.stopPropagation();return;}
    if(event.target.closest('[data-proof-accordion-controls]')){event.stopPropagation();inline?.finish();closeMenu();const target=targetAt(event.target);if(target)activateTarget(target);return;}
    if(event.target.closest('[data-proof-sermon-controls]')){inline?.finish();closeMenu();return;}
    const descriptor=descriptors.find(item=>item.node.contains(event.target as Node));
    if(inlineEnabled&&descriptor&&(!descriptor.target.accordion||answerLayoutsEnabled)){
      event.preventDefault();event.stopPropagation();closeMenu();setSelected(descriptor.target);
      if(inline)inline.start(descriptor,event);else{pendingText=descriptor;const bounds=descriptor.node.getBoundingClientRect();loading.textContent='Loading text editor…';Object.assign(loading.style,{display:'block',left:`${Math.max(8,bounds.left)}px`,top:`${Math.max(8,bounds.top-36)}px`});}return;
    }
    inline?.finish();
    closeMenu();
    // Cards retain their separate-document editing flow in both the shared and client previews.
    const card = entries.find(item => {
      const source = item.documentId === current.id ? current : related.find(document => document.id === item.documentId);
      return source?.content.kind === 'card_group' && targetFor(item.id, item.anchor)?.contains(event.target as Element);
    });
    if (card) {
      event.preventDefault(); event.stopPropagation(); setSelected(null); select(card.id, card.documentId); return;
    }
    const target = targetAt(event.target);
    if (target) {
      event.preventDefault(); event.stopPropagation();
      activateTarget(target);
    } else if (selected) {
      setSelected(null); focus?.(null, null, 'dismiss');
    }
  };
  const escape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    if(inline?.activeNode()){inline.finish();event.preventDefault();return;}
    if (menu) { closeMenu(); return; }
    if (selected) { setSelected(null); focus?.(null, null, 'dismiss'); }
  };
  const trustedOrigins=previewAdminOrigins(location.origin);
  let parentOrigin=location.origin;
  let siteId = new URL(location.href).searchParams.get('siteId') ?? location.pathname.match(/\/admin\/sites\/([^/]+)\//)?.[1] ?? null;
  let selectionReadySent = false;
  const requestSelection = () => {
    if (selectionReadySent || !siteId || window.parent === window) return;
    selectionReadySent = true;
    for(const origin of trustedOrigins)window.parent.postMessage({ type: 'proofadmin-preview-selection-ready', protocol: 1, siteId, id: current.id }, origin);
  };
  const receiveSelection = (event: MessageEvent) => {
    if (event.source !== window.parent || !trustedOrigins.includes(event.origin) || event.data?.protocol !== 1 || event.data?.id !== current.id || (siteId&&event.data?.siteId!==siteId)) return;
    parentOrigin=event.origin;
    if (event.data.type === 'proofadmin-preview-content') {
      if (typeof event.data.siteId === 'string' && (!siteId || siteId === event.data.siteId)) { siteId = event.data.siteId; requestSelection(); }
      return;
    }
    if (event.data.type !== 'proofadmin-preview-selection' || !siteId || event.data.siteId !== siteId) return;
    inlineEnabled=event.data.inlineEditing===true;
    textStylesEnabled=event.data.textSemanticStyles===true;
    accordionEnabled=event.data.accordion===true;answerLayoutsEnabled=event.data.accordionAnswerLayouts===true;
    mapEnabled=event.data.map===true;
    featuredEventsEnabled=event.data.featuredEvents===true;allEventsEnabled=event.data.allEvents===true;
    brandColors=event.data.brandColors;
    if (event.data.target === null) { setSelected(null); closeMenu(); return; }
    const target = validTarget(event.data.target);
    if (target) setSelected(target);
  };
  const matchesContext = (target: PreviewTarget | null, context: PreviewTarget | null) => !!target && !!context && target.sectionId === context.sectionId && (!target.rowId || target.rowId === context.rowId) && (!target.columnId || target.columnId === context.columnId) && (!target.elementId || target.elementId === context.elementId)&&(!target.accordion||!!context.accordion&&target.accordion.itemId===context.accordion.itemId&&(!target.accordion.rowId||target.accordion.rowId===context.accordion.rowId)&&(!target.accordion.columnId||target.accordion.columnId===context.accordion.columnId)&&(!target.accordion.elementId||target.accordion.elementId===context.accordion.elementId));
  const visibleBounds = (bounds?: DOMRect) => !!bounds && bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 && bounds.top < innerHeight && bounds.right > 0 && bounds.left < innerWidth;
  const placeHighlight = (highlight: HTMLDivElement, bounds?: DOMRect) => {
    highlight.style.display = visibleBounds(bounds) ? 'block' : 'none';
    if (bounds) Object.assign(highlight.style, { left: `${bounds.x}px`, top: `${bounds.y}px`, width: `${bounds.width}px`, height: `${bounds.height}px` });
  };
  const draw = () => {
    frame = 0;
    const activeText = inline?.activeNode();
    const selectionBounds = selected ? boundsFor(selected) : undefined;
    const textNode = activeText ?? (selected?.elementId ? descriptors.find(item => equalTarget(item.target, selected))?.node : undefined);
    let outlineBounds = textNode?.getBoundingClientRect() ?? selectionBounds;
    if (textNode && outlineBounds) {
      // A large inline font can extend above/below its parent's line box. Include
      // the visible glyph bounds and keep the border outside them without padding the content.
      let left=outlineBounds.left,top=outlineBounds.top,right=outlineBounds.right,bottom=outlineBounds.bottom;
      const walker=document.createTreeWalker(textNode,NodeFilter.SHOW_TEXT);
      while(walker.nextNode()) {
        const range=document.createRange();range.selectNodeContents(walker.currentNode);
        for(const rect of Array.from(range.getClientRects()))if(rect.width&&rect.height){left=Math.min(left,rect.left);top=Math.min(top,rect.top);right=Math.max(right,rect.right);bottom=Math.max(bottom,rect.bottom);}
      }
      outlineBounds=new DOMRect(left-8,top-8,right-left+16,bottom-top+16);
    }
    placeHighlight(selectionHighlight, outlineBounds);
    if (selected && selectionBounds && focus) {
      const next = JSON.stringify([selected, asBounds(selectionBounds)]);
      if (next !== previousPosition) { previousPosition = next; focus(selected, asBounds(selectionBounds), 'position'); }
    }
    for (const control of insertControls) {
      const bounds = control.bounds();
      const relevant = (!control.target?.accordion || answerLayoutsEnabled) && !activeText && (control.always || matchesContext(control.target, hovered) || matchesContext(control.target, selected) || control === activeInsertion);
      let x = 0, y = 0;
      if (bounds) {
        y = control.placement === 'empty' || control.placement === 'column' ? (bounds.top + bounds.bottom) / 2 : bounds.bottom;
        x = control.placement === 'row' ? bounds.left + 58 : control.placement === 'column' ? bounds.right : (bounds.left + bounds.right) / 2;
      }
      const visible = relevant && bounds && bounds.width > 0 && y >= 0 && y < innerHeight && bounds.right > 0 && bounds.left < innerWidth;
      control.button.style.display = visible ? 'block' : 'none';
      if (visible) {
        const width = control.button.offsetWidth || 110;
        control.button.style.top = `${Math.max(2, Math.min(innerHeight - 30, y - 14))}px`;
        control.button.style.left = `${Math.max(4, Math.min(innerWidth - width - 4, x - width / 2))}px`;
      }
    }
    const insertionBounds = activeInsertion?.bounds();
    if (activeInsertion && insertionBounds) {
      const placement = activeInsertion.placement;
      const highlight = placement === 'empty' ? insertionBounds : placement === 'column'
        ? new DOMRect(insertionBounds.right - 3, insertionBounds.top, 6, insertionBounds.height)
        : new DOMRect(insertionBounds.left, insertionBounds.bottom - 3, insertionBounds.width, 6);
      placeHighlight(insertionHighlight, highlight);
    } else placeHighlight(insertionHighlight);
    for (const { item, button } of controls) {
      const target = targetFor(item.id, item.anchor);
      let bounds = target?.getBoundingClientRect();
      if (target && (!bounds?.width || !bounds.height)) bounds = target.firstElementChild?.getBoundingClientRect();
      button.style.display = !activeText && visibleBounds(bounds) ? 'block' : 'none';
      if (bounds) { button.style.top = `${Math.max(6, bounds.top + 10)}px`; button.style.left = `${Math.min(innerWidth - 40, Math.max(4, bounds.right - 44))}px`; }
    }
  };
  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  const observer = new MutationObserver(changes => { if (changes.some(change => !layer.contains(change.target))) schedule(); });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
  window.addEventListener('scroll', schedule, true); window.addEventListener('resize', schedule); window.addEventListener('message', receiveSelection);
  document.addEventListener('pointermove', pointerMove); document.addEventListener('pointerleave', pointerLeave); document.addEventListener('click', click, true); document.addEventListener('keydown', escape);
  const resize = new ResizeObserver(schedule); resize.observe(document.body);
  requestSelection();
  schedule();
  return () => {
    disposed=true;pendingText=null;inline?.destroy();for(const descriptor of descriptors)descriptor.node.removeAttribute('data-proof-empty-text');editingStyle.remove(); menu?.remove(); observer.disconnect(); resize.disconnect(); cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule, true); window.removeEventListener('resize', schedule); window.removeEventListener('message', receiveSelection);
    document.removeEventListener('pointermove', pointerMove); document.removeEventListener('pointerleave', pointerLeave); document.removeEventListener('click', click, true); document.removeEventListener('keydown', escape);
    layer.remove();
  };
}
