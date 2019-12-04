import { property, PropertyValues } from 'lit-element';
import { FocusVisibleClass } from './focus-visible-class';

// We consider the keyboard to be active if the window has received a keydown
// event since the last mousedown event.
let keyboardActive = false;

// Listen for top-level keydown and mousedown events.
// Use capture phase so we detect events even if they're handled.
window.addEventListener(
  'keydown',
  () => {
    keyboardActive = true;
  },
  { capture: true }
);

window.addEventListener(
  'mousedown',
  () => {
    keyboardActive = false;
  },
  { capture: true }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export interface FocusVisibleInterface {
  autofocus: boolean;
}

export const FocusVisibleMixin = <T extends Constructor<FocusVisibleClass>>(
  base: T
): T & Constructor<FocusVisibleClass & FocusVisibleInterface> => {
  class FocusVisible extends base {
    /**
     * Specify that this control should have input focus when the page loads.
     */
    @property({ type: Boolean, reflect: true }) autofocus = false;

    disconnectedCallback() {
      super.disconnectedCallback();

      // in non-Chrome browsers, blur does not fire on the element when it is disconnected.
      // reproducible in `<vaadin-date-picker>` when closing on `Cancel` or `Today` click.
      if (this.hasAttribute('focused')) {
        this._setFocused(false);
      }
    }

    protected firstUpdated(props: PropertyValues) {
      super.firstUpdated(props);

      this.addEventListener('focusin', (event: FocusEvent) => this._onFocusin(event));
      this.addEventListener('focusout', (event: FocusEvent) => this._onFocusout(event));

      if (this.autofocus && !this.hasAttribute('disabled')) {
        window.requestAnimationFrame(() => {
          this._autoFocus();
        });
      }
    }

    protected _autoFocus() {
      keyboardActive = true;
      this._setFocused(true);
    }

    protected _onFocusin(_event: FocusEvent) {
      this._setFocused(true);
    }

    protected _onFocusout(_event: FocusEvent) {
      this._setFocused(false);
    }

    protected _setFocused(focused: boolean) {
      if (focused) {
        this.setAttribute('focused', '');
      } else {
        this.removeAttribute('focused');
      }

      // focus-visible (focus-ring) attribute should be set
      // when the element was focused from the keyboard.
      if (focused && keyboardActive) {
        this.setAttribute('focus-ring', '');
      } else {
        this.removeAttribute('focus-ring');
      }
    }
  }

  return FocusVisible;
};
