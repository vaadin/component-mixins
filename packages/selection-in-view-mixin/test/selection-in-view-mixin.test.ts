import { LitElement, html, customElement } from 'lit-element';
import { fixture } from '@open-wc/testing-helpers';
import {
  arrowDownKeyDown,
  arrowLeftKeyDown,
  arrowRightKeyDown,
  arrowUpKeyDown,
  enterKeyDown,
  enterKeyUp
} from '@vaadin/test-helpers';
import { DisabledStateMixin } from '@vaadin/disabled-state-mixin';
import { KeyboardDirectionMixin } from '@vaadin/keyboard-direction-mixin';
import { OrientationMixin } from '@vaadin/orientation-mixin';
import { SelectedStateMixin } from '@vaadin/selected-state-mixin';
import { SingleSelectionMixin } from '@vaadin/single-selection-mixin';
import { SlottedItemsMixin } from '@vaadin/slotted-items-mixin';
import { SelectionInViewMixin } from '../selection-in-view-mixin';

const { expect } = chai;

@customElement('svm-item')
class SvmItem extends SelectedStateMixin(DisabledStateMixin(LitElement)) {
  constructor() {
    super();
    this.setAttribute('tabindex', '0');
  }

  render() {
    return html`
      <style>
        :host {
          display: flex;
          justify-content: center;
          align-items: center;
          min-width: 50px;
          min-height: 50px;
          flex-shrink: 0;
        }
      </style>
      <slot></slot>
    `;
  }
}

@customElement('svm-list')
class SvmList extends SelectionInViewMixin(
  OrientationMixin(SingleSelectionMixin(KeyboardDirectionMixin(SlottedItemsMixin(LitElement))))
) {
  render() {
    return html`
      <style>
        :host {
          display: block;
          width: 100px;
          height: 50px;
        }

        :host([orientation='vertical']) {
          width: 50px;
          height: 100px;
        }

        #scroll {
          overflow: auto;
          display: flex;
        }

        :host([orientation='vertical']) #scroll {
          height: 100%;
          flex-direction: column;
        }
      </style>
      <div id="scroll">
        <slot></slot>
      </div>
    `;
  }

  protected get _scrollTarget() {
    return this.renderRoot.querySelector('#scroll') as HTMLElement;
  }

  public get scroller() {
    return this._scrollTarget;
  }
}

describe('SelectionInViewMixin', () => {
  let element: SvmList;
  let items: SvmItem[];

  beforeEach(async () => {
    element = await fixture(
      html`
        <svm-list>
          <svm-item>1</svm-item>
          <svm-item>2</svm-item>
          <svm-item>3</svm-item>
        </svm-list>
      `
    );
    items = element.items as SvmItem[];
  });

  describe('horizontal', () => {
    describe('default mode', () => {
      it('should scroll forward when selecting next item', async () => {
        expect(element.scroller.scrollLeft).to.be.equal(0);
        enterKeyDown(items[1]);
        enterKeyUp(items[1]);
        await element.updateComplete;
        expect(element.scroller.scrollLeft).to.be.greaterThan(0);
      });

      it('should scroll back when selecting previous item', async () => {
        element.selected = 2;
        await element.updateComplete;
        expect(element.scroller.scrollLeft).to.be.greaterThan(0);
        enterKeyDown(items[0]);
        enterKeyUp(items[0]);
        await element.updateComplete;
        expect(element.scroller.scrollLeft).to.be.equal(0);
      });

      it('should scroll forward when focusing next item', async () => {
        items[0].focus();
        arrowRightKeyDown(items[0]);
        await element.updateComplete;
        expect(element.scroller.scrollLeft).to.be.greaterThan(0);
      });

      it('should scroll back when focusing previous item', async () => {
        element.selected = 1;
        await element.updateComplete;
        expect(element.scroller.scrollLeft).to.be.greaterThan(0);
        items[1].focus();
        arrowLeftKeyDown(items[1]);
        await element.updateComplete;
        expect(element.scroller.scrollLeft).to.be.equal(0);
      });

      it('should not scroll to item when it is disabled', async () => {
        items[2].disabled = true;
        await items[2].updateComplete;
        element.selected = 2;
        await element.updateComplete;
        expect(element.scroller.scrollLeft).to.be.equal(0);
      });
    });

    describe('RTL mode', () => {
      beforeEach(() => {
        element.setAttribute('dir', 'rtl');
      });

      it('should scroll when reaching left most visible item', async () => {
        element.selected = 0;
        await element.updateComplete;
        items[0].focus();
        arrowLeftKeyDown(items[0]);
        await element.updateComplete;
        const itemRectLeft = items[2].getBoundingClientRect().left;
        const listRectLeft = element.getBoundingClientRect().left;
        expect(listRectLeft).to.be.closeTo(itemRectLeft, 1);
      });

      it('should scroll when reaching right most visible item', async () => {
        element.selected = 2;
        await element.updateComplete;
        items[2].focus();
        arrowRightKeyDown(items[2]);
        await element.updateComplete;
        const itemRectRight = items[0].getBoundingClientRect().right;
        const listRectRight = element.getBoundingClientRect().right;
        expect(listRectRight).to.be.closeTo(itemRectRight, 1);
      });
    });
  });

  describe('vertical', () => {
    beforeEach(async () => {
      element.orientation = 'vertical';
      await element.updateComplete;
    });

    it('should scroll forward when selecting next item', async () => {
      expect(element.scroller.scrollTop).to.be.equal(0);
      enterKeyDown(items[1]);
      enterKeyUp(items[1]);
      await element.updateComplete;
      expect(element.scroller.scrollTop).to.be.greaterThan(0);
    });

    it('should scroll back when selecting previous item', async () => {
      element.selected = 2;
      await element.updateComplete;
      expect(element.scroller.scrollTop).to.be.greaterThan(0);
      enterKeyDown(items[0]);
      enterKeyUp(items[0]);
      await element.updateComplete;
      expect(element.scroller.scrollTop).to.be.equal(0);
    });

    it('should scroll forward when focusing next item', async () => {
      items[0].focus();
      arrowDownKeyDown(items[0]);
      await element.updateComplete;
      expect(element.scroller.scrollTop).to.be.greaterThan(0);
    });

    it('should scroll back when focusing previous item', async () => {
      element.selected = 1;
      await element.updateComplete;
      expect(element.scroller.scrollTop).to.be.greaterThan(0);
      items[1].focus();
      arrowUpKeyDown(items[1]);
      await element.updateComplete;
      expect(element.scroller.scrollTop).to.be.equal(0);
    });

    it('should not scroll to item when it is disabled', async () => {
      items[2].disabled = true;
      await items[2].updateComplete;
      element.selected = 2;
      await element.updateComplete;
      expect(element.scroller.scrollTop).to.be.equal(0);
    });
  });
});
