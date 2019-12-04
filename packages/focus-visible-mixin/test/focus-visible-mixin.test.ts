import { LitElement, html, customElement } from 'lit-element';
import { fixture, nextFrame } from '@open-wc/testing-helpers';
import { focusin, focusout, tabKeyDown, tabKeyUp } from '@vaadin/test-helpers';
import { FocusVisibleMixin } from '../focus-visible-mixin';

const { expect } = chai;

@customElement('fvm-element')
class FvmElement extends FocusVisibleMixin(LitElement) {
  render() {
    return html`
      <slot></slot>
    `;
  }
}

describe('FocusVisibleMixin', () => {
  let element: FvmElement;

  describe('autofocus', () => {
    beforeEach(async () => {
      element = await fixture(`<fvm-element autofocus></fvm-element>`);
    });

    it('should have focused and focus-ring set', async () => {
      await nextFrame();
      expect(element.hasAttribute('focused')).to.be.true;
      expect(element.hasAttribute('focus-ring')).to.be.true;
    });
  });

  describe('autofocus & disabled', () => {
    beforeEach(async () => {
      element = await fixture(`<fvm-element autofocus disabled></fvm-element>`);
    });

    it('should not have focused and focus-ring set when disabled ', async () => {
      await nextFrame();
      expect(element.hasAttribute('focused')).to.be.false;
      expect(element.hasAttribute('focus-ring')).to.be.false;
    });
  });

  describe('focused', () => {
    beforeEach(async () => {
      element = await fixture(`<fvm-element></fvm-element>`);
    });

    it('should set focused attribute on focusin event dispatched', () => {
      focusin(element);
      expect(element.hasAttribute('focused')).to.be.true;
    });

    it('should remove focused attribute on focusout event dispatched', () => {
      focusin(element);
      focusout(element);
      expect(element.hasAttribute('focused')).to.be.false;
    });

    it('should remove focused attribute when disconnected from the DOM', () => {
      focusin(element);
      element.parentNode!.removeChild(element); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      expect(element.hasAttribute('focused')).to.be.false;
    });
  });

  describe('focus-ring', () => {
    beforeEach(async () => {
      element = await fixture(`<fvm-element></fvm-element>`);
    });

    it('should set the focus-ring attribute when Tab is pressed and focus is received', () => {
      tabKeyDown(document.body);
      focusin(element);
      tabKeyUp(document.body);
      expect(element.hasAttribute('focus-ring')).to.be.true;
      focusout(element);
      expect(element.hasAttribute('focus-ring')).to.be.false;
    });

    it('should set the focus-ring attribute when Shift + Tab is pressed and focus is received', () => {
      tabKeyDown(document.body, 'shift');
      focusin(element);
      expect(element.hasAttribute('focus-ring')).to.be.true;
      focusout(element);
      expect(element.hasAttribute('focus-ring')).to.be.false;
    });

    it('should not set the focus-ring attribute when mousedown happens after keydown', () => {
      tabKeyDown(document.body);
      document.body.dispatchEvent(new MouseEvent('mousedown'));
      focusin(element);
      expect(element.hasAttribute('focus-ring')).to.be.false;
    });
  });
});
