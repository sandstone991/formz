<script setup lang="ts">
import { NodeViewContent, nodeViewProps } from '@tiptap/vue-3';
import type { ColumnAttributes } from './Column';
import ResizeHandle from './ResizeHandle.vue';
import { useIsFirstChild } from '../../composables';
import FormzNodeViewWrapper from '../../nodes/FormzNodeViewWrapper.vue';

const props = defineProps(nodeViewProps);
const width = computed(() => (props.node.attrs as ColumnAttributes).widthPercentage + "%");
const isFirstChild = useIsFirstChild (props);

</script>

<template>
  <FormzNodeViewWrapper :drag-enabled="false" data-column class="relative" :style="{
   width,
  }">
    <NodeViewContent
      as="div" class="column" 
    />
    <ResizeHandle v-bind="props" v-if="!isFirstChild"/>

  </FormzNodeViewWrapper>
</template>

<style scoped>
.column {
}
</style>
