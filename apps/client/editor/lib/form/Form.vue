<script setup lang="ts">
import FormControlWrapper from './FormControlWrapper.vue';
import type { FormConfig } from './interface';

defineProps<{ config: FormConfig }>();
</script>

<template>
  <div class="space-y-2">
  <div v-for="item in config" :key="item.path">
    <FormControlWrapper :config="item" />
  </div>
  </div>
</template>

<style scoped>

</style>
