import { Constructor } from '@vaadin/mixin-utils';
import { DisabledStateInterface } from '@vaadin/disabled-state-mixin';
import { DownUpMixin } from '@vaadin/down-up-mixin/down-up-mixin.js';
import { DownUpClass } from '@vaadin/down-up-mixin/down-up-class.js';
import { KeyboardMixin } from '@vaadin/keyboard-mixin/keyboard-mixin.js';
import { KeyboardClass } from '@vaadin/keyboard-mixin/keyboard-class.js';
import { ActiveStateClass } from './active-state-class';

export const ActiveStateMixin = <
  T extends Constructor<DisabledStateInterface & ActiveStateClass & KeyboardClass & DownUpClass>
>(
  base: T
): T & Constructor<ActiveStateClass & KeyboardClass & DownUpClass> => {
  class ActiveState extends KeyboardMixin(DownUpMixin(base)) {
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

    protected _onDown() {
      super._onDown && super._onDown();

      if (this.disabled) {
        return;
      }

      this._setActive(true);
    }

    protected _onUp() {
      super._onUp && super._onUp();
      this._setActive(false);
    }

    protected _setActive(active: boolean) {
      this.toggleAttribute('active', active);
    }
  }
  return ActiveState;
};
