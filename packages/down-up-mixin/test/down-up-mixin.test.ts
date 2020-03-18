import { LitElement, html, customElement } from 'lit-element';
import { fixture } from '@open-wc/testing-helpers';
import { mousedown, mouseup, touchstart, touchend } from '@vaadin/test-helpers';
import { DownUpMixin } from '../down-up-mixin';

const { expect } = chai;
const { sinon } = window;

@customElement('dum-element')
class DumElement extends DownUpMixin(LitElement) {
  render() {
    return html`
      <div>Content</div>
    `;
  }

  protected _onDown() {
    this.dispatchEvent(new CustomEvent('down'));
  }

  protected _onUp() {
    this.dispatchEvent(new CustomEvent('up'));
  }
}

@customElement('dum-child-element')
class DumChildElement extends DownUpMixin(LitElement) {
  render() {
    return html`
      <div>Content</div>
    `;
  }

  protected get _downUpTarget() {
    return this.renderRoot.querySelector('div');
  }

  protected _onDown() {
    this.dispatchEvent(new CustomEvent('down'));
  }

  protected _onUp() {
    this.dispatchEvent(new CustomEvent('up'));
  }
}

@customElement('dum-multi-element')
class DumMultiElement extends DownUpMixin(DownUpMixin(LitElement)) {
  render() {
    return html`
      <div>Content</div>
    `;
  }

  protected _onDown() {
    this.dispatchEvent(new CustomEvent('down'));
  }

  protected _onUp() {
    this.dispatchEvent(new CustomEvent('up'));
  }
}

describe('DownUpMixin', () => {
  describe('host as target', () => {
    let element: DumElement;
    let spy: sinon.SinonSpy;

    beforeEach(async () => {
      element = await fixture(`<dum-element></dum-element>`);
      spy = sinon.spy();
    });

    it('should call down handler on mousedown', () => {
      element.addEventListener('down', spy);
      mousedown(element);
      expect(spy).to.be.calledOnce;
    });

    it('should call up handler on mouseup after mousedown', () => {
      element.addEventListener('up', spy);
      mousedown(element);
      mouseup(element);
      expect(spy).to.be.calledOnce;
    });

    it('should not call down handler on right button mousedown', () => {
      element.addEventListener('down', spy);
      mousedown(element, 2);
      expect(spy).to.not.be.called;
    });

    it('should not call up handler on mouseup without mousedown', () => {
      element.addEventListener('up', spy);
      mouseup(element);
      expect(spy).to.not.be.called;
    });

    it('should call down handler on touchstart', () => {
      element.addEventListener('down', spy);
      touchstart(element);
      expect(spy).to.be.calledOnce;
    });

    it('should call up handler on touchend after touchstart', () => {
      element.addEventListener('up', spy);
      touchstart(element);
      touchend(element);
      expect(spy).to.be.calledOnce;
    });
  });

  describe('child as target', () => {
    let element: DumChildElement;
    let target: HTMLElement;
    let spy: sinon.SinonSpy;

    beforeEach(async () => {
      element = await fixture(`<dum-child-element></dum-child-element>`);
      target = element.renderRoot.querySelector('div') as HTMLElement;
      spy = sinon.spy();
    });

    it('should call down handler on mousedown', () => {
      element.addEventListener('down', spy);
      mousedown(target);
      expect(spy).to.be.calledOnce;
    });

    it('should call up handler on mouseup after mousedown', () => {
      element.addEventListener('up', spy);
      mousedown(target);
      mouseup(target);
      expect(spy).to.be.calledOnce;
    });

    it('should not call up handler on mouseup without mousedown', () => {
      element.addEventListener('up', spy);
      mouseup(target);
      expect(spy).to.not.be.called;
    });

    it('should call down handler on touchstart', () => {
      element.addEventListener('down', spy);
      touchstart(target);
      expect(spy).to.be.calledOnce;
    });

    it('should call up handler on touchend after touchstart', () => {
      element.addEventListener('up', spy);
      touchstart(target);
      touchend(target);
      expect(spy).to.be.calledOnce;
    });
  });

  describe('multiple applications', () => {
    let element: DumMultiElement;
    let spy: sinon.SinonSpy;

    beforeEach(async () => {
      element = await fixture(`<dum-multi-element></dum-multi->`);
      spy = sinon.spy();
    });

    it('should only call down handler once', () => {
      element.addEventListener('down', spy);
      mousedown(element);
      expect(spy).to.be.calledOnce;
    });

    it('should only call up handler once', () => {
      element.addEventListener('up', spy);
      mousedown(element);
      mouseup(element);
      expect(spy).to.be.calledOnce;
    });
  });
});
