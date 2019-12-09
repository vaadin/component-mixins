import { PropertyValues } from 'lit-element';
import { DisabledStateInterface } from '@vaadin/disabled-state-mixin';
import { ActiveStateClass } from './active-state-class';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export const ActiveStateMixin = <T extends Constructor<DisabledStateInterface & ActiveStateClass>>(
  base: T
): T & Constructor<ActiveStateClass> => {
  class ActiveState extends base {
    protected firstUpdated(props: PropertyValues) {
      super.firstUpdated(props);

      this.addEventListener('mousedown', (event: MouseEvent) => {
        this._onMouseDown(event);
      });

      this.addEventListener('keydown', (event: KeyboardEvent) => {
        this._onKeyDown(event);
      });

      this.addEventListener('keyup', (event: KeyboardEvent) => {
        this._onKeyUp(event);
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
      if (/^( |SpaceBar|Enter)$/.test(event.key) && !this.disabled && !event.defaultPrevented) {
        event.preventDefault();
        this._setActive(true);
      }
    }

    protected _onKeyUp(_event: KeyboardEvent) {
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
      if (active) {
        this.setAttribute('active', '');
      } else {
        this.removeAttribute('active');
      }
    }
  }
  return ActiveState;
};
