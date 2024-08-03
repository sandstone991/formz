<script setup lang="ts">

</script>

<template>
  <div  class="resize-handle"/>
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
