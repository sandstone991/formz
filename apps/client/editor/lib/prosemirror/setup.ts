import { keymap } from 'prosemirror-keymap';
import { history } from 'prosemirror-history';
import { baseKeymap } from 'prosemirror-commands';
import type { Plugin } from 'prosemirror-state';
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import type { Schema } from 'prosemirror-model';
import { buildKeymap } from './keymap';
import { qucikMenuPlugin } from './quickMenu';
import 'prosemirror-view/style/prosemirror.css';

export function baseSetup({
  schema,
  userKeymap,
}: { schema: Schema, userKeymap?: { [key: string]: string | false } }): Plugin[] {
  const plugins = [
    keymap(buildKeymap(schema, userKeymap)),
    keymap(baseKeymap),
    dropCursor(),
    gapCursor(),
    history(),
    qucikMenuPlugin,
  ];
  return plugins;
}
