import { property, PropertyValues } from 'lit-element';
import { Constructor } from '@vaadin/mixin-utils';
import { DisabledStateInterface } from '@vaadin/disabled-state-mixin';
import { FocusVisibleInterface } from '@vaadin/focus-visible-mixin';
import { FocusVisibleClass } from '@vaadin/focus-visible-mixin/focus-visible-class';
import { KeyboardMixin } from '@vaadin/keyboard-mixin/keyboard-mixin.js';
import { KeyboardClass } from '@vaadin/keyboard-mixin/keyboard-class.js';

export interface ControlStateInterface {
  tabIndex: number | null;
  focus(): void;
  blur(): void;
}

export const ControlStateMixin = <
  T extends Constructor<
    DisabledStateInterface & FocusVisibleInterface & KeyboardClass & FocusVisibleClass
  >
>(
  base: T
): Constructor<ControlStateInterface> & T => {
  class ControlState extends KeyboardMixin(base) {
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

    private _tabindex?: number;

    private _previousTabIndex?: number;

    private _isShiftTabbing = false;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    constructor(...args: any[]) {
      super(...args);

      if (!this.hasAttribute('tabindex')) {
        this.tabIndex = 0;
      }
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

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

    protected _autoFocus() {
      if (super._autoFocus) {
        super._autoFocus();
      }
      this.focusElement.focus();
    }

    protected _onFocusin(event: FocusEvent) {
      const path = event.composedPath();
      if (path[0] === this) {
        this._focus();
      } else if (path.indexOf(this.focusElement) !== -1 && !this.disabled && super._onFocusin) {
        super._onFocusin(event);
      }
    }

    protected _onKeyDown(event: KeyboardEvent) {
      super._onKeyDown && super._onKeyDown(event);
      if (!event.defaultPrevented && event.shiftKey && event.keyCode === 9) {
        // Flag is checked in _focus event handler.
        this._isShiftTabbing = true;
        HTMLElement.prototype.focus.apply(this);
        this._setFocused(false);
        // Event handling in IE is asynchronous and the flag is removed asynchronously as well
        setTimeout(() => {
          this._isShiftTabbing = false;
        }, 0);
      }
    }

    protected _setFocused(focused: boolean) {
      if (super._setFocused) {
        super._setFocused(focused);
      }
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

  return ControlState;
};
