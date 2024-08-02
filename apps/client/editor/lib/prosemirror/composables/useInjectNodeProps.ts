import { nodePropsDependecyKey } from '../provide';

export function useInjectNodeProps() {
  return inject(nodePropsDependecyKey)!;
}
