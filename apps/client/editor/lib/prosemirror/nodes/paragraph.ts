import type { NodeSpec } from 'prosemirror-model';

export const paragraphSpec: NodeSpec = {
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
