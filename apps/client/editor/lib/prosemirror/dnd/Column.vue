<script setup lang="ts">
import { NodeViewContent, nodeViewProps } from '@tiptap/vue-3';
import FormzNodeViewWrapper from '../nodes/FormzNodeViewWrapper.vue';
import type { ColumnAttributes } from './Column';
import ResizeHandle from './ResizeHandle.vue';
import { useIsFirstChild } from '../composables';

const props = defineProps(nodeViewProps);
const attrs = props.node.attrs as ColumnAttributes;
const isFirstChild = useIsFirstChild (props);

</script>

<template>
  <FormzNodeViewWrapper :drag-enabled="false" data-column class="relative" :style="{
    width: `${attrs.widthPercentage}%`,
  }">
    <NodeViewContent
      as="div" class="column" 
    />
    <ResizeHandle v-if="!isFirstChild"/>

  </FormzNodeViewWrapper>
</template>

<style scoped>
.column {
    padding: 8px;
    margin: -8px;
}
</style>
