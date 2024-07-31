import type { Content, Editor } from '@tiptap/core';
import type { Transaction } from '@tiptap/pm/state';
import { type InsertContentAtOptions, insertContentAt } from './insertContentAt';

export function insertContent({ value, options = {}, editor, tr }: { value: Content, options?: InsertContentAtOptions, editor: Editor, tr: Transaction }) {
  return insertContentAt({
    position: {
      from: tr.selection.from,
      to: tr.selection.to,
    },
    value,
    options,
    editor,
    tr,
  });
}
