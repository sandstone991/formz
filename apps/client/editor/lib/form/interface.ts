import type { Editor } from '@tiptap/vue-3';
import type { formControlRegistery } from './formControlRegistery';

export interface FormFieldConfig {
  type: keyof typeof formControlRegistery
  label?: string
  hidden?: ({ form, field, editor }: {
    form: Record<string, unknown>
    field: string
    editor: Editor
  }) => boolean
  disabled?: ({ form, field, editor }: {
    form: Record<string, unknown>
    field: string
    editor: Editor
  }) => boolean
  options?: Record<string, any>
  path: string
}

export type FormConfig = Array<FormFieldConfig>;
