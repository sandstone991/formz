<script setup lang="ts">
import { type EditorEvents, NodeViewContent, isNodeEmpty, nodeViewProps } from '@tiptap/vue-3';
import FormzNodeViewWrapper from '../FormzNodeViewWrapper.vue';
import { editorDependecyKey } from '../../provide';

const props = defineProps(nodeViewProps);
const isEmpty = ref(isNodeEmpty(props.node));
const isLastChild = ref(getIsLastChild());
function getIsLastChild() {
  const parent = props.editor.state.doc.resolve(props.getPos()).parent;
  const lastChildPos = parent.content.size;
  return lastChildPos === props.getPos() + props.node.nodeSize;
}
onUpdated(() => {
  isEmpty.value = isNodeEmpty(props.node);
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
</script>

<template>
  <FormzNodeViewWrapper>
    <NodeViewContent
      :data-placeholder="props.node.attrs.placeholder || 'Write something...'" as="p" :class="{
        placeholder: isEmpty && isLastChild,
      }"
    />
  </FormzNodeViewWrapper>
</template>

<style scoped>
.placeholder::before {
  content: attr(data-placeholder);
  color: #ccc;
  font-style: italic;
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
