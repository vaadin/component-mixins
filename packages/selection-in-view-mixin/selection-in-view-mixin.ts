import { PropertyValues } from 'lit-element';
import { Constructor } from '@vaadin/mixin-utils';
import { DirectionClass } from '@vaadin/direction-mixin/direction-class';
import { KeyboardDirectionInterface } from '@vaadin/keyboard-direction-mixin';
import { KeyboardDirectionClass } from '@vaadin/keyboard-direction-mixin/keyboard-direction-class';
import { SlottedItemsInterface } from '@vaadin/slotted-items-mixin';
import { SlottedItemsClass } from '@vaadin/slotted-items-mixin/slotted-items-class';
import { SingleSelectionInterface } from '@vaadin/single-selection-mixin';
import { SingleSelectionClass } from '@vaadin/single-selection-mixin/single-selection-class';
import { DirHelper } from '@vaadin/vaadin-element-mixin/vaadin-dir-helper.js';
import { SelectionInViewClass } from './selection-in-view-class';

const scrollType = DirHelper.detectScrollType();

export const SelectionInViewMixin = <
  T extends Constructor<
    SelectionInViewClass &
      SingleSelectionInterface &
      SingleSelectionClass &
      KeyboardDirectionInterface &
      KeyboardDirectionClass &
      DirectionClass &
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
      super._focus && super._focus(item);
      this._scrollToItem(item);
    }

    protected get _normalizedScrollLeft() {
      return DirHelper.getNormalizedScrollLeft(
        scrollType,
        this.getAttribute('dir') || 'ltr',
        this._scrollTarget
      );
    }

    protected _scroll(distance: number) {
      if (this._vertical) {
        this._scrollTarget.scrollTop += distance;
      } else {
        DirHelper.setNormalizedScrollLeft(
          scrollType,
          this.getAttribute('dir') || 'ltr',
          this._scrollTarget,
          this._normalizedScrollLeft + distance
        );
      }
    }

    protected _scrollToItem(item: HTMLElement) {
      const idx = this.items.indexOf(item);

      let distance = 0;

      const { top, bottom, left, right } = this._scrollTarget.getBoundingClientRect();
      const nextItemRect = (this.items[idx + 1] || item).getBoundingClientRect();
      const prevItemRect = (this.items[idx - 1] || item).getBoundingClientRect();

      if (this._vertical) {
        if (nextItemRect.bottom > bottom) {
          distance = nextItemRect.bottom - bottom;
        } else if (prevItemRect.top < top) {
          distance = prevItemRect.top - top;
        }
      } else if (this.getAttribute('dir') === 'rtl') {
        if (nextItemRect.left < left) {
          distance = nextItemRect.left - left;
        } else if (prevItemRect.right > right) {
          distance = prevItemRect.right - right;
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (nextItemRect.right > right) {
          distance = nextItemRect.right - right;
        } else if (prevItemRect.left < left) {
          distance = prevItemRect.left - left;
        }
      }

      this._scroll(distance);
    }
  }

  return SelectionInView;
};
