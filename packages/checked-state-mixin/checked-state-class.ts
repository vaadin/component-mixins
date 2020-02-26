import { LitElement } from 'lit-element';

export abstract class CheckedStateClass extends LitElement {
  protected _checkedChanged?(checked: boolean): void;
}
