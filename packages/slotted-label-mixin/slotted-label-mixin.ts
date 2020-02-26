import { LitElement, PropertyValues } from 'lit-element';
import { Constructor } from '@vaadin/mixin-utils';

const isEmpty = (nodes: Node[]) =>
  nodes.every(node => node.nodeType === Node.TEXT_NODE && !node.textContent?.trim());

export const SlottedLabelMixin = <T extends Constructor<LitElement>>(base: T): T => {
  class SlottedLabel extends base {
    protected firstUpdated(props: PropertyValues) {
      super.firstUpdated(props);

      const label = this.renderRoot.querySelector('[part~="label"]');
      if (label) {
        const slot = label.firstElementChild;
        if (slot instanceof HTMLSlotElement) {
          slot.addEventListener('slotchange', () => this._updateLabelState(slot));
          this._updateLabelState(slot);
        }
      }
    }

    private _updateLabelState(slot: HTMLSlotElement) {
      this.toggleAttribute('label-empty', isEmpty(Array.from(slot.assignedNodes())));
    }
  }

  return SlottedLabel;
};
