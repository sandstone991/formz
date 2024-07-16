import type { EditorState, PluginView } from 'prosemirror-state';
import { Plugin } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import { forEach, keys } from 'lodash-es';
import { type BlockTypes, blocksRegistry } from '../blocksRegistry';

export const QUICK_MENU_PLUGIN_KEY = 'quickMenu';

class QuickMenuViewPlugin implements PluginView {
  dom: HTMLElement;
  readonly id = QUICK_MENU_PLUGIN_KEY;
  selectedIndex = 0;
  constructor(public view: EditorView) {
    this.dom = document.createElement('ul');
    this.dom.id = this.id;
    this.dom.className = 'absolute bg-white border border-gray-300 shadow-md p-4 rounded-md z-50 flex flex-col gap-2 w-fit ';
    this.dom.style.display = 'none';
    this.dom.tabIndex = 0;
    this.dom.role = 'menu';
    const selectedClass = 'bg-gray-300';
    document.body.appendChild(this.dom);
    let first = true;
    forEach(blocksRegistry, (block) => {
      const button = document.createElement('li');
      button.id = block.nodeType;
      // set text of button
      const textSpan = document.createElement('span');
      textSpan.textContent = block.title;
      // set icon of button
      const icon = document.createElement('span');
      icon.className = block.icon;
      button.appendChild(icon);
      button.appendChild(textSpan);
      button.className = 'flex items-center gap-2 cursor-pointer hover:bg-gray-300 p-2';
      if (first) {
        button.classList.add(selectedClass);
        first = false;
      }
      this.dom.appendChild(button);
    });
    this.dom.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const { state, dispatch } = this.view;
        const pos = state.selection.head;
        const tr = state.tr.delete(pos - 1, pos);
        const selected = this.dom.children[this.selectedIndex] as HTMLLIElement;
        const nodeType = selected.id as BlockTypes;
        const block = blocksRegistry[nodeType];
        const node = state.schema.nodes[block.nodeType].create();
        tr.insert(pos, node);
        dispatch(tr);
        this.close();
        return;
      }
      if (e.key === 'Escape') {
        this.view.focus();
        this.close();
        return;
      }
      const prevSelected = this.dom.children[this.selectedIndex] as HTMLLIElement;
      prevSelected.classList.remove(selectedClass);
      if (e.key === 'ArrowDown') {
        this.selectedIndex++;
        if (this.selectedIndex >= keys(blocksRegistry).length)
          this.selectedIndex = 0;
      }
      else if (e.key === 'ArrowUp') {
        this.selectedIndex--;
        if (this.selectedIndex < 0)
          this.selectedIndex = keys(blocksRegistry).length - 1;
      }
      const selected = this.dom.children[this.selectedIndex] as HTMLLIElement;
      selected.focus();
      selected.classList.add(selectedClass);
    });
  }

  close() {
    this.dom.style.display = 'none';
  }

  update(view: EditorView, prevState: EditorState) {
    const currentState = view.state;
    if (prevState.doc.eq(currentState.doc))
      return;
    // check type of update because we only want to trigger the quick menu on new character insertion
    // not on deletion and selection change
    if (currentState.doc.textContent.length <= prevState.doc.textContent.length)
      return;

    // check last charachter
    const pos = currentState.selection.head;
    const node = currentState.doc.nodeAt(pos - 1);
    const text = node?.text || '';
    const lastChar = text[text.length - 1];
    if (lastChar !== '/') {
      this.close();
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
      this.dom.focus();
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
