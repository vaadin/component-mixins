import { Constructor } from '@vaadin/mixin-utils';
import {
  KeyboardDirectionInterface,
  getAvailableIndex,
  isFocusable
} from '@vaadin/keyboard-direction-mixin';
import { KeyboardDirectionClass } from '@vaadin/keyboard-direction-mixin/keyboard-direction-class';
import { SlottedItemsInterface } from '@vaadin/slotted-items-mixin';
import { SlottedItemsClass } from '@vaadin/slotted-items-mixin/slotted-items-class';
import { RovingTabIndexClass } from './roving-tabindex-class';

export const RovingTabIndexMixin = <
  T extends Constructor<
    KeyboardDirectionClass &
      KeyboardDirectionInterface &
      SlottedItemsClass &
      SlottedItemsInterface &
      RovingTabIndexClass
  >
>(
  base: T
): T & Constructor<RovingTabIndexClass> => {
  class RovingTabIndex extends base {
    focus() {
      const first =
        (this.querySelector('[tabindex="0"]') as HTMLElement) ||
        (this.items.length ? this.items[0] : null);
      if (first) {
        first.focus();
      }
    }

    protected _itemsChanged(items: HTMLElement[], oldItems: HTMLElement[]) {
      super._itemsChanged && super._itemsChanged(items, oldItems);

      if (items) {
        const { focused } = this;
        this._setFocusable(
          focused && this.contains(focused) ? items.indexOf(focused as HTMLElement) : 0
        );
      }
    }

    protected _setFocusable(idx: number) {
      const index = getAvailableIndex(this.items, idx, 1, isFocusable);
      this._setTabIndex(this.items[index]);
    }

    protected _setTabIndex(item: HTMLElement) {
      this.items.forEach((el: HTMLElement) => {
        // eslint-disable-next-line no-param-reassign
        el.tabIndex = el === item ? 0 : -1;
      });
    }

    protected _focus(item: HTMLElement) {
      super._focus && super._focus(item);
      this._setTabIndex(item);
    }
  }

  return RovingTabIndex;
};
