import type { Fragment, ParseOptions, Node as ProseMirrorNode } from '@tiptap/pm/model';
import { createNodeFromContent, selectionToInsertionEnd } from '@tiptap/vue-3';
import type { Content, Editor, Range } from '@tiptap/core';

import type { Transaction } from '@tiptap/pm/state';

function isFragment(nodeOrFragment: ProseMirrorNode | Fragment): nodeOrFragment is Fragment {
  return !('type' in nodeOrFragment);
}
export type InsertContentAtOptions = {
  /**
   * Options for parsing the content.
   */
  parseOptions?: ParseOptions

  /**
   * Whether to update the selection after inserting the content.
   */
  updateSelection?: boolean

  /**
   * Whether to apply input rules after inserting the content.
   */
  applyInputRules?: boolean

  /**
   * Whether to apply paste rules after inserting the content.
   */
  applyPasteRules?: boolean

  /**
   * Whether to throw an error if the content is invalid.
   */
  errorOnInvalidContent?: boolean
};
export function insertContentAt({ position, value, options = {}, editor, tr }: { position: number | Range, value: Content, options: InsertContentAtOptions, editor: Editor, tr: Transaction }) {
  options = {
    parseOptions: {},
    updateSelection: true,
    applyInputRules: false,
    applyPasteRules: false,
    ...options,
  };
  let content: Fragment | ProseMirrorNode;

  try {
    content = createNodeFromContent(value, editor.schema, {
      parseOptions: {
        preserveWhitespace: 'full',
        ...options.parseOptions,
      },
      errorOnInvalidContent: options.errorOnInvalidContent ?? editor.options.enableContentCheck,
    });
  }
  catch (e) {
    editor.emit('contentError', {
      editor,
      error: e as Error,
      disableCollaboration: () => {
        console.error('[tiptap error]: Unable to disable collaboration at this point in time');
      },
    });
    return tr;
  }
  let { from, to } = typeof position === 'number' ? { from: position, to: position } : { from: position.from, to: position.to };

  let isOnlyTextContent = true;
  let isOnlyBlockContent = true;
  const nodes = isFragment(content) ? content : [content];

  nodes.forEach((node) => {
    // check if added node is valid
    node.check();

    isOnlyTextContent = isOnlyTextContent ? node.isText && node.marks.length === 0 : false;

    isOnlyBlockContent = isOnlyBlockContent ? node.isBlock : false;
  });
  // check if we can replace the wrapping node by
  // the newly inserted content
  // example:
  // replace an empty paragraph by an inserted image
  // instead of inserting the image below the paragraph
  if (from === to && isOnlyBlockContent) {
    const { parent } = tr.doc.resolve(from);
    const isEmptyTextBlock = parent.isTextblock && !parent.type.spec.code && !parent.childCount;

    if (isEmptyTextBlock) {
      from -= 1;
      to += 1;
    }
  } let newContent;

  // if there is only plain text we have to use `insertText`
  // because this will keep the current marks
  if (isOnlyTextContent) {
    // if value is string, we can use it directly
    // otherwise if it is an array, we have to join it
    if (Array.isArray(value)) {
      newContent = value.map(v => v.text || '').join('');
    }
    else if (typeof value === 'object' && !!value && !!value.text) {
      newContent = value.text;
    }
    else {
      newContent = value as string;
    }

    tr.insertText(newContent, from, to);
  }
  else {
    newContent = content;

    tr.replaceWith(from, to, newContent);
  }

  // set cursor at end of inserted content
  if (options.updateSelection) {
    selectionToInsertionEnd(tr, tr.steps.length - 1, -1);
  }

  if (options.applyInputRules) {
    tr.setMeta('applyInputRules', { from, text: newContent });
  }

  if (options.applyPasteRules) {
    tr.setMeta('applyPasteRules', { from, text: newContent });
  }
  return tr;
}
