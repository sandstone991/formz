import type { useEditor } from '@tiptap/vue-3';
import type { InjectionKey } from 'vue';

// eslint-disable-next-line
const editorDependecyKey = Symbol() as InjectionKey<ReturnType<typeof useEditor>>;
// eslint-disable-next-line
const isProductionDependecyKey = Symbol() as InjectionKey<Ref<boolean>>;
export { editorDependecyKey, isProductionDependecyKey };
