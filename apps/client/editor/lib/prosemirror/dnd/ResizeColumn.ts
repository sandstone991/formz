import { Plugin } from '@tiptap/pm/state';
import { Extension, findChildren } from '@tiptap/vue-3';
import { changedDescendants } from './utils';
import { ColumnBlock } from './ColumnBlock';
import { Column } from './Column';

export const ResizeColumns = Extension.create({
  name: 'resizeColumns',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(_, oldState, newState) {
          let tr = newState.tr;
          let changed = false;

          changedDescendants(oldState.doc, newState.doc, 0, (node, changedPos) => {
            if (node.type.name === ColumnBlock.name) {
              changed = true;
              const oldColumnsCount = oldState.doc.nodeAt(oldState.tr.mapping.map(changedPos))?.childCount ?? 0;
              const columnCount = node.childCount;
              if (oldColumnsCount === columnCount)
                return;
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
