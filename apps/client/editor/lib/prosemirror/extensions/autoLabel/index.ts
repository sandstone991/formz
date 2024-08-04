import type { EditorState } from '@tiptap/pm/state';
import { Plugin } from '@tiptap/pm/state';
import { Extension, findChildren, findParentNodeClosestToPos } from '@tiptap/vue-3';

import type { Node } from '@tiptap/pm/model';
import { changedDescendants, isColumn, isColumnBlock } from '../dnd/utils';
import { labelNode } from '../../nodes/label';
import { inputNodes } from '../../nodes';

function getChildIndex(childPos: number, parentPos: number, editorState: EditorState) {
  const parent = editorState.doc.nodeAt(parentPos);
  if (!parent)
    return -1;
  return parent.childAfter(childPos).index;
}

function isInputNode(node: Node) {
  return inputNodes.has(node.type.name);
}

function getLeftOrRightSiblingColumnChildAtTheSameIndex(nodePos: number, leftOrRight: 'left' | 'right', editorState: EditorState) {
  const resPos = editorState.doc.resolve(nodePos);
  const columnBlock = findParentNodeClosestToPos(resPos, isColumnBlock);
  if (!columnBlock)
    return null;
  const column = findParentNodeClosestToPos(resPos, isColumn);
  if (!column)
    return null;
  const columnIndex = getChildIndex(column.pos, columnBlock.pos, editorState);
  if (columnIndex === -1)
    return null;
  const rightSiblingColumn = columnBlock.node.child(columnIndex + (leftOrRight === 'left' ? -1 : 1));
  if (!rightSiblingColumn)
    return null;
  const childIndex = getChildIndex(nodePos, column.pos, editorState);
  if (childIndex === -1)
    return null;

  const child = rightSiblingColumn.child(childIndex);
  if (!child)
    return null;
  const [nodeWithPos] = findChildren(rightSiblingColumn, (node) => {
    return node === child;
  });
  if (!nodeWithPos)
    return null;
  return nodeWithPos;
}

export const AutoLabel = Extension.create({
  name: 'autoLabel',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(transactions, _, newState) {
          const tr = newState.tr;
          let changed = false;
          const shouldCheck = transactions.some((transaction) => {
            return transaction.docChanged;
          },
          );
          if (!shouldCheck)
            return;
          newState.doc.descendants((node, pos) => {
            if (node.type.name !== labelNode.name)
              return;
            const nodeAfter = newState.doc.nodeAt(pos + node.nodeSize);
            if (nodeAfter && isInputNode(nodeAfter)) {
              tr.setNodeMarkup(pos, undefined, { inputId: nodeAfter.attrs.id, inputPos: pos + node.nodeSize });
              changed = true;
              return;
            }
            const leftSibling = getLeftOrRightSiblingColumnChildAtTheSameIndex(pos, 'left', newState);
            if (leftSibling && isInputNode(leftSibling.node)) {
              tr.setNodeMarkup(pos, undefined, { inputId: leftSibling.node.attrs.id, inputPos: leftSibling.pos });
              changed = true;
              return;
            }
          });
          if (changed)
            return tr;
        },
      }),
    ];
  },
});
