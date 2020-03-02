import { LitElement, html, customElement } from 'lit-element';
import { fixture, nextFrame } from '@open-wc/testing-helpers';
import { SlottedLabelMixin } from '../slotted-label-mixin';

const { expect } = chai;

@customElement('slm-element')
class SlmElement extends SlottedLabelMixin(LitElement) {
  render() {
    return html`
      <div part="label">
        <slot></slot>
      </div>
    `;
  }
}

describe('SlottedLabelMixin', () => {
  let element: SlmElement;

  describe('empty by default', () => {
    beforeEach(async () => {
      element = await fixture(`<slm-element></slm-element>`);
    });

    it('should set `label-empty` attribute on the host element by default', () => {
      expect(element.hasAttribute('label-empty')).to.be.true;
    });

    it('should keep `label-empty` attribute when adding whitespace text node', async () => {
      const text = document.createTextNode(' ');
      element.appendChild(text);
      await nextFrame();
      expect(element.hasAttribute('label-empty')).to.be.true;
    });

    it('should remove `label-empty` attribute when adding non-empty text node', async () => {
      const text = document.createTextNode('Text');
      element.appendChild(text);
      await nextFrame();
      expect(element.hasAttribute('label-empty')).to.be.false;
    });
  });

  describe('not empty by default', () => {
    beforeEach(async () => {
      element = await fixture(`<slm-element>Text</slm-element>`);
    });

    it('should not set `label-empty` attribute on the host element by default', () => {
      expect(element.hasAttribute('label-empty')).to.be.false;
    });

    it('should set `label-empty` attribute when cleaning textContent for slot', async () => {
      element.textContent = '';
      await nextFrame();
      expect(element.hasAttribute('label-empty')).to.be.true;
    });

    it('should set `label-empty` attribute when leaving whitespace text only', async () => {
      element.textContent = ' ';
      await nextFrame();
      expect(element.hasAttribute('label-empty')).to.be.true;
    });
  });
});
