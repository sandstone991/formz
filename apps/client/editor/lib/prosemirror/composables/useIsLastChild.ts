import { type EditorEvents, type NodeViewProps, isNodeEmpty } from '@tiptap/vue-3';

export function useIsLastChild(props: NodeViewProps) {
  const isLastChild = ref(getIsLastChild());
  function getIsLastChild() {
    const parent = props.editor.state.doc.resolve(props.getPos()).parent;
    const lastChildPos = parent.content.size;
    return lastChildPos === props.getPos() + props.node.nodeSize;
  }
  onUpdated(() => {
    isLastChild.value = getIsLastChild();
  });
  const fn = ref<(args: EditorEvents['transaction']) => void>(
    (args: EditorEvents['transaction']) => {
      if (args.transaction.docChanged) {
        isLastChild.value = getIsLastChild();
      }
    },
  );
  onMounted(() => {
    props.editor.on('transaction', fn.value);
  });
  onUnmounted(() => {
    props.editor.off('transaction', fn.value);
  });
  return isLastChild;
}
