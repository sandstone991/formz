import type { useEditor } from '@tiptap/vue-3';
import type { InjectionKey } from 'vue';

// eslint-disable-next-line
const editorDependecyKey = Symbol() as InjectionKey<ReturnType<typeof useEditor>>;
export { editorDependecyKey };
