import { Node, VueNodeViewRenderer, mergeAttributes } from '@tiptap/vue-3';
import HeadingComponent from './component.vue';

export const HeadingNode = Node.create({
  name: 'heading',

  addAttributes() {
    return {
      level: {
        default: 1,
        isRequired: true,

      },
    };
  },
  content: 'inline*',
  group: 'block',
  defining: true,
  addNodeView() {
    return VueNodeViewRenderer(HeadingComponent);
  },
  renderHTML({ HTMLAttributes }) {
    return ['h', mergeAttributes(HTMLAttributes), 0];
  },
});
