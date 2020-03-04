import { LitElement } from 'lit-element';

export abstract class CheckedStateClass extends LitElement {
  protected _setAriaChecked?(checked: boolean): void;
}
