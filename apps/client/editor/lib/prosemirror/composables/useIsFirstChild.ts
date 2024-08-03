import type { EditorEvents, NodeViewProps } from '@tiptap/vue-3';

export function useIsFirstChild(props: NodeViewProps) {
  const isFirstChild = ref(getIsFirstChild());
  function getIsFirstChild() {
    // somewhy getPos is off by 1 I literally have no idea why
    const parent = props.editor.$pos(props.getPos() + 1).parent;
    if (!parent)
      return false;
    return parent.firstChild?.pos === props.getPos() + 1;
  }
  onUpdated(() => {
    isFirstChild.value = getIsFirstChild();
  });
  const fn = ref<(args: EditorEvents['transaction']) => void>(
    (args: EditorEvents['transaction']) => {
      if (args.transaction.docChanged) {
        isFirstChild.value = getIsFirstChild();
      }
    },
  );
  onMounted(() => {
    props.editor.on('transaction', fn.value);
  });
  onUnmounted(() => {
    props.editor.off('transaction', fn.value);
  });
  return isFirstChild;
}
