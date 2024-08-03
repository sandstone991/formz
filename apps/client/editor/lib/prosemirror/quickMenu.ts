import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import { forEach, keys } from 'lodash-es';
import { search } from 'fast-fuzzy';
import { Extension } from '@tiptap/vue-3';
import type { EditorView } from '@tiptap/pm/view';
import { Plugin, TextSelection } from '@tiptap/pm/state';
import { type BlockTypes, blocksRegistry } from './nodes';

export const QUICK_MENU_PLUGIN_KEY = 'quickMenu';
const selectedClass = 'bg-gray-300';

class _QuickMenu {
  dom: HTMLElement;
  readonly id = QUICK_MENU_PLUGIN_KEY;
  selectedIndex = ref(0);
  searchText = ref('');
  lastSlashPos = -1;
  isOpen = false;
  disposable = [watch(this.selectedIndex, (cur, prev) => this.switchActiveClass(cur, prev)), watch(this.searchText, () => this.generateMenu())];

  constructor(public view: EditorView) {
    this.dom = document.createElement('ul');
    this.dom.id = this.id;
    this.dom.className = 'absolute bg-white border border-gray-300 shadow-md p-4 rounded-md z-50 flex flex-col gap-2 w-fit ';
    this.dom.style.display = 'none';
    this.dom.tabIndex = 0;
    this.dom.role = 'menu';
    document.body.appendChild(this.dom);
    this.generateMenu();
  }

  switchActiveClass(cur: number, prev: number) {
    const prevSelected = this.dom.children[prev] as HTMLLIElement;
    prevSelected.classList.remove('bg-gray-300');
    const selected = this.dom.children[cur] as HTMLLIElement;
    selected.classList.add('bg-gray-300');
  }

  generateMenu() {
    // clear the menu
    this.dom.innerHTML = '';
    let first = true;
    const blockKeys = keys(blocksRegistry);
    const filteredBlocks = this.searchText.value
      ? search(this.searchText.value, blockKeys, {
        ignoreCase: true,
      })
      : keys(blocksRegistry);
    forEach(filteredBlocks, (key) => {
      const block = blocksRegistry[key as BlockTypes];
      const button = document.createElement('li');
      button.id = key;
      const textSpan = document.createElement('span');
      textSpan.textContent = block.title;
      const icon = document.createElement('span');
      icon.className = block.icon;
      button.appendChild(icon);
      button.appendChild(textSpan);
      button.className = 'flex items-center gap-2 cursor-pointer hover:bg-gray-300 p-2';
      if (first) {
        button.classList.add(selectedClass);
        first = false;
      }
      button.addEventListener('click', () => {
        this.insertBlock(block.nodeType as BlockTypes);
        this.view.focus();
      });
      this.dom.appendChild(button);
    });
  }

  close() {
    this.isOpen = false;
    this.selectedIndex.value = 0;
    this.searchText.value = '';
    this.lastSlashPos = -1;
    this.dom.style.display = 'none';
  }

  open() {
    this.isOpen = true;
    this.dom.style.display = 'block';
  }

  insertBlock(nodeType: BlockTypes) {
    const { state, dispatch } = this.view;
    const pos = state.selection.head;
    const tr = state.tr.delete(this.lastSlashPos, pos);
    const mapping = tr.mapping;
    const posToInsertAfterDeletion = mapping.map(pos);
    const block = blocksRegistry[nodeType];
    const node = state.schema.nodes[block.nodeType].create(block.initialAttrs);
    tr.insert(posToInsertAfterDeletion, node);
    tr.setSelection(TextSelection.near(tr.doc.resolve(posToInsertAfterDeletion + node.nodeSize)));
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

  destroy() {
    this.dom.remove();
    this.disposable.forEach(d => d());
  }
}

class QuickMenu {
  static instance: _QuickMenu;
  static init(view: EditorView) {
    QuickMenu.instance = new _QuickMenu(view);
    return QuickMenu.instance;
  }

  get instance() {
    return QuickMenu.instance;
  }
}
export const qucikMenuPlugin = new Plugin({
  view(view) {
    return QuickMenu.init(view);
  },

  props: {

    handleKeyDown(view, event) {
      const { key } = event;
      if (key === 'Backspace') {
        QuickMenu.instance.searchText.value = QuickMenu.instance.searchText.value.slice(0, -1);
        if (view.state.selection.head - 1 === QuickMenu.instance.lastSlashPos) {
          QuickMenu.instance.close();
        }
        return false;
      }
      if (key === 'Escape') {
        if (!QuickMenu.instance.isOpen)
          return false;
        QuickMenu.instance.close();
        return true;
      }
      if (key === 'ArrowDown') {
        if (!QuickMenu.instance.isOpen)
          return false;
        QuickMenu.instance.handleArrowDown();
        return true;
      }
      if (key === 'ArrowUp') {
        if (!QuickMenu.instance.isOpen)
          return false;
        QuickMenu.instance.handleArrowUp();
        return true;
      }
      if (key === 'ArrowLeft') {
        if (!QuickMenu.instance.isOpen)
          return false;
        const isBehindSlash = view.state.selection.head - 1 === QuickMenu.instance.lastSlashPos;
        if (isBehindSlash) {
          QuickMenu.instance.close();
          return false;
        }
      }

      if (key === 'Enter') {
        if (!QuickMenu.instance.isOpen)
          return false;
        const selected = QuickMenu.instance.dom.children[QuickMenu.instance.selectedIndex.value] as HTMLLIElement;
        if (!selected) {
          QuickMenu.instance.close();
          return true;
        }
        const nodeType = selected.id as BlockTypes;
        QuickMenu.instance.insertBlock(nodeType);
        // we want to be able to insert a new line after the block
        return true;
      }
      return false;
    },

    handleTextInput(view, _, to, text) {
      if (QuickMenu.instance.isOpen) {
        const from = QuickMenu.instance.lastSlashPos;
        const searchTextSlice = view.state.doc.textBetween(from + 1, to) + text;
        QuickMenu.instance.searchText.value = searchTextSlice;
      }
      else if (text === '/') {
        QuickMenu.instance.lastSlashPos = to;
        QuickMenu.instance.open();
        const pixelPos = view.coordsAtPos(to);
        QuickMenu.instance.updatePos({
          left: pixelPos.left,
          top: pixelPos.top,
        });
      }
    },

  },
});

export const QuickMenuExtension = Extension.create({
  name: 'quickMenu',
  addProseMirrorPlugins() {
    return [qucikMenuPlugin];
  },
});
