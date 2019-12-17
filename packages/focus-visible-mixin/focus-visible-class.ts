import { LitElement } from 'lit-element';

export abstract class FocusVisibleClass extends LitElement {
  protected _autoFocus?(): void;

  protected _onFocusin?(event: FocusEvent): void;

  protected _onFocusout?(event: FocusEvent): void;

  protected _setFocused?(focused: boolean): void;
}
