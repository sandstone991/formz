import { Plugin } from '@tiptap/pm/state';
import { Extension } from '@tiptap/vue-3';
import { paragraphNode } from '../nodes/paragraph';
import { changedDescendants, removeColumnAtTransform } from './utils';
import { Column } from './Column';

export const DeleteColumnWhenEmpty = Extension.create({
  name: 'deleteColumnWhenEmpty',
  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        appendTransaction(_, oldState, newState) {
          let tr = newState.tr;
          let changed = false;
          changedDescendants(oldState.doc, newState.doc, 0, (node, pos) => {
            if (node.type.name !== Column.name)
              return;

            if (node.childCount === 0) {
              changed = true;
              tr = removeColumnAtTransform({
                editor,
                pos: pos + 1,
                tr,
              });
            }
            else if (node.childCount === 1) {
              const child = node.child(0);
              if (child.type.name === paragraphNode.name && child.content.size === 0) {
                changed = true;
                tr = removeColumnAtTransform({
                  editor,
                  pos: pos + 1,
                  tr,
                });
              }
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
