<script setup lang="ts">
import { useInjectFormControlContext } from '../formControlContext';
import { Switch } from '~/components/ui/switch';

const formControlContext = useInjectFormControlContext<boolean>();
const checked = computed(() => formControlContext.value());
</script>

<template>
  <Switch
    :checked="checked"
    :name="formControlContext.path"
    @update:checked="formControlContext.onChange"
  />
</template>

<style scoped>

</style>
