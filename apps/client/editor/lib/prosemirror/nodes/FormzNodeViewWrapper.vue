<script setup lang="ts">

import DragHandle from '../extensions/dnd/DragHandle.vue';
import DropIndicator from '../extensions/dnd/DropIndicator.vue';
import { editorDependecyKey, isProductionDependecyKey } from '../provide';
import type { DndExtensionStorage } from '../extensions/dnd';
import { Primitive, type AsTag } from 'radix-vue';
import { useInjectNodeProps, usePositionFromDom } from '../composables';
import { isNumber } from 'lodash-es';

const props = withDefaults(defineProps<{
    as?: string | globalThis.Component | AsTag ,
    dragEnabled?: boolean,
    selectable?: boolean,
}>(), {
    as: 'div',
    dragEnabled: true,
    selectable: false,
});
const nodeProps = useInjectNodeProps();
const nodeViewRef = ref<HTMLElement | null>(null);
const isHovered = ref(false);
const editor = inject(editorDependecyKey);
const isProduction = inject(isProductionDependecyKey);
const dndStorage = editor?.value?.storage.dnd as DndExtensionStorage
const isDragOver = computed(() => {
  if(!isNumber(nodeProps.getPos())) return false
  if(!dndStorage) return false
  if(dndStorage.draggingState.value.type !== "dragging") return false
  if(dndStorage.overNode.value?.start === nodeProps.getPos()) return true
  return false
} );

  const isSelected = computed(()=>{
    if(!props.selectable) return false
    if(!editor?.value) return false
    const { from, to } = editor.value.state.selection;
    if(!isNumber(nodeProps.getPos()))  return false
    return nodeProps.getPos() >= from && nodeProps.getPos() <= to
  })

 

</script>

<template>
  <Primitive 
  data-droparea=""
    :ref="(v)=>{
      if(!v) return
      // @ts-expect-error 
      nodeViewRef = v.$el 
    }"
    v-bind="props"    
    @mouseover="()=>{
        isHovered = true;
    }"
    @mouseleave="isHovered = false"
    :class="[{'selected': isSelected}, {'isHidden': nodeProps.node.attrs.hidden}]"
    data-node-view-wrapper=""
     class="relative p-1" >
    <DragHandle v-if="dragEnabled && !isProduction" :is-hovered="isHovered" />
    <DropIndicator v-if="dndStorage.closestEdge.value &&isDragOver && !isProduction" :edge="dndStorage?.closestEdge.value!"  
    :gap="['left', 'right'].findIndex((e)=>e === dndStorage.closestEdge.value) !== -1? 10 : .8"  />
    <slot />
  </Primitive>
</template>

<style scoped>
  .selected{
    background-color: var(--selected-background);
  }
  .isHidden{
    opacity: 0.3;
  }
</style>
