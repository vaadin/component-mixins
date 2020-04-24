import { Constructor } from '@vaadin/mixin-utils';
import { SlottedItemsInterface } from '@vaadin/slotted-items-mixin';
import { DirectionMixin } from '@vaadin/direction-mixin/direction-mixin.js';
import { DirectionClass } from '@vaadin/direction-mixin/direction-class.js';
import { KeyboardMixin } from '@vaadin/keyboard-mixin/keyboard-mixin.js';
import { KeyboardClass } from '@vaadin/keyboard-mixin/keyboard-class.js';
import { KeyboardDirectionClass } from './keyboard-direction-class';

export interface KeyboardDirectionInterface {
  focused: Element | null;
}

export type ItemCondition = (item: Element) => boolean;

export const isFocusable: ItemCondition = (item: Element) =>
  !item.hasAttribute('disabled') && !item.hasAttribute('hidden');

/**
 * Returns index of the next item that satisfies the given condition,
 * based on the index of the current item and a numeric increment.
 *
 * @param {Element[]} items - array of items to iterate over
 * @param {number} index - index of the current item
 * @param {number} increment - numeric increment, can be either 1 or -1
 * @param {ItemCondition} condition - function that accepts item as a parameter
 */
export const getAvailableIndex = (
  items: Element[],
  index: number,
  increment: number,
  condition: ItemCondition
): number => {
  const totalItems = items.length;
  let idx = index;
  for (let i = 0; typeof idx === 'number' && i < totalItems; i += 1, idx += increment || 1) {
    if (idx < 0) {
      idx = totalItems - 1;
    } else if (idx >= totalItems) {
      idx = 0;
    }

    const item = items[idx];
    if (condition(item)) {
      return idx;
    }
  }
  return -1;
};

export const KeyboardDirectionMixin = <
  T extends Constructor<
    SlottedItemsInterface & KeyboardDirectionClass & KeyboardClass & DirectionClass
  >
>(
  base: T
): Constructor<KeyboardDirectionInterface> & T => {
  const Base = KeyboardMixin(DirectionMixin(base));

  class KeyboardDirection extends Base {
    focus() {
      const first = this.items.length ? this.items[0] : null;

      if (first) {
        first.focus();
      }
    }

    get focused() {
      const root = (this.getRootNode() as unknown) as DocumentOrShadowRoot;
      return root ? (root.activeElement as HTMLElement) : null;
    }

    protected _onKeyDown(event: KeyboardEvent) {
      super._onKeyDown && super._onKeyDown(event);
      if (event.metaKey || event.ctrlKey) {
        return;
      }

      const { key } = event;
      const { items, focused } = this;
      const currentIdx = items.findIndex((item) => focused === item);

      let idx;
      let increment;

      const isRTL = !this._vertical && this.getAttribute('dir') === 'rtl';
      const dirIncrement = isRTL ? -1 : 1;

      if (this._isPrevKey(key)) {
        increment = -dirIncrement;
        idx = currentIdx - dirIncrement;
      } else if (this._isNextKey(key)) {
        increment = dirIncrement;
        idx = currentIdx + dirIncrement;
      } else if ((key === 'Home' && !isRTL) || (key === 'End' && isRTL)) {
        increment = 1;
        idx = 0;
      } else if ((key === 'End' && !isRTL) || (key === 'Home' && isRTL)) {
        increment = -1;
        idx = items.length - 1;
      }

      idx = getAvailableIndex(items, idx as number, increment as number, isFocusable);
      if (idx >= 0) {
        event.preventDefault();
        const item = items[idx] as HTMLElement;
        if (item) {
          this._focus(item);
        }
      }
    }

    protected _isPrevKey(key: string) {
      return this._vertical ? key === 'ArrowUp' : key === 'ArrowLeft';
    }

    protected _isNextKey(key: string) {
      return this._vertical ? key === 'ArrowDown' : key === 'ArrowRight';
    }

    protected _focus(item: HTMLElement) {
      item.focus();
    }
  }

  return KeyboardDirection;
};
