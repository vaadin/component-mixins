import { LitElement } from 'lit-element';

export abstract class KeyboardClass extends LitElement {
  protected _onKeyDown?(_event: KeyboardEvent): void;

  protected _onKeyUp?(_event: KeyboardEvent): void;
}
