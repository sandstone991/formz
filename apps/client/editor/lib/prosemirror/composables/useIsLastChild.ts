import type { EditorEvents, NodeViewProps } from '@tiptap/vue-3';

export function useIsLastChild(props: NodeViewProps) {
  const isLastChild = ref(getIsLastChild());
  function getIsLastChild() {
    // somewhy getPos is off by 1 I literally have no idea why
    const parent = props.editor.$pos(props.getPos() + 1).parent;
    if (!parent)
      return false;
    return parent.lastChild?.pos === props.getPos() + 1;
  }
  onUpdated(() => {
    isLastChild.value = getIsLastChild();
  });
  const fn = ref<(args: EditorEvents['update']) => void>(
    (args: EditorEvents['update']) => {
      if (args.transaction.docChanged) {
        isLastChild.value = getIsLastChild();
      }
    },
  );
  onMounted(() => {
    props.editor.on('update', fn.value);
  });
  onUnmounted(() => {
    props.editor.off('update', fn.value);
  });
  return isLastChild;
}
