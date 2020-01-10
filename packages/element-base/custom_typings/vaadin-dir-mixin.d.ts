declare module '@vaadin/vaadin-element-mixin/vaadin-dir-mixin.js' {
  export interface DirMixinConstructor {
    new (...args: any[]): DirMixin;
  }

  export function DirMixin<T extends new (...args: any[]) => {}>(base: T): T & DirMixinConstructor;

  interface DirMixin {
    dir: string | null | undefined;
  }
}
