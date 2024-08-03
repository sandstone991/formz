<script setup lang="ts">
import { NodeViewContent, isNodeEmpty, nodeViewProps } from '@tiptap/vue-3';
import FormzNodeViewWrapper from '../FormzNodeViewWrapper.vue';
import { useIsEmpty, useProvideNodeProps } from '../../composables';

const props = defineProps(nodeViewProps);
const isEmpty = useIsEmpty(props);
const node = props.node;
const level = node.attrs.level;
useProvideNodeProps(props);
</script>

<template>
  <FormzNodeViewWrapper>
    <NodeViewContent
      :data-placeholder="props.node.attrs.placeholder || 'Heading'" :as="`h${level}`" class="text-start" :class="{
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
  float: inline-start;
  height: 0;
  pointer-events: none;
  text-align: start;
}
</style>
