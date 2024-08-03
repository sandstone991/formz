import type { EditorEvents, NodeViewProps } from '@tiptap/vue-3';

export function useIndex(props: NodeViewProps) {
  const index = ref(getIndex());
  function getIndex() {
    // somewhy getPos is off by 1 I literally have no idea why
    const parent = props.editor.$pos(props.getPos() + 1).parent;
    if (!parent)
      return -1;
    return parent.children.findIndex(child => child.pos === props.getPos() + 1);
  }
  onUpdated(() => {
    index.value = getIndex();
  });
  const fn = ref<(args: EditorEvents['update']) => void>(
    (args: EditorEvents['update']) => {
      if (args.transaction.docChanged) {
        index.value = getIndex();
      }
    },
  );
  onMounted(() => {
    props.editor.on('update', fn.value);
  });
  onUnmounted(() => {
    props.editor.off('update', fn.value);
  });
  return index;
}
