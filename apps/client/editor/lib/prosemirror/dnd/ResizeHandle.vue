<script setup lang="ts">
import { nodeViewProps } from '@tiptap/vue-3';
import { useIndex } from '../composables';

const props = defineProps(nodeViewProps)
const index = useIndex(props)
const prevIndex = computed(() => index.value - 1)
const currentPos = computed(() => props.getPos() + 1)
const nodeToTheLeft = computed(() =>{
  const node = props.editor.$pos(currentPos.value).parent?.children[prevIndex.value]
  return node ? node.pos : -1
})
const mouseStartingPos = ref(0)
const isResizing = ref(false)
const startResizing = (event: MouseEvent) => {
  isResizing.value = true
  mouseStartingPos.value = event.clientX
}
const stopResizing = () => {
  isResizing.value = false
}
const resize = (event: MouseEvent) => {
  if (!isResizing.value) return
  const dx = event.clientX - mouseStartingPos.value
  const prevNode = props.editor.$pos(nodeToTheLeft.value).node
  const currentNode = props.editor.$pos(currentPos.value).node
  if (!prevNode || !currentNode) return
  const prevWidth = prevNode.attrs.widthPercentage as number
  const currentWidth = currentNode.attrs.widthPercentage as number
  const newPrevWidth = prevWidth + (dx / props.editor.view.dom.clientWidth) * 100
  const newCurrentWidth = currentWidth - (dx / props.editor.view.dom.clientWidth) * 100
  if (newPrevWidth < 10 || newCurrentWidth < 10) return
  const tr = props.editor.view.state.tr
  tr.setNodeMarkup(nodeToTheLeft.value - 1, undefined, { widthPercentage: +newPrevWidth.toFixed(2) })
  tr.setNodeMarkup(currentPos.value -  1, undefined, {  widthPercentage: +newCurrentWidth.toFixed(2) })
  props.editor.view.dispatch(tr)
}
useEventListener('mousemove', resize)
useEventListener('mouseup', stopResizing)
</script>

<template>
  <div  class="resize-handle" @mousedown="startResizing"  />
</template>

<style scoped>
  .resize-handle {
  position: absolute;
  top: 0;
  display: block;
  width: 40px;
  height: 100%;
  left: -40px;
}
.resize-handle:hover{
  cursor: col-resize;
}
.resize-handle:hover:after{
        content: "";
        display: block;
        width: 4px;
        position: absolute;
        top: 0px;
        bottom: 0px;
        left: 20px;
        background: rgba(55, 53, 47, 0.09);
}
</style>
