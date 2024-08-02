<script setup lang="ts">
import { NodeViewContent } from '@tiptap/vue-3';
import FormzNodeViewWrapper from '../nodes/FormzNodeViewWrapper.vue';


</script>

<template>
  <FormzNodeViewWrapper :drag-enabled="false" data-column>
    <NodeViewContent
      as="div" class="column" 
    />
  </FormzNodeViewWrapper>
</template>

<style scoped>
.column {
    padding: 8px;
    margin: -8px;
}
</style>
