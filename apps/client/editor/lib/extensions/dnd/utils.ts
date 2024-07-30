import type { JSONContent } from '@tiptap/core';
import type { Node, ResolvedPos } from 'prosemirror-model';

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
  return buildNode({ type: 'column', content });
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
  throw new Error('no ancestor found');
}
