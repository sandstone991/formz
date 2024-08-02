import type { NodeViewProps, useEditor } from '@tiptap/vue-3';
import type { InjectionKey } from 'vue';

// eslint-disable-next-line
const editorDependecyKey = Symbol() as InjectionKey<ReturnType<typeof useEditor>>;
// eslint-disable-next-line
const isProductionDependecyKey = Symbol() as InjectionKey<Ref<boolean>>;
// eslint-disable-next-line
const nodePropsDependecyKey = Symbol() as InjectionKey<NodeViewProps>;
export { editorDependecyKey, isProductionDependecyKey, nodePropsDependecyKey };
