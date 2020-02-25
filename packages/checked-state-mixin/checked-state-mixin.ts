import { property, PropertyValues } from 'lit-element';
import { Constructor } from '@vaadin/mixin-utils';
import { CheckedStateClass } from './checked-state-class';

export interface CheckedStateInterface {
  checked: boolean;
}

export const CheckedStateMixin = <T extends Constructor<CheckedStateClass>>(
  base: T
): T & Constructor<CheckedStateInterface> => {
  class CheckedState extends base {
    /**
     * If true, the element is in checked state.
     */
    @property({ type: Boolean, reflect: true }) checked = false;

    protected updated(props: PropertyValues) {
      super.updated(props);

      if (props.has('checked')) {
        this._checkedChanged(this.checked);
      }
    }

    protected _checkedChanged(checked: boolean) {
      this.setAttribute('aria-checked', checked ? 'true' : 'false');
    }
  }

  return CheckedState;
};
