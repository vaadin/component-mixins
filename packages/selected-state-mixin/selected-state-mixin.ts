import { property, PropertyValues } from 'lit-element';
import { Constructor } from '@vaadin/mixin-utils';
import { DisabledStateInterface } from '@vaadin/disabled-state-mixin';
import { SelectedStateClass } from './selected-state-class';

export interface SelectedStateInterface {
  selected: boolean;
}

export const SelectedStateMixin = <
  T extends Constructor<SelectedStateClass & DisabledStateInterface>
>(
  base: T
): T & Constructor<SelectedStateInterface> => {
  class SelectedState extends base {
    /**
     * Used for mixin detection because `instanceof` does not work with mixins.
     */
    static hasSelectedStateMixin = true;

    /**
     * If true, the element is in selected state.
     */
    @property({ type: Boolean, reflect: true }) selected = false;

    protected update(props: PropertyValues) {
      if (props.has('disabled') && this.disabled) {
        this.selected = false;
      }

      super.update(props);
    }

    protected updated(props: PropertyValues) {
      super.updated(props);

      if (props.has('selected')) {
        this.setAttribute('aria-selected', this.selected ? 'true' : 'false');
      }
    }
  }

  return SelectedState;
};
