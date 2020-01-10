declare module '@vaadin/vaadin-element-mixin/vaadin-element-mixin.js' {
  import { DirMixinConstructor } from '@vaadin/vaadin-element-mixin/vaadin-dir-mixin.js';

  export interface ElementMixinConstructor {
    new (...args: any[]): ElementMixin;
    finalize(): void;
  }

  export function ElementMixin<T extends new (...args: any[]) => {}>(
    base: T
  ): T & ElementMixinConstructor & DirMixinConstructor;

  interface ElementMixin {}
}
