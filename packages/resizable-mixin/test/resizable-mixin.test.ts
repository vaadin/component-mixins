import { LitElement, html, customElement } from 'lit-element';
import { fixture, oneEvent } from '@open-wc/testing-helpers';
import { ResizableClass } from '../resizable-class';
import { ResizableMixin } from '../resizable-mixin';

const { expect } = chai;
const { sinon } = window;

@customElement('rm-element')
class RmElement extends ResizableMixin(LitElement) {
  render() {
    return html`
      <style>
        :host {
          display: block;
          width: 100%;
        }
      </style>
      <div>Content</div>
    `;
  }

  get observer() {
    return (this.constructor as typeof ResizableClass)._resizeObserver as ResizeObserver;
  }
}

describe('ResizableMixin', () => {
  let element: RmElement;
  let parent: HTMLDivElement;

  describe('observing size change', () => {
    beforeEach(async () => {
      parent = await fixture(`
        <div>
          <rm-element></rm-element>
        </div>
      `);
      element = parent.firstElementChild as RmElement;
    });

    it('should dispatch resize event when element size is changed', async () => {
      element.style.width = '100px';
      const event = await oneEvent(element, 'resize');
      expect(event.detail.contentRect.width).to.equal(100);
    });

    it('should dispatch resize event when parent size is changed', async () => {
      parent.style.width = '100px';
      const event = await oneEvent(element, 'resize');
      expect(event.detail.contentRect.width).to.equal(100);
    });
  });

  describe('DOM manipulations', () => {
    let spy: sinon.SinonSpy;

    before(() => {
      spy = sinon.spy(element.observer, 'observe');
    });

    it('should not observe element when immediately removed', async () => {
      element = document.createElement('rm-element') as RmElement;
      document.body.appendChild(element);
      document.body.removeChild(element);
      await Promise.resolve();
      expect(spy).to.not.be.called;
    });

    it('should not observe element when parent is immediately removed', async () => {
      parent = document.createElement('div');
      document.body.appendChild(parent);
      element = document.createElement('rm-element') as RmElement;
      parent.appendChild(element);
      document.body.removeChild(parent);
      await Promise.resolve();
      expect(spy).to.not.be.called;
    });
  });
});
