<script setup lang="ts">
import {  NodeViewContent, nodeViewProps } from '@tiptap/vue-3';
import FormzNodeViewWrapper from '../FormzNodeViewWrapper.vue';
import { useIsEmpty, useProvideNodeProps } from '../../composables';
import { isColumn } from '../../extensions/dnd/utils';
const props = defineProps(nodeViewProps);
useProvideNodeProps(props);
const isEmpty = useIsEmpty(props);
const isFullWidth = computed(()=>isColumn(props.editor.state.doc.resolve(props.getPos()).parent))

</script>

<template>
  <FormzNodeViewWrapper class=" w-full" :selectable="true" >
    <div class="input" :class="[{'w-full': isFullWidth}, {'md:w-1/2': !isFullWidth}]">
    <NodeViewContent
      as="p"
      :class="{'placeholderPlaceholder': isEmpty}"
      :data-placeholder="props.node.attrs.placeholder || 'Type placeholder here...'" 
      
      class="inputPlaceholder"
    />
    </div>
  </FormzNodeViewWrapper>
</template>

<style scoped>
.input{
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  outline: none;
  height: 50px;
  color: #333;
  background-color: #fff;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  resize: none;
  
  
}
.inputPlaceholder{
  color: #ccc;
  font-style: italic;
  height: 30px;
  width: 100%;
  overflow: hidden;
}
.placeholderPlaceholder::before {
  content: attr(data-placeholder);
  color: #ccc;
  font-style: italic;
  float: inline-start;
  height: 30px;
  pointer-events: none;
  text-align: start;
  overflow: hidden;

}
</style>
