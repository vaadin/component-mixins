import { LitElement, property, PropertyValues } from 'lit-element';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface OrientationInterface {
  orientation: string | null | undefined;
}

export const OrientationMixin = <T extends Constructor<LitElement>>(
  base: T
): T & Constructor<OrientationInterface> => {
  class Orientation extends base {
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

    private _setOrientation() {
      this.setAttribute(
        'aria-orientation',
        this.orientation === 'vertical' ? 'vertical' : 'horizontal'
      );
    }
  }

  return Orientation;
};
