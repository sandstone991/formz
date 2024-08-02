import type { NodeViewProps } from '@tiptap/vue-3';
import { nodePropsDependecyKey } from '../provide';

export function useProvideNodeProps(props: NodeViewProps) {
  provide(nodePropsDependecyKey, props);
}
