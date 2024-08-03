import { Node, VueNodeViewRenderer, mergeAttributes } from '@tiptap/vue-3';
import Component from './component.vue';

export const InputNode = Node.create({
  name: 'input',

  content: 'inline*',
  group: 'block',
  defining: true,
  isolating: true,

  addNodeView() {
    return VueNodeViewRenderer(Component);
  },
  renderHTML({ HTMLAttributes }) {
    return ['input', mergeAttributes(HTMLAttributes), 0];
  },
  parseHTML() {
    return [{ tag: 'input' }];
  },

  draggable: true,
});
