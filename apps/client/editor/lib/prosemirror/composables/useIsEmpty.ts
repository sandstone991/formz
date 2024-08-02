import { type NodeViewProps, isNodeEmpty } from '@tiptap/vue-3';

export function useIsEmpty(props: NodeViewProps) {
  const isEmpty = ref(isNodeEmpty(props.node));
  onUpdated(() => {
    isEmpty.value = isNodeEmpty(props.node);
  });
  return isEmpty;
}
