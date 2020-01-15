import { PropertyValues } from 'lit-element';
import { SlottedItemsInterface } from '@vaadin/slotted-items-mixin';
import { DirectionMixin } from '@vaadin/direction-mixin/direction-mixin.js';
import { DirectionClass } from '@vaadin/direction-mixin/direction-class.js';
import { KeyboardDirectionClass } from './keyboard-direction-class';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

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
  T extends Constructor<SlottedItemsInterface & KeyboardDirectionClass & DirectionClass>
>(
  base: T
): Constructor<DirectionClass & KeyboardDirectionClass & KeyboardDirectionInterface> & T => {
  const Base = DirectionMixin(base);

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

    protected firstUpdated(props: PropertyValues) {
      super.firstUpdated(props);

      this.addEventListener('keydown', (event: KeyboardEvent) => {
        this._onKeyDown(event);
      });
    }

    protected _onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey) {
        return;
      }

      const { key } = event;
      const { items, focused } = this;
      const currentIdx = items.findIndex(item => focused === item);

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
