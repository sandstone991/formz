export interface QuickMenuBlock {
  nodeType: string
  title: string
  icon: string
  placeholder: string
  initialAttrs?: Record<string, unknown>
  options?: Record<string, unknown>
}
