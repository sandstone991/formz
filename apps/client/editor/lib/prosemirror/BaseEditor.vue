<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { QuickMenuExtension } from './quickMenu';
import { formzProsemirrorNodes } from './nodes';

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

    }),
    ...formzProsemirrorNodes,
  ],
});
</script>

<template>
  <EditorContent :editor="editor" />
</template>

<style>
  .ProseMirror {
  padding: 10px;
  height: 100%;
  outline: none;
  text-align: start;
}
:has(.ProseMirror) {
  height: 100%;
}
</style>
