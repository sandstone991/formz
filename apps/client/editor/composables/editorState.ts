import { acceptHMRUpdate, defineStore } from 'pinia';
import type { FormzLayout } from '../lib/interface';

export const useEditorStore = defineStore('editor', () => {
  const layout = ref<FormzLayout>([]);
  return ({ layout });
});

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useEditorStore, import.meta.hot));
