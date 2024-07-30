
<script setup lang="ts">

 defineProps<{isHovered:boolean}>();

</script>
<template>
    <div  contenteditable="false" class="absolute left-[-80px] top-1 flex flex-row gap-2 justify-between items-center px-4 bg-transparent" :class="{
        'opacity-0': !isHovered,
        'opacity-100': isHovered
    }">
        <span class="icon-[ph--trash-thin]"></span>
        <span class="icon-[ic--baseline-plus]"></span> 
        <span data-drag-handle="true" class="icon-[grommet-icons--drag]"></span>
        </div>

</template>

<style scoped>

</style>