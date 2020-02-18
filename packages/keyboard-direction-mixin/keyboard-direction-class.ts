import { LitElement } from 'lit-element';

export abstract class KeyboardDirectionClass extends LitElement {
  protected _focus?(item: HTMLElement): void;

  protected _isNextKey?(key: string): boolean;

  protected _isPrevKey?(key: string): boolean;
}
