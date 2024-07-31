<script setup lang="ts">
import {  NodeViewContent, nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3';

defineProps(nodeViewProps);

</script>

<template>
  <NodeViewWrapper  >
    <NodeViewContent class="column-block"/>
  </NodeViewWrapper>
</template>

<style scoped>
.column-block {
  width: 100%;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 24px;
  padding: 8px 0;
}
</style>
