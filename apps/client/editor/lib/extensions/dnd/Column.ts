import { Node, mergeAttributes } from '@tiptap/core';

export const Column = Node.create({
  name: 'column',
  group: 'column',
  content: '(block)*',
  isolating: true,
  selectable: false,
  draggable: true,
  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(HTMLAttributes, { class: 'column' });
    return ['div', attrs, 0];
  },
  addAttributes() {
    return {
      'draggable': {
        default: false,
        parseHTML: (element) => {
          return { draggable: element.getAttribute('draggable') };
        },
        renderHTML: (attributes) => {
          return { draggable: attributes.draggable };
        },
      },
      'data-drop-target-for-element': {
        default: 'false',
        parseHTML: (element) => {
          return { 'data-drop-target-for-element': element.getAttribute('data-drop-target-for-element') };
        },
        renderHTML: (attributes) => {
          return { 'data-drop-target-for-element': attributes['data-drop-target-for-element'] };
        },
      },
    };
  },
});
