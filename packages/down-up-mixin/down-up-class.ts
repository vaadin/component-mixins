import { LitElement } from 'lit-element';

export abstract class DownUpClass extends LitElement {
  protected _downUpTarget?: HTMLElement | null;

  protected _onMouseDown?(event: MouseEvent): void;

  protected _onMouseUp?(event: MouseEvent): void;

  protected _onTouchStart?(event: TouchEvent): void;

  protected _onTouchEnd?(event: TouchEvent): void;

  protected _onDown?(): void;

  protected _onUp?(): void;
}
