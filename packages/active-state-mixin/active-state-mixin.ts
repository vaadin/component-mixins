import { PropertyValues } from 'lit-element';
import { Constructor } from '@vaadin/mixin-utils';
import { DisabledStateInterface } from '@vaadin/disabled-state-mixin';
import { KeyboardMixin } from '@vaadin/keyboard-mixin/keyboard-mixin.js';
import { KeyboardClass } from '@vaadin/keyboard-mixin/keyboard-class.js';
import { ActiveStateClass } from './active-state-class';

export const ActiveStateMixin = <
  T extends Constructor<DisabledStateInterface & ActiveStateClass & KeyboardClass>
>(
  base: T
): T & Constructor<ActiveStateClass> => {
  class ActiveState extends KeyboardMixin(base) {
    protected firstUpdated(props: PropertyValues) {
      super.firstUpdated(props);

      this.addEventListener('mousedown', (event: MouseEvent) => {
        this._onMouseDown(event);
      });

      this.addEventListener('touchstart', (event: TouchEvent) => {
        this._onTouchStart(event);
      });

      this.addEventListener('touchend', (event: TouchEvent) => {
        this._onTouchEnd(event);
      });
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      // `active` state is preserved when the element is disconnected between keydown and keyup events.
      // reproducible in `<vaadin-date-picker>` when closing on `Cancel` or `Today` click.
      if (this.hasAttribute('active')) {
        this.removeAttribute('active');
      }
    }

    protected _onKeyDown(event: KeyboardEvent) {
      super._onKeyDown && super._onKeyDown(event);
      if (/^( |SpaceBar|Enter)$/.test(event.key) && !this.disabled && !event.defaultPrevented) {
        event.preventDefault();
        this._setActive(true);
      }
    }

    protected _onKeyUp(event: KeyboardEvent) {
      super._onKeyUp && super._onKeyUp(event);
      this._setActive(false);
    }

    protected _onMouseDown(event: MouseEvent) {
      // Only process events for the left button.
      if (event.buttons !== 1 || this.disabled) {
        return;
      }

      this._setActive(true);

      const upListener = () => {
        this._setActive(false);
        document.removeEventListener('mouseup', upListener);
      };

      document.addEventListener('mouseup', upListener);
    }

    protected _onTouchStart(_event: TouchEvent) {
      if (!this.disabled) {
        this._setActive(true);
      }
    }

    protected _onTouchEnd(_event: TouchEvent) {
      this._setActive(false);
    }

    protected _setActive(active: boolean) {
      this.toggleAttribute('active', active);
    }
  }
  return ActiveState;
};
