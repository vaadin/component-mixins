import { LitElement } from 'lit-element';

export abstract class ActiveStateClass extends LitElement {
  protected _setActive?(active: boolean): void;
}
