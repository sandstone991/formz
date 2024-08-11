<script setup lang="ts">
import { useInjectFormControlContext } from '../formControlContext';
import { Checkbox } from '~/components/ui/checkbox';

const formControlContext = useInjectFormControlContext<boolean>();
const checked = computed(() => formControlContext.value());
</script>

<template>
  <Checkbox
    :checked="checked"
    :name="formControlContext.path"
    @update:checked="formControlContext.onChange"
  />
</template>

<style scoped>

</style>
