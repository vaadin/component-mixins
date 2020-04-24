import { LitElement, html, customElement } from 'lit-element';
import { fixture } from '@open-wc/testing-helpers';
import { CheckedStateMixin } from '../checked-state-mixin';

const { expect } = chai;
const { sinon } = window;

@customElement('chm-element')
class ChmElement extends CheckedStateMixin(LitElement) {
  render() {
    return html`<div>Content</div>`;
  }
}

describe('CheckedStateMixin', () => {
  let element: ChmElement;

  beforeEach(async () => {
    element = await fixture(html`<chm-element></chm-element>`);
  });

  it('should have checked property set to false by default', () => {
    expect(element.checked).to.equal(false);
  });

  it('should set aria-checked attribute to false by default', () => {
    expect(element.getAttribute('aria-checked')).to.be.equal('false');
  });

  it('should reflect checked property value to the corresponding attribute', async () => {
    element.checked = true;
    await element.updateComplete;
    expect(element.hasAttribute('checked')).to.equal(true);
    element.checked = false;
    await element.updateComplete;
    expect(element.hasAttribute('checked')).to.equal(false);
  });

  it('should toggle aria-checked attribute when selected property changes', async () => {
    element.checked = true;
    await element.updateComplete;
    expect(element.getAttribute('aria-checked')).to.be.equal('true');
    element.checked = false;
    await element.updateComplete;
    expect(element.getAttribute('aria-checked')).to.be.equal('false');
  });

  it('should fire `checked-changed` event on checked change', async () => {
    const spy = sinon.spy();
    element.addEventListener('checked-changed', spy);
    element.checked = true;
    await element.updateComplete;
    expect(spy).to.be.calledOnce;
    expect(spy.firstCall.args[0]).to.be.instanceOf(CustomEvent);
    expect(spy.firstCall.args[0].detail.value).to.deep.equal(element.checked);
  });
});
