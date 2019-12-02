import { LitElement } from 'lit-element';

export abstract class RovingTabIndexClass extends LitElement {
  protected _setFocusable?(idx: number): void;

  protected _setTabIndex?(item: HTMLElement): void;
}
