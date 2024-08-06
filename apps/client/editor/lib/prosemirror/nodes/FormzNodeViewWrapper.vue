<script setup lang="ts">

import DragHandle from '../extensions/dnd/DragHandle.vue';
import DropIndicator from '../extensions/dnd/DropIndicator.vue';
import { editorDependecyKey, isProductionDependecyKey } from '../provide';
import type { DndExtensionStorage } from '../extensions/dnd';
import { Primitive, type AsTag } from 'radix-vue';
import { usePositionFromDom } from '../composables';
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
const nodeViewRef = ref<HTMLElement | null>(null);
const isHovered = ref(false);
const editor = inject(editorDependecyKey);
const isProduction = inject(isProductionDependecyKey);
const dndStorage = editor?.value?.storage.dnd as DndExtensionStorage
const pos = usePositionFromDom(editor!, nodeViewRef)
const isDragOver = computed(() => {
  if(!pos) return false
  if(!dndStorage) return false
  if(dndStorage.draggingState.value.type !== "dragging") return false
  if(dndStorage.overNode.value?.start === pos.value) return true
  return false
} );
  function isWithinRange(from: number, to: number, value: number){
    return from <= value && to >= value
  }
  const isSelected = computed(()=>{
    if(!props.selectable) return false
    if(!editor?.value) return false
    const { from, to } = editor.value.state.selection;
    if(!isNumber(pos.value))  return false
    return isWithinRange(from, to, pos.value) || isWithinRange(from - 1, to , pos.value)
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
    :class="{'selected': isSelected}"
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
</style>
