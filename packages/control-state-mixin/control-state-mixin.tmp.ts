import { LitElement } from 'lit-element';
import { DisabledStateInterface } from '@vaadin/disabled-state-mixin';
import { FocusVisibleInterface } from '@vaadin/focus-visible-mixin';

type Constructor<T = object> = new (...args: any[]) => T;

export interface ControlStateInterface {
  tabIndex: number | null;
}

type ControlStateBase = Constructor<DisabledStateInterface & FocusVisibleInterface & LitElement>;

export const ControlStateMixin = <T extends ControlStateBase>(
  base: T
): Constructor<ControlStateInterface> & T => {
  class ControlState extends base {
    // class methods ...
  }

  return ControlState;
};
