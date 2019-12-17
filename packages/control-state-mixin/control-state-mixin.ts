import { LitElement, property, PropertyValues } from 'lit-element';
import { DisabledStateInterface } from '@vaadin/disabled-state-mixin';

export interface ControlStateInterface {
  autofocus: boolean;
  tabIndex: number | null;
  focus(): void;
  blur(): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export const ControlStateMixin = <T extends Constructor<DisabledStateInterface & LitElement>>(
  base: T
): Constructor<ControlStateInterface> & T => {
  class VaadinControlStateMixin extends base implements ControlStateInterface {
    @property({
      reflect: true,
      converter: {
        fromAttribute: Number,
        toAttribute: (value: number | null) => (value == null ? null : value.toString())
      }
    })
    public get tabIndex() {
      return this._tabindex as number;
    }

    public set tabIndex(value) {
      const oldValue = this._tabindex;
      this._tabindex = value;
      this.requestUpdate('tabIndex', oldValue);
    }

    /**
     * Specify that this control should have input focus when the page loads.
     */
    @property({ type: Boolean, reflect: true }) autofocus = false;

    private _tabindex?: number;

    private _previousTabIndex?: number;

    private _isShiftTabbing = false;

    private _tabPressed = false;

    private _boundKeydownListener = this._bodyKeydownListener.bind(this);

    private _boundKeyupListener = this._bodyKeyupListener.bind(this);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    constructor(...args: any[]) {
      super(...args);

      if (!this.hasAttribute('tabindex')) {
        this.tabIndex = 0;
      }
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    connectedCallback() {
      super.connectedCallback();

      document.body.addEventListener('keydown', this._boundKeydownListener, true);
      document.body.addEventListener('keyup', this._boundKeyupListener, true);
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      document.body.removeEventListener('keydown', this._boundKeydownListener, true);
      document.body.removeEventListener('keyup', this._boundKeyupListener, true);

      // in non-Chrome browsers, blur does not fire on the element when it is disconnected.
      // reproducible in `<vaadin-date-picker>` when closing on `Cancel` or `Today` click.
      if (this.hasAttribute('focused')) {
        this._setFocused(false);
      }
    }

    protected firstUpdated() {
      this.addEventListener('focusin', e => {
        if (e.composedPath()[0] === this) {
          this._focus();
        } else if (e.composedPath().indexOf(this.focusElement) !== -1 && !this.disabled) {
          this._setFocused(true);
        }
      });

      this.addEventListener('focusout', () => this._setFocused(false));

      this.addEventListener('keydown', e => {
        if (!e.defaultPrevented && e.shiftKey && e.keyCode === 9) {
          // Flag is checked in _focus event handler.
          this._isShiftTabbing = true;
          HTMLElement.prototype.focus.apply(this);
          this._setFocused(false);
          // Event handling in IE is asynchronous and the flag is removed asynchronously as well
          setTimeout(() => {
            this._isShiftTabbing = false;
          }, 0);
        }
      });

      if (this.autofocus && !this.disabled) {
        window.requestAnimationFrame(() => {
          this._focus();
          this._setFocused(true);
          this.setAttribute('focus-ring', '');
        });
      }
    }

    protected update(props: PropertyValues) {
      if (props.has('disabled')) {
        if (this.disabled) {
          this._previousTabIndex = this.tabIndex;
          this.tabIndex = -1;
        } else if (props.get('disabled')) {
          if (this._previousTabIndex !== undefined) {
            this.tabIndex = this._previousTabIndex;
          }
        }
      }

      if (props.has('tabIndex')) {
        const { tabIndex } = this;
        // When element is disabled, propagate `tabIndex` to focusElement
        // and then reset it on the host element to disallow interaction.
        if (this.disabled && tabIndex != null) {
          if (tabIndex !== -1) {
            this._previousTabIndex = tabIndex;
          }
          // We need this because of resetting tabIndex to null below,
          // so in `updated()` we have a reference to the old value.
          props.set('tabIndex', tabIndex);

          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          this.tabIndex = null;
        }
      }

      super.update(props);
    }

    protected updated(props: PropertyValues) {
      super.updated(props);

      if (props.has('disabled')) {
        this.focusElement.disabled = this.disabled;
        if (this.disabled) {
          this.blur();
        }
      }

      if (props.has('tabIndex')) {
        const { tabIndex } = this;
        const oldTabIndex = props.get('tabIndex') as number;
        this.focusElement.tabIndex = tabIndex == null ? oldTabIndex : tabIndex;
      }
    }

    protected _setFocused(focused: boolean) {
      if (focused) {
        this.setAttribute('focused', '');
      } else {
        this.removeAttribute('focused');
      }

      // focus-ring is true when the element was focused from the keyboard.
      // Focus Ring [A11ycasts]: https://youtu.be/ilj2P5-5CjI
      if (focused && this._tabPressed) {
        this.setAttribute('focus-ring', '');
      } else {
        this.removeAttribute('focus-ring');
      }
    }

    private _bodyKeydownListener(e: KeyboardEvent) {
      this._tabPressed = e.keyCode === 9;
    }

    private _bodyKeyupListener() {
      this._tabPressed = false;
    }

    /**
     * Any element extending this mixin is required to implement this getter.
     * It returns the actual focusable element in the component.
     */
    get focusElement() {
      window.console.warn(`Please implement the 'focusElement' property in <${this.localName}>`);
      return this;
    }

    protected _focus() {
      if (this._isShiftTabbing) {
        return;
      }

      this.focusElement.focus();
      this._setFocused(true);
    }

    /**
     * Moving the focus from the host element causes firing of the blur event what leads to problems in IE.
     */
    focus() {
      if (!this.focusElement || this.disabled) {
        return;
      }

      this.focusElement.focus();
      this._setFocused(true);
    }

    /**
     * Native bluring in the host element does nothing because it does not have the focus.
     * In chrome it works, but not in FF.
     */
    blur() {
      this.focusElement.blur();
      this._setFocused(false);
    }
  }

  return VaadinControlStateMixin;
};
