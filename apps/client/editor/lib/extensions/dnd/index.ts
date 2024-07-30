import type { NodePos } from '@tiptap/core';
import { Extension } from '@tiptap/core';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import type { Input, Position } from '@atlaskit/pragmatic-drag-and-drop/types';
import './index.css';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type {
  Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { clamp } from 'lodash-es';
import { Column } from './Column';
import { ColumnBlock } from './ColumnBlock';
import { buildColumn, buildColumnBlock } from './utils';

const uniqueKey = Symbol('closestEdge');
const registery = new Set<Element>();
function register(element: Element) {
  registery.add(element);
  return () => {
    registery.delete(element);
  };
}
const getDistanceToEdge: {
  [TKey in Edge]: (rect: DOMRect, client: Position) => number;
} = {
  top: (rect, client) => Math.abs(client.y - rect.top),
  right: (rect, client) => Math.abs(rect.right - client.x),
  bottom: (rect, client) => Math.abs(rect.bottom - client.y),
  left: (rect, client) => Math.abs(client.x - rect.left),
};
function isPointInRect(point: Position, rect: DOMRect) {
  return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
}
// modification of https://github.com/atlassian/pragmatic-drag-and-drop/blob/main/packages/hitbox/src/closest-edge.ts
// because we want to right and left edges to have more priority than top and bottom
export function attachClosestEdge(
  userData: Record<string | symbol, unknown>,
  {
    element,
    input,
    allowedEdges,
  }: {
    element: Element
    input: Input
    allowedEdges: Edge[]
  },
): Record<string | symbol, unknown> {
  const client: Position = {
    x: input.clientX,
    y: input.clientY,
  };
  // I tried caching the result of `getBoundingClientRect()` for a single
  // frame in order to improve performance.
  // However, on measurement I saw no improvement. So no longer caching

  const rect: DOMRect = element.getBoundingClientRect();
  if (isPointInRect(client, rect)) {
    const entries = allowedEdges.map((edge) => {
      return {
        edge,
        value: getDistanceToEdge[edge](rect, client),
      };
    });

    // edge can be `null` when `allowedEdges` is []
    const addClosestEdge: Edge | null = entries.sort((a, b) => a.value - b.value)[0]?.edge ?? null;

    return {
      ...userData,
      [uniqueKey]: addClosestEdge,
    };
  }
  else {
    if (client.x > rect.right) {
      return {
        ...userData,
        [uniqueKey]: 'right',
      };
    }
    if (client.x < rect.left) {
      return {
        ...userData,
        [uniqueKey]: 'left',
      };
    }
    return {
      ...userData,
      [uniqueKey]: client.y > rect.top ? 'bottom' : 'top',
    };
  }
}
export function extractClosestEdge(userData: Record<string | symbol, unknown>): Edge | null {
  return (userData[uniqueKey] as Edge) ?? null;
}

type Rect = { x: number, y: number, width: number, height: number };

export function rectDistance(point: Position, rect: Rect) {
  const left = rect.x;
  const top = rect.y;
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;

  const nearestX = clamp(point.x, left, right);
  const nearestY = clamp(point.y, top, bottom);

  const dx = point.x - nearestX;
  const dy = point.y - nearestY;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * @note This extension disables the default drag and drop behavior of the editor
 */
export const Dnd = Extension.create<any, DndExtensionStorage>({
  name: 'dnd',
  onCreate() {
    recurse(this.editor.$doc, attachDragListeners);
    dropTargetForElements({
      element: this.editor.view.dom,
      getIsSticky: () => true,
      getData: (args) => {
        let closestElement: Element | null = null;
        // search for closest element from the registry
        const clientX = args.input.clientX;
        const clientY = args.input.clientY;
        let minDistance = Infinity;
        for (const element of registery) {
          const rect = element.getBoundingClientRect();
          const distance = rectDistance({ x: clientX, y: clientY }, {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          });
          if (distance < minDistance) {
            minDistance = distance;
            closestElement = element;
          }
        }
        if (closestElement) {
          const pos = this.editor.view.posAtDOM(closestElement, 0);
          if (pos > -1) {
            return attachClosestEdge({ pos }, {
              element: closestElement,
              allowedEdges: ['top', 'right', 'bottom', 'left'],
              input: args.input,
            });
          }
        }
        return {
          pos: -1,
          [uniqueKey]: null,
        };
      },
      onDrag: ({ self }) => {
        const closestEdge = extractClosestEdge(self.data);
        const startPos = self.data.pos as number;
        const node = this.editor.state.doc.nodeAt(startPos - 1);
        if (node) {
          const endPos = startPos - 1 + node.nodeSize;
          this.storage.overNode.value = {
            start: startPos - 1,
            end: endPos,
          };
        }
        this.storage.closestEdge.value = closestEdge;
      },
      onDragLeave: () => {
        this.storage.closestEdge.value = null;
        this.storage.overNode.value = null;
      },
      onDrop: () => {
        // to appeal to the type checker

        if (['top', 'bottom'].includes(this.storage.closestEdge.value!)) {
          // slice the node at the position
          const startPos = this.storage.lastDraggedNodePos.value!.start;
          const endPos = this.storage.lastDraggedNodePos.value!.end;
          const overNodeEndPos = this.storage.overNode.value!.end;
          const overNodeStartPos = this.storage.overNode.value!.start;
          const tr = this.editor.state.tr;
          const node = this.editor.state.doc.slice(startPos, endPos).content.lastChild!;
          if (this.storage.closestEdge.value === 'top') {
            tr.insert(overNodeStartPos, node);
          }
          else {
            tr.insert(overNodeEndPos, node);
          }
          const newStartPos = tr.mapping.map(startPos);
          const newEndPos = tr.mapping.map(endPos);
          tr.delete(newStartPos, newEndPos);
          this.editor.view.dispatch(tr);
        }
        else {
          const draggedStartPos = this.storage.lastDraggedNodePos.value!.start;
          const draggedEndPos = this.storage.lastDraggedNodePos.value!.end;
          const slice = this.editor.state.doc.slice(draggedStartPos, draggedEndPos);
          const sliceContent = slice.toJSON();
          const overStartPos = this.storage.overNode.value!.start;
          const overEndPos = this.storage.overNode.value!.end;
          let isOverAlreadyColumn = false;
          const overNode = this.editor.state.doc.nodeAt(overStartPos);
          if (overNode?.type.name === Column.name) {
            isOverAlreadyColumn = true;
          }
          const newColumn = buildColumn(sliceContent);
          if (isOverAlreadyColumn) {
            // add the new column to the columns block
            const columnBlock = this.editor.$pos(overStartPos).parent?.node;
            // todo
          }
          else {
            // create a new column block with the new column
            const overNodeContent = this.editor.state.doc.slice(overStartPos, overEndPos).toJSON();
            const overNodeColumns = buildColumn(overNodeContent);
            const columnBlock = buildColumnBlock({
              content: [overNodeColumns, newColumn],
            });
            console.log(columnBlock);
            const newNode = this.editor.state.doc.type.schema.nodeFromJSON(columnBlock);
            if (newNode === null) {
              return;
            }
            const tr = this.editor.state.tr;
            tr.insert(overStartPos, newNode);
            this.editor.view.dispatch(tr);
          }
        }
        this.storage.closestEdge.value = null;
        this.storage.overNode.value = null;
      },
    });
    this.editor.view.setProps({
      handleDrop: () => {
        // prevent default drop behavior
        return true;
      },
      handleDOMEvents: {
        dragstart: (_, event) => {
          // prevent default drag behavior for text nodes
          if (event.target instanceof Text) {
            event.preventDefault();
          }
        },

      },
    });
  },

  onUpdate() {
    detachDragListeners();
    recurse(this.editor.$doc, attachDragListeners);
  },
  addStorage() {
    return {
      draggingState: ref({
        type: 'idle',
      }),
      closestEdge: ref(null),
      overNode: ref(null),
      lastDraggedNodePos: ref(null),
      disposables: [],
    };
  },
  addExtensions() {
    return [Column, ColumnBlock];
  },
});

function recurse(node: NodePos, fn: (node: NodePos) => void) {
  if (node.node.type.name !== 'doc')
    fn(node);
  node.children.forEach(child => recurse(child, fn));
}

function attachDragListeners(node: NodePos) {
  const dom = node.element;
  const dragHandle = dom.parentElement!.querySelector('[data-drag-handle]') ?? undefined;
  const dispose = combine(
    draggable({
      element: dom.parentElement!,
      getInitialData: () => ({
        pos: node.pos,
      }),
      dragHandle,
      canDrag: () => !!node.node.type.spec.draggable,
      onDragStart: () => {
        Dnd.storage.draggingState.value = {
          type: 'dragging',
          startPos: node.pos,
          endPos: node.pos + node.node.nodeSize,
        };
      },
      onDrop: () => {
        Dnd.storage.lastDraggedNodePos.value = {
          start: node.pos - 1,
          end: node.pos - 1 + node.node.nodeSize,
        };
        Dnd.storage.draggingState.value = {
          type: 'idle',
        };
      },
    }),
    register(dom),
  );
  Dnd.storage.disposables.push(dispose);
}

function detachDragListeners() {
  Dnd.storage.disposables.forEach(dispose => dispose());
}

export type DraggingState =
  | {
    type: 'idle'
  }
  | {
    type: 'dragging'
    startPos: number
    endPos: number
  };
export type DndExtensionStorage = {
  draggingState: Ref<DraggingState>
  lastDraggedNodePos: Ref<{
    start: number
    end: number
  } | null>
  closestEdge: Ref<Edge | null>
  overNode: Ref<{
    start: number
    end: number
  } | null>
  disposables: (() => void)[]
};
