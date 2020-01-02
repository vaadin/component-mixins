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
      super._focus && super._focus(item);
      this._scrollToItem(item);
    }

    protected _scroll(distance: number) {
      const prop = this._vertical ? 'scrollTop' : 'scrollLeft';
      this._scrollTarget[prop] += distance;
    }

    protected _scrollToItem(item: HTMLElement) {
      const idx = this.items.indexOf(item);

      let distance = 0;
      const props: Array<'top' | 'bottom' | 'left' | 'right'> = this._vertical
        ? ['top', 'bottom']
        : ['left', 'right'];
      const scrollerRect = this._scrollTarget.getBoundingClientRect();
      const nextItemRect = (this.items[idx + 1] || item).getBoundingClientRect();
      const prevItemRect = (this.items[idx - 1] || item).getBoundingClientRect();

      if (nextItemRect[props[1]] >= scrollerRect[props[1]]) {
        distance = nextItemRect[props[1]] - scrollerRect[props[1]];
      } else if (prevItemRect[props[0]] <= scrollerRect[props[0]]) {
        distance = prevItemRect[props[0]] - scrollerRect[props[0]];
      }

      this._scroll(distance);
    }
  }

  return SelectionInView;
};
