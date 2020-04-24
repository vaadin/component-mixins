import { property, PropertyValues } from 'lit-element';
import { Constructor } from '@vaadin/mixin-utils';
import { DisabledStateInterface } from '@vaadin/disabled-state-mixin';
import { SelectedStateClass } from '@vaadin/selected-state-mixin/selected-state-class';
import { SelectedStateInterface } from '@vaadin/selected-state-mixin';
import { SlottedItemsInterface } from '@vaadin/slotted-items-mixin';
import { SlottedItemsClass } from '@vaadin/slotted-items-mixin/slotted-items-class';
import { SingleSelectionClass } from './single-selection-class';

export interface SingleSelectionInterface {
  selected: number | null | undefined;
}

const filterItems = (nodes: Node[]) => {
  return nodes.filter((node): node is SelectedStateClass => {
    return (
      node.nodeType === Node.ELEMENT_NODE &&
      (node.constructor as typeof SelectedStateClass).hasSelectedStateMixin
    );
  });
};

export const SingleSelectionMixin = <
  T extends Constructor<SlottedItemsInterface & SlottedItemsClass & SingleSelectionClass>
>(
  base: T
): T & Constructor<SingleSelectionInterface> => {
  class SingleSelection extends base {
    /**
     * The index of the item selected in the items array.
     */
    @property({ type: Number, reflect: true }) selected: number | null | undefined;

    protected firstUpdated(props: PropertyValues) {
      super.firstUpdated(props);

      this.addEventListener('click', (event) => {
        this._onClick(event);
      });

      this.addEventListener('keyup', (event) => {
        this._onKeyUp(event);
      });
    }

    protected updated(props: PropertyValues) {
      super.updated(props);

      if (props.has('selected')) {
        const { items, selected } = this;
        items.forEach((item, idx) => {
          // eslint-disable-next-line no-param-reassign
          (item as SelectedStateClass & SelectedStateInterface).selected = idx === selected;
        });

        this.dispatchEvent(
          new CustomEvent('selected-changed', {
            detail: { value: this.selected }
          })
        );
      }
    }

    protected _filterItems() {
      return filterItems(Array.from(this.children));
    }

    protected _onClick(event: MouseEvent) {
      this._setSelected(event);
    }

    protected _onKeyUp(event: KeyboardEvent) {
      if (/^( |SpaceBar|Enter)$/.test(event.key)) {
        this._setSelected(event);
      }
    }

    private _setSelected(event: MouseEvent | KeyboardEvent) {
      if (event.metaKey || event.shiftKey || event.ctrlKey) {
        return;
      }

      const path = event.composedPath() as Node[];
      const item = filterItems(path)[0] as SelectedStateClass & DisabledStateInterface;
      const idx = this.items.indexOf(item);
      if (item && !item.disabled && idx >= 0) {
        this.selected = idx;
      }
    }
  }

  return SingleSelection;
};
