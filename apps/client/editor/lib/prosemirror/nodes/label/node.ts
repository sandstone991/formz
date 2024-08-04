import { Node, VueNodeViewRenderer, mergeAttributes } from '@tiptap/vue-3';
import Component from './component.vue';

export type LabelAttributes = {
  /*
  * We use a nubmer, because we will be using the position of the node in the document to identify it.
  */
  inputID: number | null
  inputPos: number | null
};
export const labelNode = Node.create({
  name: 'label',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',
  content: 'inline*',
  draggable: true,

  parseHTML() {
    return [
      { tag: 'label' },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['label', mergeAttributes(HTMLAttributes), 0];
  },
  addAttributes() {
    return {
      inputId: {
        default: null,
        keepOnSplit: false,
      },
      inputPos: {
        default: null,
        keepOnSplit: false,
      },
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(Component);
  },

});
