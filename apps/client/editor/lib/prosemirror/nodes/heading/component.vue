<script setup lang="ts">
import { NodeViewContent, isNodeEmpty, nodeViewProps } from '@tiptap/vue-3';
import FormzNodeViewWrapper from '../FormzNodeViewWrapper.vue';

const props = defineProps(nodeViewProps);
const isEmpty = ref(isNodeEmpty(props.node));
const node = props.node;
const level = node.attrs.level;
onUpdated(() => {
  isEmpty.value = isNodeEmpty(props.node);
});
</script>

<template>
  <FormzNodeViewWrapper>
    <NodeViewContent
      :data-placeholder="props.node.attrs.placeholder || 'Heading'" :as="`h${level}`" :class="{
        placeholder: isEmpty,
      }"
    />
  </FormzNodeViewWrapper>
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
