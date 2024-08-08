<script setup lang="ts">
import { NodeViewContent, nodeViewProps } from '@tiptap/vue-3';
import FormzNodeViewWrapper from '../FormzNodeViewWrapper.vue';
import { useIsEmpty, useProvideNodeProps } from '../../composables';

const props = defineProps(nodeViewProps);
useProvideNodeProps(props);

const isEmpty = useIsEmpty(props);
</script>

<template>
  <FormzNodeViewWrapper>
    <NodeViewContent
      :data-placeholder="props.node.attrs.placeholder || 'Write something'" as="label" :class="{
        placeholder: isEmpty,
      }"
      :for="props.node.attrs.inputId"
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
