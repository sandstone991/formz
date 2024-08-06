import type { Editor, useEditor } from '@tiptap/vue-3';
import { invoke } from '@vueuse/core';

export function usePositionFromDom(editor: ReturnType<typeof useEditor>, nodeViewRef: Ref<HTMLElement | null>) {
  const callback = () => {
    if (!editor?.value)
      return null;
    if (!nodeViewRef.value)
      return null;
    return editor.value.view.posAtDOM(nodeViewRef.value, 0) - 1;
  };
  const pos = ref<null | number>(null);
  invoke(async () => {
    await until(() => editor?.value).not.toBe(undefined);
    await until(() => nodeViewRef.value).not.toBe(undefined);
    pos.value = callback();
  });
  const fn = ref(() => { pos.value = callback(); });
  onMounted(() => {
    editor?.value?.on('update', fn.value);
  });
  onUnmounted(() => {
    editor?.value?.off('update', fn.value);
  });
  return pos;
}
