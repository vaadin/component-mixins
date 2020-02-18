import { PropertyValues } from 'lit-element';
import { Constructor, applyMixin, wasApplied } from '@vaadin/mixin-utils';
import { KeyboardClass } from './keyboard-class';

export function KeyboardMixin<T extends Constructor<KeyboardClass>>(
  base: T
): Constructor<KeyboardClass> & T {
  if (wasApplied(KeyboardMixin, base)) {
    return base;
  }

  class Keyboard extends base {
    protected firstUpdated(props: PropertyValues) {
      super.firstUpdated(props);

      this.addEventListener('keydown', (event: KeyboardEvent) => {
        this._onKeyDown(event);
      });

      this.addEventListener('keyup', (event: KeyboardEvent) => {
        this._onKeyUp(event);
      });
    }

    protected _onKeyDown(_event: KeyboardEvent) {
      // to be implemented
    }

    protected _onKeyUp(_event: KeyboardEvent) {
      // to be implemented
    }
  }

  applyMixin(KeyboardMixin, Keyboard);

  return Keyboard;
}
