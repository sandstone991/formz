<script setup lang="ts">
import { NodeViewContent, NodeViewWrapper, isNodeEmpty, nodeViewProps } from '@tiptap/vue-3';

const props = defineProps(nodeViewProps);
const isEmpty = ref(true);
const node = props.node;
const level = node.attrs.level;
onUpdated(() => {
  isEmpty.value = isNodeEmpty(props.node);
});
</script>

<template>
  <NodeViewWrapper>
    <NodeViewContent
      :data-placeholder="props.node.attrs.placeholder || 'Heading'" :as="`h${level}`" :class="{
        placeholder: isEmpty,
      }"
    />
  </NodeViewWrapper>
</template>

<style scoped>
.placeholder::before {
  content: attr(data-placeholder);
  color: #ccc;
  font-style: italic;
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
