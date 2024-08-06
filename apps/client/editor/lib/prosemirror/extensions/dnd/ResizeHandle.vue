<script setup lang="ts">
import { nodeViewProps } from '@tiptap/vue-3';
import { clamp } from 'lodash-es';
import { useIndex } from '../../composables';
import { findWrapperNode } from './utils';

const props = defineProps(nodeViewProps)
const index = useIndex(props)
const prevIndex = computed(() => index.value - 1)
const currentPos = computed(() => props.getPos() + 1)
const leftSiblingNodePos = computed(() =>{
  const node = props.editor.$pos(currentPos.value).parent?.children[prevIndex.value]
  return node ? node.pos : -1
})
const mouseStartingPos = ref(0)
const isResizing = ref(false)
const startResizing = (event: MouseEvent) => {
  props.editor.setEditable(false)
  props.editor.view.dom.classList.add('select-none')
  isResizing.value = true
  mouseStartingPos.value = event.clientX
}
const stopResizing = () => {
  props.editor.setEditable(true)
  props.editor.view.dom.classList.remove('select-none')
  isResizing.value = false
}
function findColumnBlock(node: HTMLElement) {
  if(node.hasAttribute('data-column-block')) return node
  return findColumnBlock(node.parentElement!)
}
function innerWidth(element: HTMLElement){
  const computedStyles = window.getComputedStyle(element)
  let elementWidth = element.clientWidth;   // width with padding
  elementWidth -= parseFloat(computedStyles.paddingLeft) + parseFloat(computedStyles.paddingRight);
  return elementWidth;
}
const resize =useThrottleFn((event: MouseEvent) => {
  if (!isResizing.value) return
  const leftSiblingNode = props.editor.$pos(leftSiblingNodePos.value)
  const currentNode = props.editor.$pos(currentPos.value)
  const element = findWrapperNode(currentNode.element);
  const leftSiblingElement = findWrapperNode(leftSiblingNode.element);
  if(!element || !leftSiblingElement) return
  const parent = findColumnBlock(element)
  if(!parent) return
  const width = element.offsetWidth
  const availableWidth = width + leftSiblingElement.offsetWidth
  const dx = event.clientX - mouseStartingPos.value
  const newWidth  = clamp(width - dx, 30, availableWidth - 30)
  const newLeftSiblingWidth = availableWidth - newWidth
  const parentWidth = innerWidth(parent)

  const newLeftSiblingNodeWidthPercentage = (newLeftSiblingWidth / parentWidth) * 100
  const newCurrentWidthPercentage = (newWidth / parentWidth) * 100
  mouseStartingPos.value = event.clientX
  const tr = props.editor.view.state.tr
  tr.setNodeMarkup(leftSiblingNodePos.value - 1, undefined, { widthPercentage: +newLeftSiblingNodeWidthPercentage.toFixed(2) })
  tr.setNodeMarkup(currentPos.value -  1, undefined, {  widthPercentage: +newCurrentWidthPercentage.toFixed(2) })
  props.editor.view.dispatch(tr)
}, 50)

useEventListener('mousemove',(e)=>resize(e))
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
  inset-inline-start: -40px;
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
        inset-inline-start: 20px;
        background: rgba(55, 53, 47, 0.09);
}
</style>
