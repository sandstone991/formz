import type { Editor } from '@tiptap/vue-3';

export interface FormControlContextProps<T = unknown> {
  value: () => T
  onChange: (value: T) => void
  editor: Editor
  path: string
  isDisabled: boolean
}
export function useProvideFormControlConext(props: FormControlContextProps) {
  provide('formControlContext', props);
}

export function useInjectFormControlContext<T>() {
  return inject<FormControlContextProps<T>>('formControlContext')!;
}
