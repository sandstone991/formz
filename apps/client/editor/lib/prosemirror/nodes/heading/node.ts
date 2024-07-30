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
  parseHTML() {
    return [{ tag: 'h1', attrs: { level: 1 } }, { tag: 'h2', attrs: { level: 2 } }, { tag: 'h3', attrs: { level: 3 } }, { tag: 'h4', attrs: { level: 4 } }, { tag: 'h5', attrs: { level: 5 } }, { tag: 'h6', attrs: { level: 6 } }];
  },
  draggable: true,
});
