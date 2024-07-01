import type { NavigationGuard } from 'vue-router'
export type MiddlewareKey = string
declare module "../../../../node_modules/.pnpm/nuxt@3.12.2_@opentelemetry+api@1.9.0_@types+node@18.16.20_eslint@8.57.0_less@4.1.3_stylus@0.5_sniq3kjpd53nvybgaljvsdkbiu/node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    middleware?: MiddlewareKey | NavigationGuard | Array<MiddlewareKey | NavigationGuard>
  }
}
declare module 'nitropack' {
  interface NitroRouteConfig {
    appMiddleware?: MiddlewareKey | MiddlewareKey[] | Record<MiddlewareKey, boolean>
  }
}