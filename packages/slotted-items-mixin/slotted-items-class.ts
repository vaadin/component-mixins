import { LitElement } from 'lit-element';

export abstract class SlottedItemsClass extends LitElement {
  protected _itemsChanged?(items: HTMLElement[], oldItems: HTMLElement[]): void;

  protected _filterItems?(): HTMLElement[];
}
