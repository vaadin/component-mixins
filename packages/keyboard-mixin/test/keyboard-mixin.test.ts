import { LitElement, customElement, html } from 'lit-element';
import { fixture } from '@open-wc/testing-helpers';
import { enterKeyDown, enterKeyUp } from '@vaadin/test-helpers';
import { KeyboardMixin } from '../keyboard-mixin';

const { expect } = chai;
const { sinon } = window;

const Base = KeyboardMixin(LitElement);

@customElement('km-element')
class KmElement extends KeyboardMixin(Base) {
  render() {
    return html`
      Content
    `;
  }

  constructor() {
    super();
    this.setAttribute('tabindex', '0');
  }

  protected _onKeyDown(_event: KeyboardEvent) {
    this.dispatchEvent(new CustomEvent('keydown-fired'));
  }

  protected _onKeyUp(_event: KeyboardEvent) {
    this.dispatchEvent(new CustomEvent('keyup-fired'));
  }
}

describe('KeyboardMixin', () => {
  let element: KmElement;

  beforeEach(async () => {
    element = await fixture(`<km-element></km-element>`);
  });

  it('should only invoke keydown event handler once', () => {
    const spy = sinon.spy();
    element.addEventListener('keydown-fired', spy);
    enterKeyDown(element);
    expect(spy).to.be.calledOnce;
  });

  it('should only invoke keyup event handler once', () => {
    const spy = sinon.spy();
    element.addEventListener('keyup-fired', spy);
    enterKeyUp(element);
    expect(spy).to.be.calledOnce;
  });
});
