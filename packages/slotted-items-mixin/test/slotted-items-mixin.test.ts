import { LitElement, html, customElement } from 'lit-element';
import { fixture, nextFrame } from '@open-wc/testing-helpers';
import { SlottedItemsMixin } from '../slotted-items-mixin';

const { expect } = chai;
const { sinon } = window;

@customElement('sim-element')
class SimElement extends SlottedItemsMixin(LitElement) {
  render() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <slot></slot>
    `;
  }
}

describe('SlottedItemsMixin', () => {
  let element: SimElement;

  beforeEach(async () => {
    element = await fixture(html`
      <sim-element>
        <div>
          <span>Item 1</span>
        </div>
        <div>
          <span>Item 2</span>
        </div>
        <div>Item 3</div>
      </sim-element>
    `);
  });

  describe('items', () => {
    it('should set `items` to the array of child nodes', () => {
      expect(element.items).to.be.an('array');
      expect(element.items.length).to.be.equal(3);
    });

    it('should update `items` value when removing nodes', async () => {
      element.removeChild(element.items[2]);
      await element.updateComplete;
      expect(element.items.length).to.be.equal(2);
    });

    it('should update `items` value when adding nodes', async () => {
      const div = document.createElement('div');
      element.appendChild(div);
      await element.updateComplete;
      expect(element.items.length).to.be.equal(4);
    });

    it('should fire `items-changed` event on items change', async () => {
      const spy = sinon.spy();
      element.addEventListener('items-changed', spy);
      const div = document.createElement('div');
      element.appendChild(div);
      await nextFrame();
      expect(spy).to.be.calledOnce;
      expect(spy.firstCall.args[0]).to.be.instanceOf(CustomEvent);
      expect(spy.firstCall.args[0].detail.value).to.deep.equal(element.items);
    });

    it('should disallow external `items` modifications', async () => {
      element.items = [];
      element.requestUpdate('items');
      await element.updateComplete;
      expect(element.items.length).to.be.equal(3);
    });
  });
});
