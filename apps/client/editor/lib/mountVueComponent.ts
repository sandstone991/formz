import { createVNode, render } from 'vue';

type CreateVNodeParameters = Parameters<typeof createVNode>;

export function mountComponent(elem: HTMLElement, component: CreateVNodeParameters[0], props: CreateVNodeParameters[1]) {
  const app = useNuxtApp().vueApp;
  const vNode = createVNode(component, props);
  vNode.appContext = app._context;
  render(vNode, elem);
  return vNode.component;
}
