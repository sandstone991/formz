import type { EditorState, Plugin, type PluginView } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import { computePosition, flip, offset, shift } from '@floating-ui/dom';

export const QUICK_MENU_PLUGIN_KEY = 'quickMenu';

class QuickMenuViewPlugin implements PluginView {
  dom: HTMLElement;
  readonly id = QUICK_MENU_PLUGIN_KEY;
  constructor(public view: EditorView) {
    this.dom = document.createElement('div');
    this.dom.id = this.id;
  }

  update(view: EditorView, prevState: EditorState) {
    const currentState = view.state;
    if (prevState.doc.eq(currentState.doc))
      return;
  }

  destroy() {

  }
}

const qucikMenuPlugin = new Plugin({
  view(view) {

  },
  key: QUICK_MENU_PLUGIN_KEY,
  state,
});
