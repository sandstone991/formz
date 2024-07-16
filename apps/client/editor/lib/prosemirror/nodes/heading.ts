import type { NodeSpec } from 'prosemirror-model';

export type Level = 1 | 2 | 3 | 4 | 5 | 6;

export const headingSpec: NodeSpec = {
  attrs: {
    level: { default: 1 },
  },
  draggable: true,
  defining: true,
  group: 'block',
  toDOM(node) {
    return [`h${node.attrs.level}`, 0];
  },
};
