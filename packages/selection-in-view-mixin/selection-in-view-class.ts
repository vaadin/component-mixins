import { LitElement } from 'lit-element';

export abstract class SelectionInViewClass extends LitElement {
  protected _normalizedScrollLeft?: number;

  protected _scrollToItem?(item: HTMLElement): void;

  protected _scroll?(distance: number): void;
}
