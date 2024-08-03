
<script setup lang="ts">
import { useInjectNodeProps } from '../composables';


 defineProps<{isHovered:boolean}>();
 const nodeProps = useInjectNodeProps();
const insertNodeAfter = ()=>{
    nodeProps.editor.commands.insertContentAt(nodeProps.getPos() + nodeProps.node.nodeSize, {
        type: "paragraph",
    })
}
</script>
<template>
    <div  contenteditable="false" class="absolute z-10 bg-white overflow-visible inline-start-[-80px] shadow-md rounded-md p-2 -top-1 flex flex-row gap-2 justify-between items-center bg-transparent" :class="{
        'opacity-0': !isHovered,
        'opacity-100': isHovered
    }">
        <span class="icon-[ph--trash-thin]" @click="nodeProps.deleteNode"></span>
        <span class="icon-[ic--baseline-plus]" @click="insertNodeAfter"></span> 
        <span data-drag-handle="true" class="icon-[grommet-icons--drag]"></span>
        </div>

</template>

<style scoped>

</style>