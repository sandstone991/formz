<script setup lang="ts">

import DragHandle from '../extensions/dnd/DragHandle.vue';
import DropIndicator from '../extensions/dnd/DropIndicator.vue';
import { editorDependecyKey, isProductionDependecyKey } from '../provide';
import type { DndExtensionStorage } from '../extensions/dnd';
import { invoke } from '@vueuse/core';
import { Primitive, type AsTag } from 'radix-vue';

const props = withDefaults(defineProps<{
    as?: string | globalThis.Component | AsTag ,
    dragEnabled?: boolean,
}>(), {
    as: 'div',
    dragEnabled: true,
});
const nodeViewRef = ref<HTMLElement | null>(null);
const isHovered = ref(false);
const editor = inject(editorDependecyKey);
const isProduction = inject(isProductionDependecyKey);
const dndStorage = editor?.value?.storage.dnd as DndExtensionStorage
const callback = ()=>{
  if(!editor?.value) return null
  if(!nodeViewRef.value) return null
 return editor.value.view.posAtDOM(nodeViewRef.value, 0) - 1
}
const pos = ref<null | number>(null)
invoke(async()=>{
 await until(()=>editor?.value).not.toBe(undefined)
 await until(()=>nodeViewRef.value).not.toBe(undefined)
  pos.value = callback()
})
const fn = ref(()=>{pos.value = callback()})
onMounted(()=>{
  editor?.value?.on("update", fn.value)
})
onUnmounted(()=>{
  editor?.value?.off("update", fn.value)
})
const isDragOver = computed(() => {
  if(!pos) return false
  if(!dndStorage) return false
  if(dndStorage.draggingState.value.type !== "dragging") return false
  if(dndStorage.overNode.value?.start === pos.value) return true
  return false
} );

</script>

<template>
  <Primitive 
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
    data-node-view-wrapper=""
     class="relative" >
    <DragHandle v-if="dragEnabled && !isProduction" :is-hovered="isHovered" />
    <DropIndicator v-if="dndStorage.closestEdge.value &&isDragOver && !isProduction" :edge="dndStorage?.closestEdge.value!"  
    :gap="['left', 'right'].findIndex((e)=>e === dndStorage.closestEdge.value) !== -1? 10 : .8"  />
    <slot />
  </Primitive>
</template>

<style scoped>

</style>
