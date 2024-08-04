<script setup lang="ts">
import StarterKit from '@tiptap/starter-kit';
import { QuickMenuExtension } from './quickMenu';
import { formzProsemirrorNodes } from './nodes';
import { editorDependecyKey, isProductionDependecyKey } from './provide';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { AutoLabel } from './extensions/autoLabel';
import { Dnd } from './extensions/dnd';
import { UniqueId } from './extensions/uniqueId';

const editor = useEditor({
  content: `
    <h2>
      Welcome to the Base Editor
    </h2>
    <p>
      This is a simple editor with a custom menu.
    </p>
  `,
  extensions: [
    QuickMenuExtension,
    StarterKit.configure({
      heading: false,
      paragraph: false,
      dropcursor: false,

    }),
    ...formzProsemirrorNodes,
    Dnd,
    UniqueId,
    AutoLabel
  ],
});
provide(editorDependecyKey, editor);
const isProduction = ref(false);
provide(isProductionDependecyKey, isProduction);
</script>

<template>
  <div class="w-full h-full">
    <button @click="editor?.setEditable(false);
      isProduction = true">preview</button>
    <button @click="editor?.setEditable(true);
      isProduction = false
    ">edit</button>
    <EditorContent :editor="editor" />
  </div>  
  <pre class="text-start">{{ 
  editor?.getJSON()
  }}</pre>

  <pre class="text-start">
    {{ editor?.storage }}
  </pre>

</template>

<style>
  .ProseMirror {
  padding: 10px;
  height: 100%;
  outline: none;
  text-align: start;
  padding: 40px;
}
:has(.ProseMirror) {
  height: 100%;
}
</style>
