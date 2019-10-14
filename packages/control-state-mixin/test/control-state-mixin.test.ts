import { LitElement, html, customElement } from 'lit-element';
import {
  focusin,
  focusout,
  makeShiftTabEvent,
  shiftTabDown,
  tabDown,
  tabUp
} from '@vaadin/test-helpers';
import { fixture, nextFrame } from '@open-wc/testing-helpers';
import { ControlStateMixin } from '../control-state-mixin';

const { expect } = chai;
const { sinon } = window;

@customElement('csm-test-element')
class CsmTestElement extends ControlStateMixin(LitElement) {
  render() {
    return html`
      <input id="input" /><input id="secondInput" />
    `;
  }

  get focusElement() {
    return this.renderRoot.querySelector('#input') as HTMLInputElement;
  }
}

describe('control-state-mixin', () => {
  let element: CsmTestElement;
  let focusable: HTMLInputElement;

  beforeEach(async () => {
    element = (await fixture(`<csm-test-element></csm-test-element>`)) as CsmTestElement;
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

  describe('focus-ring', () => {
    it('should set the focus-ring attribute when TAB is pressed and focus is received', () => {
      tabDown(document.body);
      focusin(focusable);
      tabUp(document.body);
      expect(element.hasAttribute('focus-ring')).to.be.true;
      focusout(focusable);
      expect(element.hasAttribute('focus-ring')).to.be.false;
    });

    it('should set the focus-ring attribute when SHIFT+TAB is pressed and focus is received', () => {
      shiftTabDown(document.body);
      focusin(focusable);
      expect(element.hasAttribute('focus-ring')).to.be.true;
      focusout(focusable);
      expect(element.hasAttribute('focus-ring')).to.be.false;
    });

    it('should refocus the field', done => {
      element.dispatchEvent(new CustomEvent('focusin'));
      shiftTabDown(document.body);

      // Shift + Tab disables refocusing temporarily, normal behavior is restored asynchronously.
      setTimeout(() => {
        const spy = sinon.spy(focusable, 'focus');
        element.dispatchEvent(new CustomEvent('focusin'));
        expect(spy.called).to.be.true;
        done();
      }, 0);
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

    it('should update internal element tabIndex', async () => {
      element.tabIndex = 4;
      await element.updateComplete;
      expect(element.getAttribute('tabindex')).to.equal(null);
      expect(focusable.getAttribute('tabindex')).to.be.equal('4');
    });

    it('should have aria-disabled attribute set to true when disabled', async () => {
      expect(element.getAttribute('aria-disabled')).to.be.equal('true');
    });

    it('should not have aria-disabled attribute when is not disabled', async () => {
      element.disabled = false;
      await element.updateComplete;
      expect(element.getAttribute('aria-disabled')).to.not.be.ok;
    });

    it('should apply tabindex value, changed while element was disabled, once it is enabled', async () => {
      element.tabIndex = 3;
      await element.updateComplete;
      expect(element.getAttribute('tabindex')).to.equal(null);

      element.disabled = false;
      await element.updateComplete;
      expect(element.getAttribute('tabindex')).to.be.equal('3');
    });
  });

  describe('focused', () => {
    it('should not set focused attribute on host click', () => {
      element.click();
      expect(element.hasAttribute('focused')).to.be.false;
    });

    it('should set focused attribute on focusin event dispatched', () => {
      focusin(focusable);
      expect(element.hasAttribute('focused')).to.be.true;
    });

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

    it('should remove focused attribute when disconnected from the DOM', () => {
      focusin(focusable);
      element.parentNode!.removeChild(element); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      expect(element.hasAttribute('focused')).to.be.false;
    });

    it('should remove focused attribute when pressing Shift + Tab', () => {
      focusin(focusable);
      const event = makeShiftTabEvent();
      element.dispatchEvent(event);
      expect(element.hasAttribute('focused')).to.be.false;
    });

    it('should not remove focused attribute on Shift + Tab if event is prevented', () => {
      focusin(focusable);
      const event = makeShiftTabEvent();
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
      expect(() => document.createElement('csm-test-element').focus()).to.not.throw(Error);
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
  });

  describe('click()', () => {
    it('should fire click event for element', () => {
      const spy = sinon.spy();
      element.addEventListener('click', spy);
      element.click();
      expect(spy.called).to.be.true;
    });

    it('should not fire click event for disabled element', async () => {
      element.disabled = true;
      await element.updateComplete;
      const spy = sinon.spy();
      element.addEventListener('click', spy);
      element.click();
      expect(spy.called).to.be.false;
    });
  });
});

describe('autofocus', () => {
  let element: CsmTestElement;

  beforeEach(async () => {
    element = (await fixture(`<csm-test-element autofocus></csm-test-element>`)) as CsmTestElement;
  });

  it('should have focused and focus-ring set', async () => {
    await nextFrame();
    expect(element.hasAttribute('focused')).to.be.true;
    expect(element.hasAttribute('focus-ring')).to.be.true;
  });
});

describe('focused with nested focusable elements', () => {
  @customElement('csm-wrapper-element')
  class CsmWrapperElement extends ControlStateMixin(LitElement) {
    render() {
      return html`
        <csm-test-element id="testElement"></csm-test-element>
      `;
    }

    get focusElement() {
      return this.renderRoot.querySelector('#testElement') as CsmTestElement;
    }
  }

  let wrapper: CsmWrapperElement;
  let element: CsmTestElement;
  let focusable: HTMLInputElement;

  beforeEach(async () => {
    wrapper = (await fixture(`<csm-wrapper-element></csm-wrapper-element>`)) as CsmWrapperElement;
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
