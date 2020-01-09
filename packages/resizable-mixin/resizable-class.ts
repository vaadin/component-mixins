import { LitElement } from 'lit-element';

export abstract class ResizableClass extends LitElement {
  protected _sizeChanged?(rect: DOMRect): void;

  protected static _resizeObserver?: ResizeObserver;
}
