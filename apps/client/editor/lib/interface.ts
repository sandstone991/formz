import type { FormConfig } from './form/interface';

export interface FormBlockConfig {
  nodeType: string
  title: string
  icon: string
  placeholder: string
  initialAttrs?: Record<string, unknown>
  form?: FormConfig
}
