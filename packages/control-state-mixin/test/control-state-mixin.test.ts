import { LitElement, html, customElement } from 'lit-element';
import { focusin, focusout, makeKeydownEvent, tabKeyDown } from '@vaadin/test-helpers';
import { fixture, nextFrame, aTimeout } from '@open-wc/testing-helpers';
import { DisabledStateMixin } from '@vaadin/disabled-state-mixin';
import { FocusVisibleMixin } from '@vaadin/focus-visible-mixin';
import { ControlStateMixin } from '../control-state-mixin';

const { expect } = chai;
const { sinon } = window;

@customElement('csm-element')
class CsmElement extends ControlStateMixin(DisabledStateMixin(FocusVisibleMixin(LitElement))) {
  render() {
    return html`<input id="input" /><input id="secondInput" />`;
  }

  get focusElement() {
    return this.renderRoot.querySelector('#input') as HTMLInputElement;
  }
}

describe('ControlStateMixin', () => {
  let element: CsmElement;
  let focusable: HTMLInputElement;

  beforeEach(async () => {
    element = await fixture(html`<csm-element></csm-element>`);
    focusable = element.focusElement;
  });

  describe('tabindex', () => {
    it('should forward tabIndex to the internal focusable element', async () => {
      element.tabIndex = 1;
      await element.updateComplete;
      expect(focusable.getAttribute('tabindex')).to.be.equal('1');
    });

    it('should set tabindex to 0 by default', () => {
      expect(element.getAttribute('tabindex')).to.be.equal('0');
    });

    it('should update the attribute when setting tabIndex property', async () => {
      element.tabIndex = 1;
      await element.updateComplete;
      expect(element.getAttribute('tabindex')).to.be.equal('1');
    });

    it('should restore old tabindex when enabling the element', async () => {
      element.tabIndex = 1;
      element.disabled = true;
      await element.updateComplete;
      expect(element.getAttribute('tabindex')).to.equal(null);

      element.disabled = false;
      await element.updateComplete;
      expect(element.getAttribute('tabindex')).to.be.equal('1');
    });

    it('should remove tabindex when disabled is set to true', async () => {
      element.tabIndex = 1;
      element.disabled = true;
      await element.updateComplete;
      expect(element.getAttribute('tabindex')).to.equal(null);
    });

    it('should restore old tabIndex when disabled is set to true and then back to false', async () => {
      element.tabIndex = 2;
      element.disabled = true;
      await element.updateComplete;
      expect(element.getAttribute('tabindex')).to.equal(null);

      element.disabled = false;
      await element.updateComplete;
      expect(element.getAttribute('tabindex')).to.be.equal('2');
    });
  });

  describe('disabled', () => {
    beforeEach(async () => {
      element.disabled = true;
      await element.updateComplete;
    });

    it('should not set tabindex if disabled when first update completed', () => {
      expect(element.getAttribute('tabindex')).to.equal(null);
    });

    it('should set focus element tabindex to -1 when disabled on first update completed', () => {
      expect(focusable.getAttribute('tabindex')).to.equal('-1');
    });

    it('should update focus element tabIndex while element is disabled', async () => {
      element.tabIndex = 4;
      await element.updateComplete;
      expect(element.getAttribute('tabindex')).to.equal(null);
      expect(focusable.getAttribute('tabindex')).to.be.equal('4');
    });

    it('should restore tabIndex value changed while disabled once element is enabled', async () => {
      element.tabIndex = 3;
      await element.updateComplete;
      expect(element.getAttribute('tabindex')).to.equal(null);

      element.disabled = false;
      await element.updateComplete;
      expect(element.getAttribute('tabindex')).to.be.equal('3');
    });
  });

  describe('focused', () => {
    it('should not set focused attribute on focusin event dispatched when disabled', () => {
      element.disabled = true;
      focusin(focusable);
      expect(element.hasAttribute('focused')).to.be.false;
    });

    it('should not set focused attribute on focusin event dispatched from other focusable element inside component', () => {
      const secondFocusable = element.renderRoot.querySelector('#secondInput') as HTMLInputElement;
      focusin(secondFocusable);
      expect(element.hasAttribute('focused')).to.be.false;
    });

    it('should remove focused attribute when pressing Shift + Tab', () => {
      focusin(focusable);
      const event = makeKeydownEvent(9, 'shift');
      element.dispatchEvent(event);
      expect(element.hasAttribute('focused')).to.be.false;
    });

    it('should not remove focused attribute on Shift + Tab if event is prevented', () => {
      focusin(focusable);
      const event = makeKeydownEvent(9, 'shift');
      // In Edge just calling preventDefault() does not work because of the polyfilled dispatchEvent
      Object.defineProperty(event, 'defaultPrevented', {
        get() {
          return true;
        }
      });
      element.dispatchEvent(event);
      expect(element.hasAttribute('focused')).to.be.true;
    });
  });

  describe('focus()', () => {
    it('should not throw an error when using focus() to a newly created element', () => {
      expect(() => document.createElement('csm-element').focus()).to.not.throw(Error);
    });

    it('should invoke focus on the focus element', () => {
      const spy = sinon.spy(focusable, 'focus');
      element.focus();
      expect(spy.callCount).to.equal(1);
    });

    it('should not invoke focus on the focus element when disabled', async () => {
      element.disabled = true;
      await element.updateComplete;
      const spy = sinon.spy(focusable, 'focus');
      element.focus();
      expect(spy.callCount).to.equal(0);
    });

    it('should refocus the field', async () => {
      element.dispatchEvent(new CustomEvent('focusin'));
      tabKeyDown(document.body, 'shift');

      // Shift + Tab disables refocusing temporarily, normal behavior is restored asynchronously.
      await aTimeout(0);
      const spy = sinon.spy(focusable, 'focus');
      element.dispatchEvent(new CustomEvent('focusin'));
      expect(spy.called).to.be.true;
    });
  });
});

describe('autofocus', () => {
  let element: CsmElement;
  let focusable: HTMLInputElement;

  beforeEach(async () => {
    element = await fixture(html`<csm-element autofocus></csm-element>`);
    focusable = element.focusElement;
  });

  it('should focus the internal focus element on autofocus', async () => {
    const spy = sinon.spy(focusable, 'focus');
    await nextFrame();
    expect(spy).to.be.calledOnce;
  });
});

describe('focused with nested focusable elements', () => {
  @customElement('csm-wrapper')
  class CsmWrapper extends ControlStateMixin(DisabledStateMixin(FocusVisibleMixin(LitElement))) {
    render() {
      return html` <csm-element id="testElement"></csm-element> `;
    }

    get focusElement() {
      return this.renderRoot.querySelector('#testElement') as CsmElement;
    }
  }

  let wrapper: CsmWrapper;
  let element: CsmElement;
  let focusable: HTMLInputElement;

  beforeEach(async () => {
    wrapper = await fixture(html`<csm-wrapper></csm-wrapper>`);
    element = wrapper.focusElement;
    await element.updateComplete;
    focusable = element.focusElement;
  });

  it('should set focused attribute on focusin event dispatched from an element inside focusElement', () => {
    focusin(focusable);
    expect(wrapper.hasAttribute('focused')).to.be.true;
  });

  it('should remove focused attribute on focusout event dispatched from an element inside focusElement', () => {
    focusin(focusable);
    expect(wrapper.hasAttribute('focused')).to.be.true;

    focusout(focusable);
    expect(wrapper.hasAttribute('focused')).to.be.false;
  });
});
