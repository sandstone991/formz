import { Node } from '@tiptap/vue-3';

export type BaseInputNodeAttrs = {
  id: string | null
};

export const BaseInputNode = Node.create({
  addAttributes() {
    return {
      id: {
        default: null,
      },
      labelText: {
        default: 'Untitled input',
      },
      labelTextExplicitlySet: {
        default: false,
      },
      defaultAnswerEnabled: {
        default: false,
      },
      defaultAnswer: {
        default: '',
      },
    };
  },
});
