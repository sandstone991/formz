<script setup lang="ts">
import {  NodeViewContent, nodeViewProps } from '@tiptap/vue-3';
import FormzNodeViewWrapper from '../nodes/FormzNodeViewWrapper.vue';

defineProps(nodeViewProps);

</script>

<template>
  <FormzNodeViewWrapper :drag-enabled="false" data-column-block>    
    <NodeViewContent class="column-block"/>
  </FormzNodeViewWrapper>
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
