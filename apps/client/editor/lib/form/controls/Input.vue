<script setup lang="ts">
import { useInjectFormControlContext } from '../formControlContext';
import { Input } from '~/components/ui/input';

const formControlContext = useInjectFormControlContext<string | number>();
const value = computed(() => formControlContext.value());
</script>

<template>
  <Input
    :name="formControlContext.path"
    :value="value"
    @update:model-value="formControlContext.onChange($event)"
  />
</template>

<style scoped>

</style>
