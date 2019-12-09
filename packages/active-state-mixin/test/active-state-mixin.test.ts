import { LitElement, html, customElement } from 'lit-element';
import { fixture } from '@open-wc/testing-helpers';
import {
  arrowDownKeyDown,
  enterKeyDown,
  enterKeyUp,
  mousedown,
  mouseup,
  spaceKeyDown,
  spaceKeyUp,
  touchstart,
  touchend
} from '@vaadin/test-helpers';
import { DisabledStateMixin } from '@vaadin/disabled-state-mixin';
import { ActiveStateMixin } from '../active-state-mixin';

const { expect } = chai;

@customElement('asm-element')
class AsmElement extends ActiveStateMixin(DisabledStateMixin(LitElement)) {
  render() {
    return html`
      <slot></slot>
    `;
  }

  constructor() {
    super();
    this.setAttribute('tabindex', '0');
  }
}

describe('ActiveStateMixin', () => {
  let element: AsmElement;

  beforeEach(async () => {
    element = await fixture(`<asm-element>Content</asm-element>`);
  });

  it('should set active attribute on left button mousedown', () => {
    mousedown(element);
    expect(element.hasAttribute('active')).to.be.true;
  });

  it('should remove active attribute on mouseup', () => {
    mousedown(element);
    mouseup(element);
    expect(element.hasAttribute('active')).to.be.false;
  });

  it('should not set active attribute on right button mousedown', () => {
    mousedown(element, 2);
    expect(element.hasAttribute('active')).to.be.false;
  });

  it('should not set active attribute on mousedown when disabled', async () => {
    element.disabled = true;
    await element.updateComplete;
    mousedown(element);
    expect(element.hasAttribute('active')).to.be.false;
  });

  it('should set active attribute on touchstart', () => {
    touchstart(element);
    expect(element.hasAttribute('active')).to.be.true;
  });

  it('should remove active attribute on touchend', () => {
    touchstart(element);
    touchend(element);
    expect(element.hasAttribute('active')).to.be.false;
  });

  it('should not set active attribute on touchstart when disabled', async () => {
    element.disabled = true;
    await element.updateComplete;
    touchstart(element);
    expect(element.hasAttribute('active')).to.be.false;
  });

  it('should set active attribute on Enter keydown', () => {
    enterKeyDown(element);
    expect(element.hasAttribute('active')).to.be.true;
  });

  it('should remove active attribute on Enter keyup', () => {
    enterKeyDown(element);
    enterKeyUp(element);
    expect(element.hasAttribute('active')).to.be.false;
  });

  it('should set active attribute on Space keydown', () => {
    spaceKeyDown(element);
    expect(element.hasAttribute('active')).to.be.true;
  });

  it('should remove active attribute on Space keyup', () => {
    spaceKeyDown(element);
    spaceKeyUp(element);
    expect(element.hasAttribute('active')).to.be.false;
  });

  it('should not set active attribute on keydown when disabled', async () => {
    element.disabled = true;
    await element.updateComplete;
    enterKeyDown(element);
    expect(element.hasAttribute('active')).to.be.false;
  });

  it('should not set active attribute on arrow keydown', () => {
    arrowDownKeyDown(element);
    expect(element.hasAttribute('active')).to.be.false;
  });

  it('should not set active attribute if keydown was prevented', () => {
    const button = document.createElement('button');
    element.appendChild(button);
    button.addEventListener('keydown', e => {
      e.preventDefault();
    });
    enterKeyDown(button);
    expect(element.hasAttribute('active')).to.be.false;
  });

  it('should remove active attribute when disconnected from the DOM', () => {
    mousedown(element);
    element.parentNode!.removeChild(element); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    expect(element.hasAttribute('active')).to.be.false;
  });
});
