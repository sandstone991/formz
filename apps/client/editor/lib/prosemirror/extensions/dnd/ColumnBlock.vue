<script setup lang="ts">
import {  NodeViewContent, nodeViewProps } from '@tiptap/vue-3';
import FormzNodeViewWrapper from '../../nodes/FormzNodeViewWrapper.vue';

defineProps(nodeViewProps);

</script>

<template>
  <FormzNodeViewWrapper :drag-enabled="false"  data-column-block>    
    <NodeViewContent class="flex flex-col sm:flex-row gap-4"/>
  </FormzNodeViewWrapper>
</template>

<style scoped>

</style>
