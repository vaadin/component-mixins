import { LitElement } from 'lit-element';

export abstract class SingleSelectionClass extends LitElement {
  protected _onClick?(event: MouseEvent): void;

  protected _onKeyUp?(event: KeyboardEvent): void;
}
