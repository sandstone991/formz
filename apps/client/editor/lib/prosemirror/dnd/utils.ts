import type { Editor, JSONContent } from '@tiptap/core';
import { NodeSelection, type Transaction } from '@tiptap/pm/state';
import type { Node, ResolvedPos } from 'prosemirror-model';
import { deleteNode } from '../transfroms/deleteNode';
import { insertContent } from '../transfroms/insertContent';
import { insertContentAt } from '../transfroms/insertContentAt';

function times<T>(n: number, fn: (i: number) => T): T[] {
  return Array.from({ length: n }, (_, i) => fn(i));
}

export function buildNode({ type, content }: JSONContent): JSONContent {
  return content ? { type, content } : { type };
}

export function buildParagraph({ content }: Partial<JSONContent>) {
  return buildNode({ type: 'paragraph', content });
}

export function buildColumn({ content }: Partial<JSONContent>) {
  return buildNode({ type: 'column', content, attrs: {
    widthPercentage: 50,
  } });
}

export function buildColumnBlock({ content }: Partial<JSONContent>) {
  return buildNode({ type: 'columnBlock', content });
}

export function buildNColumns(n: number) {
  const content = [buildParagraph({})];
  const fn = () => buildColumn({ content });
  return times(n, fn);
}

interface PredicateProps {
  node: Node
  pos: number
  start: number
}

export type Predicate = (props: PredicateProps) => boolean;

export function findParentNodeClosestToPos($pos: ResolvedPos, predicate: Predicate) {
  for (let i = $pos.depth; i > 0; i--) {
    const node = $pos.node(i);
    const pos = i > 0 ? $pos.before(i) : 0;
    const start = $pos.start(i);
    if (predicate({ node, pos, start })) {
      return {
        start,
        depth: i,
        node,
        pos,
      };
    }
  }
}

export function changedDescendants(old: Node, cur: Node, offset: number, f: (node: Node, offset: number) => void) {
  const oldSize = old.childCount; const curSize = cur.childCount;
  // eslint-disable-next-line
  outer: for (let i = 0, j = 0; i < curSize; i++) {
    const child = cur.child(i);
    for (let scan = j, e = Math.min(oldSize, i + 3); scan < e; scan++) {
      // eslint-disable-next-line
      if (old.child(scan) == child) {
        j = scan + 1;
        offset += child.nodeSize;
        // eslint-disable-next-line
        continue outer;
      }
    }
    f(child, offset);
    if (j < oldSize && old.child(j).sameMarkup(child))
      changedDescendants(old.child(j), child, offset + 1, f);
    else
      child.nodesBetween(0, child.content.size, f, offset + 1);
    offset += child.nodeSize;
  }
}

export function removeColumnAtTransform({ tr, editor, pos }: { tr: Transaction, editor: Editor, pos: number }): Transaction {
  const mappedPos = tr.mapping.map(pos);
  const resPos = tr.doc.resolve(mappedPos);
  const where: Predicate = ({ node }) => {
    return node.type.name === 'columnBlock';
  };

  const columnBlock = findParentNodeClosestToPos(resPos, where);
  if (columnBlock === undefined) {
    return tr;
  }
  const columns: { node: Node, pos: number }[] = [];
  columnBlock.node.descendants((node, pos) => {
    if (node.type.name === 'column') {
      columns.push({ node, pos: pos + columnBlock.pos });
      return false;
    }
    return true;
  });
  // find index of the column to remove from pos
  let index = -1;
  columns.forEach((child, i) => {
    if (resPos.pos > child.pos && resPos.pos <= child.pos + child.node.nodeSize) {
      index = i;
    }
  });

  const columnsFiltered = columns.filter((_, i) => i !== index);
  if (columnsFiltered.length === 1) {
    const childrenSlice = columnsFiltered[0].node.content.toJSON();
    const sel = new NodeSelection(tr.doc.resolve(columnBlock.pos));
    tr = tr.setSelection(sel);
    tr = tr.deleteSelection();
    tr = insertContentAt({ editor, tr, value: childrenSlice, position: columnBlock.pos });
    return tr;
  }
  else {
    const childrenSlice = columnsFiltered.map(({ node }) => node.toJSON());
    const sel = new NodeSelection(tr.doc.resolve(columnBlock.pos));
    tr = tr.setSelection(sel);
    tr = tr.deleteSelection();
    const newColumnBlock = buildColumnBlock({ content: childrenSlice });
    const newColumnBlockNode = editor.state.doc.type.schema.nodeFromJSON(newColumnBlock);
    tr = tr.insert(columnBlock.pos, newColumnBlockNode);
    return tr;
  }
}

export function removeColumnTransform({ tr, editor }: { tr: Transaction, editor: Editor }) {
  const pos = tr.selection.$from.pos;
  return removeColumnAtTransform({ tr, editor, pos });
}
