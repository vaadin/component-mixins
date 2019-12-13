import { LitElement, html, customElement } from 'lit-element';
import { fixture } from '@open-wc/testing-helpers';
import { DisabledStateMixin } from '../disabled-state-mixin';

const { expect } = chai;
const { sinon } = window;

@customElement('dsm-test-element')
class DsmTestElement extends DisabledStateMixin(LitElement) {
  render() {
    return html`
      <div>Content</div>
    `;
  }
}

describe('DisabledStateMixin', () => {
  let element: DsmTestElement;

  beforeEach(async () => {
    element = await fixture(`<dsm-test-element></dsm-test-element>`);
  });

  it('should reflect disabled property value to the corresponding attribute', async () => {
    element.disabled = true;
    await element.updateComplete;
    expect(element.hasAttribute('disabled')).to.equal(true);
    element.disabled = false;
    await element.updateComplete;
    expect(element.hasAttribute('disabled')).to.equal(false);
  });

  it('should toggle aria-disabled attribute when disabled property changes', async () => {
    element.disabled = true;
    await element.updateComplete;
    expect(element.getAttribute('aria-disabled')).to.be.equal('true');
    element.disabled = false;
    await element.updateComplete;
    expect(element.getAttribute('aria-disabled')).to.be.equal(null);
  });

  it('should fire click event for element when not disabled', () => {
    const spy = sinon.spy();
    element.addEventListener('click', spy);
    element.click();
    expect(spy.called).to.be.true;
  });

  it('should not fire click event for element when disabled', async () => {
    element.disabled = true;
    await element.updateComplete;
    const spy = sinon.spy();
    element.addEventListener('click', spy);
    element.click();
    expect(spy.called).to.be.false;
  });
});
