import { Node, VueNodeViewRenderer, mergeAttributes } from '@tiptap/vue-3';
import ParagraphComponent from './component.vue';

export interface ParagraphOptions {
  /**
   * The HTML attributes for a paragraph node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraph: {
      /**
       * Toggle a paragraph
       * @example editor.commands.toggleParagraph()
       */
      setParagraph: () => ReturnType
    }
  }
}

export const paragraphNode = Node.create<ParagraphOptions>({
  name: 'paragraph',

  priority: 1000,

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
      { tag: 'p' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setParagraph: () => ({ commands }) => {
        return commands.setNode(this.name);
      },
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(ParagraphComponent);
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-0': () => this.editor.commands.setParagraph(),
    };
  },
});
