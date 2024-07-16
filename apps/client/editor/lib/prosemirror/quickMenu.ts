import type { EditorState, PluginView } from 'prosemirror-state';
import { Plugin, TextSelection } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import { forEach, keys } from 'lodash-es';
import { type BlockTypes, blocksRegistry } from '../blocksRegistry';

export const QUICK_MENU_PLUGIN_KEY = 'quickMenu';

class _QuickMenuView {
  dom: HTMLElement;
  readonly id = QUICK_MENU_PLUGIN_KEY;
  selectedIndex = ref(0);
  disposable = [watch(this.selectedIndex, (cur, prev) => {
    const prevSelected = this.dom.children[prev] as HTMLLIElement;
    prevSelected.classList.remove('bg-gray-300');
    const selected = this.dom.children[cur] as HTMLLIElement;
    selected.classList.add('bg-gray-300');
  })];

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
  }

  close() {
    this.dom.style.display = 'none';
  }

  open() {
    this.dom.style.display = 'block';
  }

  insertBlock(nodeType: BlockTypes) {
    const { state, dispatch } = this.view;
    const pos = state.selection.head;
    const tr = state.tr.delete(pos - 1, pos);
    const block = blocksRegistry[nodeType];
    const node = state.schema.nodes[block.nodeType].create();
    tr.insert(pos, node);

    // move selection to the end of the block
    tr.setSelection(TextSelection.near(tr.doc.resolve(pos + node.nodeSize)));
    dispatch(tr);
    this.close();
  }

  handleArrowUp() {
    this.selectedIndex.value--;
    if (this.selectedIndex.value < 0)
      this.selectedIndex.value = keys(blocksRegistry).length - 1;
  }

  handleArrowDown() {
    this.selectedIndex.value++;
    if (this.selectedIndex.value >= keys(blocksRegistry).length)
      this.selectedIndex.value = 0;
  }

  updatePos({
    top = 0,
    left = 0,
  }: {
    top: number
    left: number
  }) {
    const virtualEl = {
      getBoundingClientRect() {
        return {
          top,
          left,
          right: left,
          bottom: top,
          x: left,
          y: top,
          width: 0,
          height: 0,
        };
      },
    };
    computePosition(virtualEl, this.dom, {
      middleware: [offset({
        mainAxis: 20,
        crossAxis: 20,
      }), flip(), shift()],
    }).then(({ x, y }) => {
      Object.assign(this.dom.style, {
        top: `${y}px`,
        left: `${x}px`,
      });
    });
  }

  update() {}
  // update(view: EditorView, prevState: EditorState) {
  //   const currentState = view.state;
  //   if (prevState.doc.eq(currentState.doc))
  //     return;
  //   // check type of update because we only want to trigger the quick menu on new character insertion
  //   // not on deletion and selection change
  //   if (currentState.doc.textContent.length <= prevState.doc.textContent.length)
  //     return;

  //   // check last charachter
  //   const pos = currentState.selection.head;
  //   const node = currentState.doc.nodeAt(pos - 1);
  //   const text = node?.text || '';
  //   const lastChar = text[text.length - 1];
  //   if (lastChar !== '/') {
  //     this.close();
  //     return;
  //   }
  //   this.dom.style.display = 'block';
  //   const pixelPos = view.coordsAtPos(pos);
  //   const virtualEl = {
  //     getBoundingClientRect() {
  //       return {
  //         top: pixelPos.top,
  //         left: pixelPos.left,
  //         right: pixelPos.left,
  //         bottom: pixelPos.top,
  //         x: pixelPos.left,
  //         y: pixelPos.top,
  //         width: 0,
  //         height: 0,
  //       };
  //     },
  //   };
  //   computePosition(virtualEl, this.dom, {
  //     middleware: [offset({
  //       mainAxis: 15,
  //       crossAxis: 15,
  //     }), flip(), shift()],
  //   }).then(({ x, y }) => {
  //     Object.assign(this.dom.style, {
  //       top: `${y}px`,
  //       left: `${x}px`,
  //     });
  //     this.dom.focus();
  //   });
  // };

  destroy() {
    this.dom.remove();
    this.disposable.forEach(d => d());
  }
}

class QuickMenuView {
  static instance: _QuickMenuView;
  static init(view: EditorView) {
    QuickMenuView.instance = new _QuickMenuView(view);
    return QuickMenuView.instance;
  }

  get instance() {
    return QuickMenuView.instance;
  }
}
export const qucikMenuPlugin = new Plugin({
  view(view) {
    return QuickMenuView.init(view);
  },

  props: {
    handleKeyDown(view, event) {
      const { key } = event;
      if (key === 'Escape') {
        QuickMenuView.instance.close();
        return true;
      }
      if (key === 'ArrowDown') {
        QuickMenuView.instance.handleArrowDown();
        return true;
      }
      if (key === 'ArrowUp') {
        QuickMenuView.instance.handleArrowUp();
        return true;
      }
      if (key === 'Enter') {
        const selected = QuickMenuView.instance.dom.children[QuickMenuView.instance.selectedIndex.value] as HTMLLIElement;
        const nodeType = selected.id as BlockTypes;
        QuickMenuView.instance.insertBlock(nodeType);
        // we want to be able to insert a new line after the block
        return true;
      }
      return;
    },
    handleTextInput(view, _, to, text) {
      if (text === '/') {
        QuickMenuView.instance.open();
        const pixelPos = view.coordsAtPos(to);
        QuickMenuView.instance.updatePos({
          left: pixelPos.left,
          top: pixelPos.top,
        });
      }
    },
  },
});
