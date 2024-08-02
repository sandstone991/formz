import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import ColumnComponent from './Column.vue';

export const Column = Node.create({
  name: 'column',
  group: 'column',
  content: 'block*',
  isolating: true,
  selectable: false,
  draggable: false,
  addNodeView() {
    return VueNodeViewRenderer(ColumnComponent);
  },
  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(HTMLAttributes, { class: 'column' });
    return ['div', attrs, 0];
  },
  parseHTML() {
    return [{ tag: 'div.column' }];
  },
});
