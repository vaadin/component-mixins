import { property, PropertyValues } from 'lit-element';
import { Constructor } from '@vaadin/mixin-utils';
import { DirectionMixin } from '@vaadin/direction-mixin/direction-mixin.js';
import { DirectionClass } from '@vaadin/direction-mixin/direction-class.js';

export interface OrientationInterface {
  orientation: string | null | undefined;
}

export const OrientationMixin = <T extends Constructor<DirectionClass>>(
  base: T
): T & Constructor<OrientationInterface> => {
  const Base = DirectionMixin(base);

  class Orientation extends Base {
    /**
     * Set element disposition. Possible values are `horizontal|vertical`.
     * @type {`horizontal|vertical}
     */
    @property({ type: String, reflect: true }) orientation: string | null | undefined;

    protected firstUpdated(props: PropertyValues) {
      super.firstUpdated(props);

      this._setOrientation();
    }

    protected updated(props: PropertyValues) {
      super.updated(props);

      if (props.has('orientation')) {
        this._setOrientation();
      }
    }

    protected get _vertical() {
      return this.orientation === 'vertical';
    }

    private _setOrientation() {
      this.setAttribute(
        'aria-orientation',
        this.orientation === 'vertical' ? 'vertical' : 'horizontal'
      );
    }
  }

  return Orientation;
};
