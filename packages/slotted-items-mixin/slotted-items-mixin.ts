import { property, PropertyValues } from 'lit-element';
import { Constructor } from '@vaadin/mixin-utils';
import { SlottedItemsClass } from './slotted-items-class';

export interface SlottedItemsInterface {
  items: HTMLElement[];
}

export const SlottedItemsMixin = <T extends Constructor<SlottedItemsClass>>(
  base: T
): Constructor<SlottedItemsClass & SlottedItemsInterface> & T => {
  class SlottedItems extends base {
    @property({ attribute: false, hasChanged: () => true })
    public get items() {
      return this._items;
    }

    public set items(value) {
      if (this._slotChange) {
        const oldValue = this._items;
        this._items = value;
        this._slotChange = false;
        this.requestUpdate('items', oldValue);
      }
    }

    private _items: HTMLElement[] = [];

    private _slotChange = false;

    connectedCallback() {
      super.connectedCallback();

      this._setItems();
    }

    protected update(props: PropertyValues) {
      if (props.has('items')) {
        this._itemsChanged(this.items, (props.get('items') || []) as HTMLElement[]);
      }

      super.update(props);
    }

    protected firstUpdated(props: PropertyValues) {
      super.firstUpdated(props);

      const slot = this.renderRoot.querySelector('slot');
      /* istanbul ignore else */
      if (slot) {
        slot.addEventListener('slotchange', () => {
          this._setItems();
        });
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected _itemsChanged(items: HTMLElement[], _oldItems: HTMLElement[]) {
      this.dispatchEvent(
        new CustomEvent('items-changed', {
          detail: {
            value: items
          }
        })
      );
    }

    protected _filterItems() {
      return Array.from(this.children) as HTMLElement[];
    }

    private _setItems() {
      this._slotChange = true;
      this.items = this._filterItems();
    }
  }

  return SlottedItems;
};

declare global {
  interface HTMLElementEventMap {
    'items-changed': CustomEvent;
  }
}
