import { Plugin } from '@tiptap/pm/state';
import { Extension } from '@tiptap/vue-3';
import { nanoid } from 'nanoid';
import { inputNodes } from '../../nodes';

export const UniqueId = Extension.create({
  name: 'uniqueId',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(transactions, _, newState) {
          const shouldCheck = transactions.some(transaction => transaction.docChanged);
          let changed = false;
          if (!shouldCheck)
            return;
          let tr = newState.tr;
          newState.doc.descendants((node, pos) => {
            if (node.attrs.id || !inputNodes.has(node.type.name))
              return;
            changed = true;
            tr = tr.setNodeMarkup(pos, undefined, { id: nanoid() });
          });
          if (changed)
            return tr;
        },
      }),
    ];
  },
});
