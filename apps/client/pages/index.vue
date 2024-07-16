<script setup lang="ts">
import BaseEditor from '../editor/lib/prosemirror/BaseEditor.vue';
</script>

<template>
  <div class="w-full h-full">
    <Suspense>
      <ClientOnly>
        <BaseEditor />
      </ClientOnly>
    </Suspense>
    <InputEntry />
  </div>
</template>
