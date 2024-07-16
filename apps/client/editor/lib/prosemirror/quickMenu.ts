import type { EditorState, PluginView } from 'prosemirror-state';
import { Plugin } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import { computePosition, flip, offset, shift } from '@floating-ui/dom';

export const QUICK_MENU_PLUGIN_KEY = 'quickMenu';

class QuickMenuViewPlugin implements PluginView {
  dom: HTMLElement;
  readonly id = QUICK_MENU_PLUGIN_KEY;
  constructor(public view: EditorView) {
    this.dom = document.createElement('menu');
    this.dom.id = this.id;
    this.dom.className = 'absolute bg-white border border-gray-300 shadow-md p-2 rounded-md z-50';
    this.dom.style.display = 'none';
    document.body.appendChild(this.dom);
  }

  update(view: EditorView, prevState: EditorState) {
    const currentState = view.state;
    if (prevState.doc.eq(currentState.doc))
      return;
    // check last charachter
    const pos = currentState.selection.head;
    const node = currentState.doc.nodeAt(pos - 1);
    const text = node?.text || '';
    const lastChar = text[text.length - 1];
    if (lastChar !== '/') {
      this.dom.style.display = 'none';
      return;
    }
    this.dom.style.display = 'block';
    const pixelPos = view.coordsAtPos(pos);
    const virtualEl = {
      getBoundingClientRect() {
        return {
          top: pixelPos.top,
          left: pixelPos.left,
          right: pixelPos.left,
          bottom: pixelPos.top,
          x: pixelPos.left,
          y: pixelPos.top,
          width: 0,
          height: 0,
        };
      },
    };
    this.dom.focus();
    computePosition(virtualEl, this.dom, {
      middleware: [offset({
        mainAxis: 15,
        crossAxis: 15,
      }), flip(), shift()],
    }).then(({ x, y }) => {
      Object.assign(this.dom.style, {
        top: `${y}px`,
        left: `${x}px`,
      });
    });
  };

  destroy() {
    this.dom.remove();
  }
}

export const qucikMenuPlugin = new Plugin({
  view(view) {
    return new QuickMenuViewPlugin(view);
  },

});
