import { VueNodeViewRenderer, mergeAttributes } from '@tiptap/vue-3';
import { BaseInputNode } from '../baseInputNode';
import Component from './component.vue';

export const InputNode = BaseInputNode.extend({
  name: 'input',
  content: 'inline*',
  group: 'block',
  defining: true,
  isolating: true,
  draggable: true,
  selectable: true,
  addNodeView() {
    return VueNodeViewRenderer(Component);
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0];
  },
  parseHTML() {
    return [{ tag: 'div' }];
  },

});
