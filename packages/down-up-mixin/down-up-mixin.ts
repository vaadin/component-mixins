import { PropertyValues } from 'lit-element';
import { Constructor, applyMixin, wasApplied } from '@vaadin/mixin-utils';
import { DownUpClass } from './down-up-class';

export const DownUpMixin = <T extends Constructor<DownUpClass>>(
  base: T
): T & Constructor<DownUpClass> => {
  if (wasApplied(DownUpMixin, base)) {
    return base;
  }

  class DownUp extends base {
    protected firstUpdated(props: PropertyValues) {
      super.firstUpdated(props);

      if (this._downUpTarget instanceof HTMLElement) {
        this._downUpTarget.addEventListener('mousedown', (event: MouseEvent) => {
          this._onMouseDown(event);
        });

        this._downUpTarget.addEventListener('touchstart', (event: TouchEvent) => {
          this._onTouchStart(event);
        });

        this._downUpTarget.addEventListener('touchend', (event: TouchEvent) => {
          this._onTouchEnd(event);
        });
      }
    }

    protected get _downUpTarget() {
      return this;
    }

    protected _onMouseDown(event: MouseEvent) {
      // Only process events for the left button.
      if (event.buttons !== 1) {
        return;
      }

      this._onDown();

      const upListener = (e: MouseEvent) => {
        this._onMouseUp(e);
        document.removeEventListener('mouseup', upListener);
      };

      document.addEventListener('mouseup', upListener);
    }

    protected _onMouseUp(_event: MouseEvent) {
      this._onUp();
    }

    protected _onTouchStart(_event: TouchEvent) {
      this._onDown();
    }

    protected _onTouchEnd(_event: TouchEvent) {
      this._onUp();
    }

    /* istanbul ignore next */
    protected _onDown() {
      // to be implemented
    }

    /* istanbul ignore next */
    protected _onUp() {
      // to be implemented
    }
  }

  applyMixin(DownUpMixin, DownUp);

  return DownUp;
};
