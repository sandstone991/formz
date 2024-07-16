<script setup lang="ts">
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { baseSetup } from './setup';

const props = defineProps<{ state?: EditorState, schema?: Schema, className?: string }>();
const editorSchema = props.schema ?? new Schema({
  nodes: addListNodes(schema.spec.nodes as any, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});
const editorRef = ref<HTMLDivElement | null>(null);
const view = ref<EditorView | null>(null);
onMounted(() => {
  view.value = new EditorView(editorRef.value!, {
    state: props.state ?? EditorState.create({
      schema: editorSchema,
      plugins: baseSetup({ schema: editorSchema   }),
    }),
  });
});
onBeforeUnmount(() => {
  view.value?.destroy();
});
</script>

<template>
  <div id="content" ref="editorRef" class="w-full h-full min-h-full border text-start"/>
</template>

<style>
  .ProseMirror{
    padding: 10px;
    height: 100%;
    outline: none;
  }
</style>
