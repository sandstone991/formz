<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { Dnd } from '../extensions/dnd';
import { QuickMenuExtension } from './quickMenu';
import { formzProsemirrorNodes } from './nodes';
import { editorDependecyKey } from './provide';

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
  ],
});
provide(editorDependecyKey, editor);
</script>

<template>
  <div class="w-full h-full">
    <EditorContent :editor="editor" />
  </div>
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
