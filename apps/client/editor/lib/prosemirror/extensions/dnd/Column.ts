import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import { Plugin } from '@tiptap/pm/state';
import ColumnComponent from './Column.vue';

export type ColumnAttributes = {
  widthPercentage: number | null
};
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
  addAttributes() {
    return {
      widthPercentage: null,
    };
  },
  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(HTMLAttributes, { class: 'column' });
    return ['div', attrs, 0];
  },
  parseHTML() {
    return [{ tag: 'div.column' }];
  },

});
