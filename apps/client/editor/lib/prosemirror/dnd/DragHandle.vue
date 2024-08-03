
<script setup lang="ts">
import Button from '~/components/ui/button/Button.vue';
import { useInjectNodeProps } from '../composables';


 defineProps<{isHovered:boolean}>();
 const nodeProps = useInjectNodeProps();
const insertNodeAfter = ()=>{
    nodeProps.editor.commands.insertContentAt(nodeProps.getPos() + nodeProps.node.nodeSize, {
        type: "paragraph",
    })
}
const className = "w-2 h-2 p-2 hover:bg-gray-400"

</script>
<template>
    <div  contenteditable="false" class="absolute z-10 bg-white overflow-visible inline-start-[-80px] shadow-md rounded-md p-2 -top-1 flex flex-row gap-2 justify-between items-center bg-transparent" :class="{
        'hidden': !isHovered,
        
    }">
        <Button as="span" variant="default" :class="className" class="icon-[ph--trash-thin]"  @click="nodeProps.deleteNode"></Button>
        <Button as="span" variant="default" :class="className" class="icon-[ic--baseline-plus]" @click="insertNodeAfter"></Button> 
        <Button as="span" variant="default" :class="className" data-drag-handle="true" class="icon-[grommet-icons--drag]" ></Button>
        </div>

</template>

<style scoped>

</style>