import type { NodeType } from '@tiptap/pm/model';
import type { Transaction } from '@tiptap/pm/state';
import type { Editor } from '@tiptap/core';
import { getNodeType } from '@tiptap/vue-3';

export function deleteNode({ tr, typeOrName, editor }: {
  tr: Transaction
  typeOrName: string | NodeType
  editor: Editor
}) {
  const type = getNodeType(typeOrName, editor.state.schema);
  const $pos = tr.selection.$anchor;

  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);

    if (node.type === type) {
      const from = $pos.before(depth);
      const to = $pos.after(depth);

      tr.delete(from, to).scrollIntoView();

      return tr;
    }
  }

  return tr;
}
