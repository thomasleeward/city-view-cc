// Only mounted by authenticated draft preview shells. Public renderers never call this.
type Layout = { rows: { id: string; columns: { id: string; elements: { id: string }[] }[] }[] };
type PreviewDocument = {
  id: string;
  content: {
    kind: string;
    sections?: { id: string; anchor?: string; name: string; hidden?: boolean; layout?: Layout }[];
    blocks?: { id: string; caption?: string; type: string; grid?: Layout }[];
    cards?: { id: string; title: string }[];
  };
};
export type PreviewTarget = { sectionId: string; rowId?: string; columnId?: string; elementId?: string };
export type PreviewBounds = { x: number; y: number; width: number; height: number };
type Focus = (target: PreviewTarget | null, bounds: PreviewBounds | null, action: 'select' | 'position' | 'dismiss' | 'insert-menu') => void;
const rememberedSelection = new Map<string, PreviewTarget>();
function labelText(value: string) {
  if (!value.startsWith('richtext:v1:')) return value;
  try {
    const text = (node: { text?: string; content?: unknown[] }): string => node.text ?? (node.content ?? []).map(child => text(child as { text?: string; content?: unknown[] })).join(' ');
    return text(JSON.parse(value.slice(12)));
  } catch { return 'item'; }
}
function equalTarget(a: PreviewTarget | null, b: PreviewTarget | null) {
  return a?.sectionId === b?.sectionId && a?.rowId === b?.rowId && a?.columnId === b?.columnId && a?.elementId === b?.elementId;
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
    : current.content.sections ?? [];
  const targetFor = (id: string, anchor?: string) => document.querySelector<HTMLElement>(`[data-proof-section="${CSS.escape(id)}"],[data-proof-item="${CSS.escape(id)}"]`) || document.getElementById(anchor ?? id) || document.getElementById(`proof-item-${id}`);
  const validTarget = (input: unknown): PreviewTarget | null => {
    if (!input || typeof input !== 'object') return null;
    const value = input as Record<string, unknown>;
    if (Object.keys(value).some(key => !['sectionId', 'rowId', 'columnId', 'elementId'].includes(key))) return null;
    if (typeof value.sectionId !== 'string') return null;
    const section = sections.find(item => item.id === value.sectionId && !item.hidden);
    if (!section) return null;
    if (value.rowId === undefined) return value.columnId === undefined && value.elementId === undefined ? { sectionId: section.id } : null;
    const row = section.layout?.rows.find(item => item.id === value.rowId);
    if (!row) return null;
    if (value.columnId === undefined) return value.elementId === undefined ? { sectionId: section.id, rowId: row.id } : null;
    const column = row.columns.find(item => item.id === value.columnId);
    if (!column) return null;
    if (value.elementId === undefined) return { sectionId: section.id, rowId: row.id, columnId: column.id };
    return column.elements.some(item => item.id === value.elementId) ? { sectionId: section.id, rowId: row.id, columnId: column.id, elementId: value.elementId as string } : null;
  };
  const nodeFor = (target: PreviewTarget) => {
    const section = sections.find(item => item.id === target.sectionId);
    const root = targetFor(target.sectionId, section?.anchor);
    if (!root) return null;
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
  editingStyle.textContent = `body{padding-bottom:32px}[data-proof-column]:empty{min-height:112px}[data-proof-row]:empty{min-height:112px}[data-proof-element]{min-height:30px;margin-bottom:18px}[data-preview-pencils] button:focus-visible{outline:3px solid #297cca;outline-offset:3px}[data-preview-pencils] button:hover{background:#eaf3ff!important}`;
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
  const insertionHighlight = makeHighlight(true);
  const setSelected = (target: PreviewTarget | null) => {
    const changed = !equalTarget(selected, target);
    selected = target;
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
    button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); activeInsertion = control; activate(button); });
    layer.append(button); insertControls.push(control);
  };
  const showElements = (button: HTMLButtonElement, request: Record<string, unknown>) => {
    const menuTarget = validTarget({ sectionId: request.sectionId, rowId: request.rowId, columnId: request.columnId });
    const menuBounds = menuTarget ? boundsFor(menuTarget) : undefined;
    // The parent inspector must yield space to this chooser without clearing its selection.
    if (menuTarget && menuBounds) focus?.(menuTarget, asBounds(menuBounds), 'insert-menu');
    const insertion = activeInsertion;
    closeMenu(); activeInsertion = insertion;
    menu = document.createElement('div'); menu.setAttribute('role', 'toolbar'); menu.setAttribute('aria-label', 'Add element');
    Object.assign(menu.style, { position: 'absolute', pointerEvents: 'auto', display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '8px', maxWidth: 'calc(100vw - 16px)', borderRadius: '10px', background: '#fff', border: '1px solid #d2ddeb', boxShadow: '0 6px 24px #0003' });
    for (const type of ['text', 'image', 'button', 'video', 'card_group']) {
      const option = document.createElement('button'); option.type = 'button';
      const label = type === 'card_group' ? 'Cards' : type[0].toUpperCase() + type.slice(1);
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
          if (row.columns.length < 6) plus('Add column', `Add column after column ${columnIndex + 1}`, () => boundsFor(columnTarget), columnTarget, 'column', () => insert({ kind: 'column', sectionId: section.id, rowId: row.id, afterId: column.id }));
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
  const targetAt = (element: Element): PreviewTarget | null => {
    for (const section of sections.filter(item => !item.hidden)) {
      const root = targetFor(section.id, section.anchor);
      if (!root?.contains(element)) continue;
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
    if (!(event.target instanceof Element) || layer.contains(event.target)) return;
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
    if (menu) { closeMenu(); return; }
    if (selected) { setSelected(null); focus?.(null, null, 'dismiss'); }
  };
  let parentOrigin = location.origin;
  try { if (document.referrer) parentOrigin = new URL(document.referrer).origin; } catch { /* Empty/invalid referrers cannot establish a foreign parent. */ }
  let siteId = new URL(location.href).searchParams.get('siteId') ?? location.pathname.match(/\/admin\/sites\/([^/]+)\//)?.[1] ?? null;
  let selectionReadySent = false;
  const requestSelection = () => {
    if (selectionReadySent || !siteId || window.parent === window) return;
    selectionReadySent = true;
    window.parent.postMessage({ type: 'proofadmin-preview-selection-ready', protocol: 1, siteId, id: current.id }, parentOrigin);
  };
  const receiveSelection = (event: MessageEvent) => {
    if (event.source !== window.parent || event.origin !== parentOrigin || event.data?.protocol !== 1 || event.data?.id !== current.id) return;
    if (event.data.type === 'proofadmin-preview-content') {
      if (typeof event.data.siteId === 'string' && (!siteId || siteId === event.data.siteId)) { siteId = event.data.siteId; requestSelection(); }
      return;
    }
    if (event.data.type !== 'proofadmin-preview-selection' || !siteId || event.data.siteId !== siteId) return;
    if (event.data.target === null) { setSelected(null); closeMenu(); return; }
    const target = validTarget(event.data.target);
    if (target) setSelected(target);
  };
  const matchesContext = (target: PreviewTarget | null, context: PreviewTarget | null) => !!target && !!context && target.sectionId === context.sectionId && (!target.rowId || target.rowId === context.rowId) && (!target.columnId || target.columnId === context.columnId) && (!target.elementId || target.elementId === context.elementId);
  const visibleBounds = (bounds?: DOMRect) => !!bounds && bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0 && bounds.top < innerHeight && bounds.right > 0 && bounds.left < innerWidth;
  const placeHighlight = (highlight: HTMLDivElement, bounds?: DOMRect) => {
    highlight.style.display = visibleBounds(bounds) ? 'block' : 'none';
    if (bounds) Object.assign(highlight.style, { left: `${bounds.x}px`, top: `${bounds.y}px`, width: `${bounds.width}px`, height: `${bounds.height}px` });
  };
  const draw = () => {
    frame = 0;
    const selectionBounds = selected ? boundsFor(selected) : undefined;
    placeHighlight(selectionHighlight, selectionBounds);
    if (selected && selectionBounds && focus) {
      const next = JSON.stringify([selected, asBounds(selectionBounds)]);
      if (next !== previousPosition) { previousPosition = next; focus(selected, asBounds(selectionBounds), 'position'); }
    }
    for (const control of insertControls) {
      const bounds = control.bounds();
      const relevant = control.always || matchesContext(control.target, hovered) || matchesContext(control.target, selected) || control === activeInsertion;
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
      button.style.display = visibleBounds(bounds) ? 'block' : 'none';
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
    editingStyle.remove(); menu?.remove(); observer.disconnect(); resize.disconnect(); cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule, true); window.removeEventListener('resize', schedule); window.removeEventListener('message', receiveSelection);
    document.removeEventListener('pointermove', pointerMove); document.removeEventListener('pointerleave', pointerLeave); document.removeEventListener('click', click, true); document.removeEventListener('keydown', escape);
    layer.remove();
  };
}
