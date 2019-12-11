import { LitElement, html, customElement } from 'lit-element';
import { fixture } from '@open-wc/testing-helpers';
import { OrientationMixin } from '../orientation-mixin';

const { expect } = chai;

@customElement('om-element')
class OmElement extends OrientationMixin(LitElement) {
  render() {
    return html`
      <div>Content</div>
    `;
  }
}

describe('OrientationMixin', () => {
  let element: OmElement;

  beforeEach(async () => {
    element = await fixture(`<om-element></om-element>`);
  });

  it('should have orientation property set to "horizontal" by default', () => {
    expect(element.orientation).to.equal('horizontal');
  });

  it('should set aria-orientation attribute to "horizontal" by default', () => {
    expect(element.getAttribute('aria-orientation')).to.be.equal('horizontal');
  });

  it('should reflect orientation property value to the corresponding attribute', async () => {
    element.orientation = 'vertical';
    await element.updateComplete;
    expect(element.getAttribute('orientation')).to.equal('vertical');
  });

  it('should toggle aria-orientation attribute when orientation property changes', async () => {
    element.orientation = 'vertical';
    await element.updateComplete;
    expect(element.getAttribute('aria-orientation')).to.equal('vertical');
  });
});
