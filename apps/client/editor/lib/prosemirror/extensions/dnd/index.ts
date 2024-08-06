import type { Editor, NodePos } from '@tiptap/core';
import { Extension } from '@tiptap/core';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import type { Input, Position } from '@atlaskit/pragmatic-drag-and-drop/types';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';

import type {
  Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { clamp, debounce } from 'lodash-es';
import { Column } from './Column';
import { ColumnBlock } from './ColumnBlock';
import { buildColumn, buildColumnBlock, findWrapperNode } from './utils';
import { DeleteColumnWhenEmpty } from './DeleteColumnWhenEmpty';
import { ResizeColumns } from './ResizeColumn';

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

function rectDistance(point: Position, rect: Rect): number {
  const px = point.x;
  const py = point.y;
  const rx1 = rect.x;
  const ry1 = rect.y;
  const rx2 = rect.x + rect.width;
  const ry2 = rect.y + rect.height;

  // Calculate distances to the sides of the rectangle
  const leftDist = Math.abs(px - rx1);
  const rightDist = Math.abs(px - rx2);
  const bottomDist = Math.abs(py - ry1);
  const topDist = Math.abs(py - ry2);

  if (px >= rx1 && px <= rx2 && py >= ry1 && py <= ry2) {
    // Point is inside the rectangle, calculate the minimum distance to an edge
    return Math.min(leftDist, rightDist, bottomDist, topDist);
  }
  else {
    // Point is outside the rectangle, calculate distance to the closest point on the rectangle
    const closestX = Math.max(rx1, Math.min(px, rx2));
    const closestY = Math.max(ry1, Math.min(py, ry2));

    // Calculate the distance from the point to the closest point on the rectangle
    const distanceX = px - closestX;
    const distanceY = py - closestY;

    // Use Pythagorean theorem to calculate the distance
    return Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  }
}

const updateListeners = debounce((node: NodePos, editor: Editor) => {
  detachDragListeners();
  recurse(node, editor, attachDragListeners);
}, 100);
/**
 * @note This extension disables the default drag and drop behavior of the editor
 */
export const Dnd = Extension.create<any, DndExtensionStorage>({
  name: 'dnd',
  onCreate() {
    recurse(this.editor.$doc, this.editor, attachDragListeners);
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
        if (args.source.element === closestElement)
          return { pos: -1, [uniqueKey]: null };
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
        let startPos = self.data.pos as number;
        if (startPos === -1) {
          return;
        }
        let node = this.editor.$pos(startPos);
        if (!node)
          return;

        if (closestEdge && ['left', 'right'].includes(closestEdge)) {
          if (node.parent?.node.type.name === Column.name) {
            startPos = node.parent.pos;
            node = node.parent;
          }
          else if (node.node.type.name === ColumnBlock.name) {
            if (closestEdge === 'left') {
              startPos = node.firstChild!.pos;
              node = node.firstChild!;
            }
            else {
              startPos = node.lastChild!.pos;
              node = node.lastChild!;
            }
          }
        }

        const endPos = startPos - 1 + node.node.nodeSize;
        this.storage.overNode.value = {
          start: startPos - 1,
          end: endPos,
        };

        this.storage.closestEdge.value = closestEdge;
      },
      onDragLeave: () => {
        this.storage.closestEdge.value = null;
        this.storage.overNode.value = null;
      },
      onDrop: () => {
        if (this.storage.closestEdge.value === null || this.storage.overNode.value === null)
          return;
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
          let isOverColumn = false;
          const overNode = this.editor.state.doc.nodeAt(overStartPos);
          if (overNode?.type.name === Column.name) {
            isOverColumn = true;
          }
          const newColumn = buildColumn(sliceContent);
          if (isOverColumn) {
            const tr = this.editor.state.tr;
            tr.deleteRange(draggedStartPos, draggedEndPos);
            const columnNode = this.editor.state.doc.type.schema.nodeFromJSON(newColumn);
            if (columnNode === null) {
              return;
            }
            if (this.storage.closestEdge.value === 'right') {
              tr.insert(tr.mapping.map(overEndPos), columnNode);
            }
            else {
              tr.insert(tr.mapping.map(overStartPos), columnNode);
            }
            this.editor.view.dispatch(tr);
          }
          else {
            // create a new column block with the new column
            const overNodeContent = this.editor.state.doc.slice(overStartPos, overEndPos).toJSON();
            const overNodeColumns = buildColumn(overNodeContent);
            const content = this.storage.closestEdge.value === 'right' ? [overNodeColumns, newColumn] : [newColumn, overNodeColumns];
            const columnBlock = buildColumnBlock({
              content,
            });
            const newNode = this.editor.state.doc.type.schema.nodeFromJSON(columnBlock);
            if (newNode === null) {
              return;
            }
            const tr = this.editor.state.tr;
            tr.deleteRange(draggedStartPos, draggedEndPos);
            tr.deleteRange(tr.mapping.map(overStartPos), tr.mapping.map(overEndPos));
            const newOverStartPos = tr.mapping.map(overStartPos);
            tr.insert(newOverStartPos, newNode);
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
    updateListeners(this.editor.$doc, this.editor);
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
    return [Column, ColumnBlock, DeleteColumnWhenEmpty, ResizeColumns];
  },
});
function noop() {}
function recurse(node: NodePos, editor: Editor, fn: (node: NodePos, editor: Editor) => void) {
  if (node.node.type.name !== 'doc')
    fn(node, editor);
  node.children.forEach(child => recurse(child, editor, fn));
}

function findDropArea(element: Element) {
  if (element.getAttribute('data-droparea') !== null) {
    return element;
  }
  return element.querySelector('[data-droparea]');
}
function attachDragListeners(node: NodePos, editor: Editor) {
  const dragEnabled = node.node.type.spec.draggable;
  const draggableElement = findWrapperNode(node.element);
  const dom = findDropArea(draggableElement!)!;
  const dragHandle = draggableElement!.querySelector('[data-drag-handle]') ?? undefined;

  if (node.node.type.name === 'column')
    return;
  const dispose = combine(
    dragEnabled
      ? draggable({
        element: draggableElement!,
        getInitialData: () => ({
          pos: node.pos,
        }),
        dragHandle,
        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview(({
            render({ container }) {
              const preview = document.createElement('div');
              const copy = draggableElement!.cloneNode(true) as Element;
              const boundingRect = draggableElement!.getBoundingClientRect();
              const width = clamp(boundingRect.width, 100, 300);
              const height = clamp(boundingRect.height, 100, 300);
              preview.style.width = `${width}px`;
              preview.style.height = `${height}px`;
              const dragHandle = copy.querySelector('[data-drag-handle]')?.parentElement;
              if (dragHandle) {
                dragHandle.remove();
              }
              preview.appendChild(copy);
              if (node.node.type.name === 'label' && node.attributes.inputId) {
                const input = findWrapperNode(editor.view.domAtPos(node.attributes.inputPos + 1).node as HTMLElement);
                if (input) {
                  const inputClone = input.cloneNode(true) as HTMLElement;
                  const inputBoundingRect = input.getBoundingClientRect();
                  const width = clamp(inputBoundingRect.width, 100, 300);
                  const height = clamp(inputBoundingRect.height, 100, 300);
                  inputClone.style.width = `${width}px`;
                  inputClone.style.height = `${height}px`;
                  preview.appendChild(inputClone);
                }
              }
              container.appendChild(preview);
            },
            nativeSetDragImage,
          }));
        },
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
      })
      : noop,
    register(dom),
  );
  Dnd.storage.disposables.push(dispose);
}

function detachDragListeners() {
  Dnd.storage.disposables.forEach(dispose => dispose());
  Dnd.storage.disposables = [];
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
