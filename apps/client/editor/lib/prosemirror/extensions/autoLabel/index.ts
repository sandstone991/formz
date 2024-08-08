import type { EditorState, Transaction } from '@tiptap/pm/state';
import { Plugin } from '@tiptap/pm/state';

import { Extension, findParentNodeClosestToPos } from '@tiptap/vue-3';
import { flatten } from 'prosemirror-utils';
import { isColumnBlock, isInputNode } from '../dnd/utils';
import { labelNode } from '../../nodes/label';

function getChildIndex(childPos: number, parentPos: number, editorState: EditorState) {
  const node = editorState.doc.nodeAt(parentPos);
  if (!node)
    return -1;
  const children = flatten(node, false).map(item => ({ node: item.node, pos: item.pos + parentPos }));
  const index = children.findIndex(child => childPos > child.pos && childPos < child.pos + child.node.nodeSize);
  return index;
}

function getLeftOrRightSiblingColumnChildAtTheSameIndex(nodePos: number, leftOrRight: 'left' | 'right', editorState: EditorState) {
  const resPos = editorState.doc.resolve(nodePos);
  const columnBlock = findParentNodeClosestToPos(resPos, isColumnBlock);
  if (!columnBlock)
    return null;
  const columns = flatten(columnBlock.node, false).map(item => ({ node: item.node, pos: item.pos + columnBlock.start }));
  if (columns.length <= 1)
    return null;
  const targetColumnIndex = columns.findIndex(column => nodePos > column.pos && nodePos < column.pos + column.node.nodeSize);
  if (targetColumnIndex === -1)
    return null;
  const adjacentColumnIndex = targetColumnIndex + (leftOrRight === 'left' ? -1 : 1);
  const adjacentColumn = columns[adjacentColumnIndex];
  if (!adjacentColumn)
    return null;
  const targetChildIndex = getChildIndex(nodePos, columns[targetColumnIndex].pos, editorState);
  const adjacentColumnChild = flatten(adjacentColumn.node, false).map(item => ({ node: item.node, pos: item.pos + adjacentColumn.pos }))[targetChildIndex];
  if (!adjacentColumnChild)
    return null;
  return { node: adjacentColumnChild.node, pos: adjacentColumnChild.pos + 1 };
}

export const AutoLabel = Extension.create({
  name: 'autoLabel',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(transactions, prevState, newState) {
          const tr = newState.tr;

          let changed = false;
          const shouldCheck = transactions.some((transaction) => {
            return transaction.docChanged;
          },
          ) && !prevState.doc.eq(newState.doc);
          if (!shouldCheck)
            return;
          newState.doc.descendants((node, pos) => {
            if (node.type.name !== labelNode.name)
              return;
            changed = true;
            let newInputId = null;
            const nodeAfter = newState.doc.nodeAt(pos + node.nodeSize);
            if (nodeAfter && isInputNode(nodeAfter) && nodeAfter.attrs.id) {
              newInputId = nodeAfter.attrs.id;
              tr.setNodeMarkup(pos, undefined, { inputId: nodeAfter.attrs.id, inputPos: pos + node.nodeSize });
              if (!nodeAfter.attrs.labelTextExplicitlySet)
                tr.setNodeAttribute(pos + node.nodeSize, 'labelText', node.textContent);
            }
            if (!newInputId) {
              const rightSibling = getLeftOrRightSiblingColumnChildAtTheSameIndex(pos, 'right', newState);
              if (rightSibling && isInputNode(rightSibling.node) && rightSibling.node.attrs.id) {
                newInputId = rightSibling.node.attrs.id;
                tr.setNodeMarkup(pos, undefined, { inputId: rightSibling.node.attrs.id, inputPos: rightSibling.pos });
                if (!rightSibling.node.attrs.labelTextExplicitlySet)
                  tr.setNodeAttribute(rightSibling.pos, 'labelText', node.textContent);
              }
            }
            if (!newInputId) {
              tr.setNodeMarkup(pos, undefined, { inputId: null, inputPos: null });
            }
          });

          if (changed)
            return tr;
        },
      }),
    ];
  },
});
