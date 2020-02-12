import { LitElement, html, customElement } from 'lit-element';
import { fixture } from '@open-wc/testing-helpers';
import {
  arrowDownKeyDown,
  arrowDownKeyUp,
  enterKeyDown,
  enterKeyUp,
  spaceKeyDown,
  spaceKeyUp
} from '@vaadin/test-helpers';
import { DisabledStateMixin } from '@vaadin/disabled-state-mixin';
import { SlottedItemsMixin } from '@vaadin/slotted-items-mixin';
import { SelectedStateMixin } from '@vaadin/selected-state-mixin';
import { SingleSelectionMixin } from '../single-selection-mixin';

const { expect } = chai;
const { sinon } = window;

@customElement('ssm-item')
class SsmItem extends SelectedStateMixin(DisabledStateMixin(LitElement)) {
  render() {
    return html`
      <slot></slot>
    `;
  }
}

@customElement('ssm-list')
class SsmList extends SingleSelectionMixin(SlottedItemsMixin(LitElement)) {
  render() {
    return html`
      <slot></slot>
    `;
  }
}

describe('SingleSelectionMixin', () => {
  let element: SsmList;
  let items: SsmItem[];

  beforeEach(async () => {
    element = await fixture(
      html`
        <ssm-list>
          <ssm-item>Item 1</ssm-item>
          <ssm-item>Item 2</ssm-item>
          <span>&nbsp;</span>
          <ssm-item>
            <span>Item 3</span>
          </ssm-item>
        </ssm-list>
      `
    );
    items = element.items as SsmItem[];
  });

  it('should set selected to undefined by default', () => {
    expect(element.selected).to.be.equal(undefined);
  });

  it('should only add selectable components to items', () => {
    expect(items.length).to.equal(3);
    items.forEach(item => {
      expect(item.tagName.toLowerCase()).to.equal('ssm-item');
    });
  });

  it('should not select any item by default', () => {
    items.forEach(item => expect(item.selected).to.be.false);
  });

  it('should select an item when `selected` property is set', async () => {
    element.selected = 2;
    await element.updateComplete;
    expect(items[2].selected).to.be.true;
  });

  it('should select an item on click', async () => {
    items[1].click();
    await element.updateComplete;
    expect(element.selected).to.be.equal(1);
  });

  it('should select an item on Enter key', async () => {
    enterKeyDown(items[1]);
    enterKeyUp(items[1]);
    await element.updateComplete;
    expect(element.selected).to.be.equal(1);
  });

  it('should select an item on Space key', async () => {
    spaceKeyDown(items[1]);
    spaceKeyUp(items[1]);
    await element.updateComplete;
    expect(element.selected).to.be.equal(1);
  });

  it('should not select an item on other key', async () => {
    arrowDownKeyDown(items[1]);
    arrowDownKeyUp(items[1]);
    await element.updateComplete;
    expect(element.selected).to.be.equal(undefined);
  });

  it('should select an item on child element click', async () => {
    const span = items[2].firstElementChild as HTMLElement;
    span.click();
    await element.updateComplete;
    expect(element.selected).to.be.equal(2);
  });

  it('should not select an item on click with shiftKey', async () => {
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'shiftKey', {
      get() {
        return true;
      }
    });
    items[1].dispatchEvent(event);
    await element.updateComplete;
    expect(element.selected).to.be.equal(undefined);
  });

  it('should not select an item on click with metaKey', async () => {
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'metaKey', {
      get() {
        return true;
      }
    });
    items[1].dispatchEvent(event);
    await element.updateComplete;
    expect(element.selected).to.be.equal(undefined);
  });

  it('should not select an item on click with ctrlKey', async () => {
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'ctrlKey', {
      get() {
        return true;
      }
    });
    items[1].dispatchEvent(event);
    await element.updateComplete;
    expect(element.selected).to.be.equal(undefined);
  });

  it('should fire `selected-changed` when item is selected', async () => {
    const spy = sinon.spy();
    element.addEventListener('selected-changed', spy);
    items[1].click();
    await element.updateComplete;
    expect(spy).to.be.calledOnce;
    expect(spy.firstCall.args[0]).to.be.instanceOf(CustomEvent);
    expect(spy.firstCall.args[0].detail.value).to.deep.equal(element.selected);
  });
});
