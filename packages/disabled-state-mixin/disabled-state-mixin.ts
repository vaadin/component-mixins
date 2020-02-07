import { LitElement, property } from 'lit-element';

type Constructor<T = object> = new (...args: any[]) => T;

export interface DisabledStateInterface {
  disabled: boolean;
}

export const DisabledStateMixin = <T extends Constructor<LitElement>>(
  base: T
): T & Constructor<DisabledStateInterface> => {
  class DisabledState extends base {
    @property({ type: Boolean, reflect: true }) disabled = false;

    click() {
      if (!this.disabled) {
        super.click();
      }
    }
  }

  return DisabledState;
};
