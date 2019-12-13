import { LitElement, html, customElement } from 'lit-element';
import { fixture } from '@open-wc/testing-helpers';
import { DisabledStateMixin } from '@vaadin/disabled-state-mixin';
import { SelectedStateMixin } from '../selected-state-mixin';

const { expect } = chai;

@customElement('ssm-element')
class SsmElement extends SelectedStateMixin(DisabledStateMixin(LitElement)) {
  render() {
    return html`
      <div>Content</div>
    `;
  }
}

describe('SelectedStateMixin', () => {
  let element: SsmElement;

  beforeEach(async () => {
    element = await fixture(`<ssm-element></ssm-element>`);
  });

  it('should have selected property set to false by default', () => {
    expect(element.selected).to.equal(false);
  });

  it('should set aria-selected attribute to false by default', () => {
    expect(element.getAttribute('aria-selected')).to.be.equal('false');
  });

  it('should reflect selected property value to the corresponding attribute', async () => {
    element.selected = true;
    await element.updateComplete;
    expect(element.hasAttribute('selected')).to.equal(true);
    element.selected = false;
    await element.updateComplete;
    expect(element.hasAttribute('selected')).to.equal(false);
  });

  it('should toggle aria-selected attribute when selected property changes', async () => {
    element.selected = true;
    await element.updateComplete;
    expect(element.getAttribute('aria-selected')).to.be.equal('true');
    element.selected = false;
    await element.updateComplete;
    expect(element.getAttribute('aria-selected')).to.be.equal('false');
  });

  it('should set selected property to false when disabled is set to true', async () => {
    element.selected = true;
    element.disabled = true;
    await element.updateComplete;
    expect(element.selected).to.equal(false);
  });
});
