declare module '@vaadin/vaadin-element-mixin/vaadin-dir-helper.js' {
  export interface DirHelper {
    detectScrollType: () => string;

    getNormalizedScrollLeft: (
      scrollType: string,
      direction: string,
      element: HTMLElement
    ) => number;

    setNormalizedScrollLeft: (
      scrollType: string,
      direction: string,
      element: HTMLElement,
      scrollLeft: number
    ) => void;
  }

  export const DirHelper: DirHelper;
}
