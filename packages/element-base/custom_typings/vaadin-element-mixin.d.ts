declare module '@vaadin/vaadin-element-mixin/vaadin-element-mixin.js' {
  export interface ElementMixinConstructor {
    new (...args: any[]): ElementMixin;
    finalize(): void;
  }

  export function ElementMixin<T extends new (...args: any[]) => {}>(
    base: T
  ): T & ElementMixinConstructor;

  interface ElementMixin {}
}
