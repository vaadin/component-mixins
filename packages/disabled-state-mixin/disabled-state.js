export const DisabledStateMixin = base => {
  class DisabledElement extends base {
    static get properties() {
      return {
        disabled: {
          type: Boolean,
          value: false
        }
      };
    }

    click() {
      if (!this.disabled) {
        super.click();
      }
    }
  }

  return DisabledElement;
};
