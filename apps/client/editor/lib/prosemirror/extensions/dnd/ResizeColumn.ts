import { Plugin } from '@tiptap/pm/state';
import { Extension, findChildren } from '@tiptap/vue-3';
import { changedDescendants, isColumnBlock } from './utils';
import { ColumnBlock } from './ColumnBlock';
import { Column } from './Column';

export const ResizeColumns = Extension.create({
  name: 'resizeColumns',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(transactions, oldState, newState) {
          let tr = newState.tr;
          let changed = false;
          const shouldCheck = transactions.some(transaction => transaction.docChanged);
          if (!shouldCheck)
            return;
          changedDescendants(oldState.doc, newState.doc, 0, (node, changedPos) => {
            if (isColumnBlock(node)) {
              const oldBlock = oldState.doc.nodeAt(oldState.tr.mapping.map(changedPos));
              let oldColumnsCount = oldBlock?.childCount ?? 0;

              if (!oldBlock || !isColumnBlock(oldBlock)) {
                oldColumnsCount = 0;
              }

              const columnCount = node.childCount;
              if (oldColumnsCount === columnCount)
                return;
              changed = true;
              const percentage = +(100 / columnCount).toFixed(2);
              const children = findChildren(node, child => child.type.name === Column.name);
              children.forEach((child) => {
                const oldPercentage = child.node.attrs.widthPercentage;
                let newPercentage = percentage;
                if (oldPercentage && oldColumnsCount) {
                  newPercentage = +(oldPercentage * (oldColumnsCount / columnCount)).toFixed(2);
                }
                tr = tr.setNodeMarkup(child.pos + changedPos + 1, undefined, { widthPercentage: newPercentage });
              });
            }
          });
          if (changed) {
            return tr;
          }
        },
      }),
    ];
  },
});
