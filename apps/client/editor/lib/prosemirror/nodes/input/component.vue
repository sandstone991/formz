<script setup lang="ts">
import { findParentNode, NodeViewContent, nodeViewProps } from '@tiptap/vue-3';
import FormzNodeViewWrapper from '../FormzNodeViewWrapper.vue';
import { NodeSelection } from '@tiptap/pm/state';
const props = defineProps(nodeViewProps);
const isFullWidth = computed(()=>!!findParentNode((node)=>node.type.name === "column")(new NodeSelection(props.editor.$doc.node.resolve(props.getPos()))))
</script>

<template>
  <FormzNodeViewWrapper class="input w-full" :class="[{'w-full': isFullWidth}, {'md:w-1/2': !isFullWidth}]">
    <NodeViewContent
    
      class="placeholder"
    />
  </FormzNodeViewWrapper>
</template>

<style scoped>
.input{
  display: inline-block;
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
.placeholder{
  color: #ccc;
  font-style: italic;
  height: 0;
  width: 100%;
}
</style>
