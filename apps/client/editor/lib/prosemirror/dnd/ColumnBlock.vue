<script setup lang="ts">
import {  NodeViewContent, nodeViewProps } from '@tiptap/vue-3';
import FormzNodeViewWrapper from '../nodes/FormzNodeViewWrapper.vue';

defineProps(nodeViewProps);

</script>

<template>
  <FormzNodeViewWrapper :drag-enabled="false"  data-column-block>    
    <NodeViewContent class="column-block"/>
  </FormzNodeViewWrapper>
</template>

<style scoped>
.column-block {
  position: relative;
  display: flex;
  padding: 8px;
}
</style>
