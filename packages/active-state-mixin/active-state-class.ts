import { LitElement } from 'lit-element';

export abstract class ActiveStateClass extends LitElement {
  protected _onMouseDown?(event: MouseEvent): void;

  protected _onTouchStart?(event: TouchEvent): void;

  protected _onTouchEnd?(event: TouchEvent): void;

  protected _setActive?(active: boolean): void;
}
