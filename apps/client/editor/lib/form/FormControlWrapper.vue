<script setup lang="ts">
import { cloneDeep, set } from 'lodash-es';
import type { Editor } from '@tiptap/vue-3';
import { useInjectNodeProps } from '../prosemirror/composables';
import { useProvideFormControlConext } from './formControlContext';
import type { FormFieldConfig } from './interface';
import { formControlRegistery } from './formControlRegistery';

const props = defineProps<{
  config: FormFieldConfig
}>();
const nodeProps = useInjectNodeProps();
const isDisabled = computed(() => {
  return props.config.disabled
    ? props.config.disabled({
      form: nodeProps.node.attrs,
      editor: nodeProps.editor as Editor,
      field: props.config.path,
    })
    : false;
});
const isHidden = computed(() => {
  return props.config.hidden
    ? props.config.hidden({
      form: nodeProps.node.attrs,
      editor: nodeProps.editor as Editor,
      field: props.config.path,
    })
    : false;
});
useProvideFormControlConext({
  editor: nodeProps.editor as Editor,
  value: () => nodeProps.node.attrs[props.config.path],
  onChange: (value: any) => {
    const attrs = cloneDeep(nodeProps.node.attrs);
    set(attrs, props.config.path, value);
    nodeProps.updateAttributes(attrs);
  },
  path: props.config.path,
  isDisabled: isDisabled.value,
});
const FormControl = formControlRegistery[props.config.type as keyof typeof formControlRegistery];
</script>

<template>
  <div v-if="!isHidden" class="flex items-center justify-between">
    <Label v-if="!!props.config.label" :for="props.config.path" :label="props.config.label">
      {{ props.config.label }}
    </Label>
    <component :is="FormControl" />
  </div>
</template>

<style scoped>

</style>
