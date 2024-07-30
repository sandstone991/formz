<script setup lang="ts">
import { cn } from '@/lib/utils';

// port of https://github.com/atlassian/pragmatic-drag-and-drop/blob/main/packages/react-drop-indicator/src/box.tsx to Vue 3
const props = defineProps<{ edge: 'top' | 'bottom' | 'left' | 'right', gap?: number }>();
const TERMINAL_SIZE = 10;
const LINE = {
  borderRadius: 0,
  thickness: 2,
  backgroundColor: '#6e69b8',
};
const offsetToAlignTerminalWithLine = (LINE.thickness - TERMINAL_SIZE) / 2;
const lineOffset = 0;
const localLineOffset = -0.5 * (LINE.thickness + (props.gap ?? 10));
const edgeToOrientationMap = {
  top: 'horizontal',
  bottom: 'horizontal',
  left: 'vertical',
  right: 'vertical',
} as const;
const orientation = computed(() => edgeToOrientationMap[props.edge]);
</script>

<template>
  <div contenteditable="false" :class="cn('line', orientation, edge)" />
</template>

<style scoped>
.line {
  display: block;
  position: absolute;
  z-index: 1;
  pointer-events: none;
  background-color: #6e69b8;
}
.line::before {
  content: '';
  width: v-bind('`${TERMINAL_SIZE}px`');
  height: v-bind('`${TERMINAL_SIZE}px`');
  box-sizing: border-box;
  position: absolute;
}
.horizontal {
  height: v-bind('`${LINE.thickness}px`');
  left: v-bind('`${lineOffset}px`');
  right: 0;
}
.horizontal::before {
  left: v-bind('`${-TERMINAL_SIZE}px`');
}
.vertical {
  width: v-bind('`${LINE.thickness}px`');
  top: v-bind('`${lineOffset}px`');
  bottom: 0;
}
.vertical::before {
  top: v-bind('`${-TERMINAL_SIZE}px`');
}
.top {
  top: v-bind('`${localLineOffset}px`');
}
.top::before {
  right: v-bind('`${offsetToAlignTerminalWithLine}px`');
}
.right {
  right: v-bind('`${localLineOffset}px`');
}
.right::before {
  right: v-bind('`${offsetToAlignTerminalWithLine}px`');
}
.bottom {
  bottom: v-bind('`${localLineOffset}px`');
}
.bottom::before {
  right: v-bind('`${offsetToAlignTerminalWithLine}px`');
}
.left {
  left: v-bind('`${localLineOffset}px`');
}
.left::before {
  right: v-bind('`${offsetToAlignTerminalWithLine}px`');
}
</style>
