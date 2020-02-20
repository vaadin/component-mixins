import { LitElement, property, PropertyValues } from 'lit-element';
import { Constructor } from '@vaadin/mixin-utils';

export interface DisabledStateInterface {
  disabled: boolean;
}

export const DisabledStateMixin = <T extends Constructor<LitElement>>(
  base: T
): T & Constructor<DisabledStateInterface> => {
  class DisabledState extends base {
    /**
     * If true, the user cannot interact with this element.
     */
    @property({ type: Boolean, reflect: true }) disabled = false;

    protected update(props: PropertyValues) {
      super.update(props);

      if (props.has('disabled')) {
        if (this.disabled) {
          this.setAttribute('aria-disabled', 'true');
        } else if (props.get('disabled')) {
          this.removeAttribute('aria-disabled');
        }
      }
    }

    click() {
      if (!this.disabled) {
        super.click();
      }
    }
  }

  return DisabledState;
};
