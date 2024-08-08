import { Extension } from '@tiptap/core';
import type { Transaction } from '@tiptap/pm/state';
import { formzProsemirrorNodes } from '../../nodes/index';

export interface UniqueIDOptions {
  attributeName: string
  types: string[]
  generateID: () => any
  filterTransaction: ((transaction: Transaction) => boolean) | null
}

export const HiddenBlocks = Extension.create<UniqueIDOptions>({
  name: 'hiddenBlocks',
  addGlobalAttributes() {
    return [
      {
        types: formzProsemirrorNodes.map(node => node.name),
        attributes: {
          hidden: {
            default: false,
          },
        },
      },
    ];
  },

});
