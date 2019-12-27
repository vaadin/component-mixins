import { PropertyValues } from 'lit-element';
import { KeyboardDirectionInterface } from '@vaadin/keyboard-direction-mixin';
import { KeyboardDirectionClass } from '@vaadin/keyboard-direction-mixin/keyboard-direction-class';
import { OrientationInterface } from '@vaadin/orientation-mixin';
import { SlottedItemsInterface } from '@vaadin/slotted-items-mixin';
import { SlottedItemsClass } from '@vaadin/slotted-items-mixin/slotted-items-class';
import { SingleSelectionInterface } from '@vaadin/single-selection-mixin';
import { SingleSelectionClass } from '@vaadin/single-selection-mixin/single-selection-class';
import { SelectionInViewClass } from './selection-in-view-class';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export const SelectionInViewMixin = <
  T extends Constructor<
    SelectionInViewClass &
      SingleSelectionInterface &
      SingleSelectionClass &
      OrientationInterface &
      KeyboardDirectionInterface &
      KeyboardDirectionClass &
      SlottedItemsInterface &
      SlottedItemsClass
  >
>(
  base: T
): T & Constructor<SelectionInViewClass> => {
  class SelectionInView extends base {
    /* istanbul ignore next */
    protected get _scrollTarget() {
      return this;
    }

    protected get _vertical() {
      return this.orientation === 'vertical';
    }

    protected updated(props: PropertyValues) {
      super.updated(props);

      if (props.has('selected') && this.selected != null) {
        const item = this.items[this.selected];
        if (item && !item.hasAttribute('disabled')) {
          this._scrollToItem(item);
        }
      }
    }

    protected _focus(item: HTMLElement) {
      super._focus && super._focus(item); // eslint-disable-line no-unused-expressions
      this._scrollToItem(item);
    }

    protected _scroll(distance: number) {
      const prop = this._vertical ? 'scrollTop' : 'scrollLeft';
      this._scrollTarget[prop] += distance;
    }

    protected _scrollToItem(item: HTMLElement) {
      // Determine the bounds of the scroll target and item.
      const scrollTargetRect = this._scrollTarget.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      // Determine how far the item is outside the viewport.
      const bottomDelta = itemRect.bottom - scrollTargetRect.bottom;
      const leftDelta = itemRect.left - scrollTargetRect.left;
      const rightDelta = itemRect.right - scrollTargetRect.right;
      const topDelta = itemRect.top - scrollTargetRect.top;

      let distance = 0;

      if (this._vertical) {
        if (bottomDelta > 0) {
          // Scroll down
          distance = bottomDelta;
        } else if (topDelta < 0) {
          // Scroll up
          distance = Math.ceil(topDelta);
        }
      } else if (rightDelta > 0) {
        // Scroll right
        distance = rightDelta;
      } else if (leftDelta < 0) {
        // Scroll left
        distance = Math.ceil(leftDelta);
      }

      this._scroll(distance);
    }
  }

  return SelectionInView;
};
