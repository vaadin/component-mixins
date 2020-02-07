export const DisabledStateMixin = base => {
  class DisabledState extends base {
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

  return DisabledState;
};
