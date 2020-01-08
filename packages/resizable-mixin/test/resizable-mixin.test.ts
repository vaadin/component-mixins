import { LitElement, html, customElement } from 'lit-element';
import { fixture, oneEvent } from '@open-wc/testing-helpers';
import { ResizableMixin } from '../resizable-mixin';

const { expect } = chai;

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
}

describe('ResizableMixin', () => {
  let element: RmElement;
  let parent: HTMLDivElement;

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
