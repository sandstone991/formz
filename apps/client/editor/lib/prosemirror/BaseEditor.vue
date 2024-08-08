<script setup lang="ts">
import StarterKit from '@tiptap/starter-kit';
import { QuickMenuExtension } from './quickMenu';
import { formzProsemirrorNodes } from './nodes';
import { editorDependecyKey, isProductionDependecyKey } from './provide';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { AutoLabel } from './extensions/autoLabel';
import { Dnd } from './extensions/dnd';
import { UniqueID } from './extensions/uniqueId';
import { HiddenBlocks } from './extensions/hidden';
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
    UniqueID.configure({
      types: ["input"]
    }),
    QuickMenuExtension,
    StarterKit.configure({
      heading: false,
      paragraph: false,
      dropcursor: false,
    }),
    ...formzProsemirrorNodes,
    Dnd,
    AutoLabel,
    HiddenBlocks
  ],
});
provide(editorDependecyKey, editor);
const isProduction = ref(false);
provide(isProductionDependecyKey, isProduction);
</script>

<template>
  <div class="w-full h-full flex flex-col lg:max-w-[900px] md:max-w-[700px] max-w-[min(700px, 100vw)] items-center justify-center mx-auto">

    <EditorContent :editor="editor" class="w-full m-auto" />
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
  --selected-background: #b3d4fc;
  padding: 40px;
  height: 100%;
  width: 100%;
  outline: none;
  text-align: start;
  margin: 0 auto;
}
@media screen and (min-width: 576px) {
  .ProseMirror {
    padding-left: 120px;
    padding-right: 120px;
  }
  
}
:has(.ProseMirror) {
  height: 100%;
}
.ProseMirror * ::selection {
  background-color: var(--selected-background);
}
</style>
