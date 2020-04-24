import { LitElement, html, customElement } from 'lit-element';
import { fixture } from '@open-wc/testing-helpers';
import { matchMedia, resetMatchMedia, restoreMatchMedia } from '@vaadin/test-helpers';
import { MediaQueryMixin, mediaProperty } from '../media-query-mixin';

const { expect } = chai;

const FULLSCREEN = '(max-width: 420px)';
const RESPONSIVE = '(max-width: 600px)';

class MqElementBase extends MediaQueryMixin(LitElement) {
  render() {
    return html`<div part="content">Content</div>`;
  }
}

describe('MediaQueryMixin', () => {
  describe('mediaProperty decorator', () => {
    @customElement('mq-basic-element')
    class MqBasicElement extends MqElementBase {
      @mediaProperty({ media: FULLSCREEN }) fullscreen: boolean | null | undefined;
    }

    let element: MqBasicElement;

    before(() => {
      matchMedia(FULLSCREEN, true);
    });

    beforeEach(async () => {
      element = await fixture(html`<mq-basic-element></mq-basic-element>`);
    });

    it('should set default property value based on media query', () => {
      expect(element.fullscreen).to.be.true;
    });

    it('should toggle property value when query does not match', async () => {
      matchMedia(FULLSCREEN, false);
      await element.updateComplete;
      expect(element.fullscreen).to.be.false;
    });

    it('should disallow direct property modification attempt', async () => {
      matchMedia(FULLSCREEN, false);
      await element.updateComplete;
      element.fullscreen = true;
      await element.updateComplete;
      expect(element.fullscreen).to.be.false;
    });

    it('should disallow property modification using attribute', async () => {
      matchMedia(FULLSCREEN, false);
      await element.updateComplete;
      element.setAttribute('fullscreen', '');
      await element.updateComplete;
      expect(element.fullscreen).to.be.false;
    });
  });

  describe('custom CSS property', () => {
    document.documentElement.style.setProperty('--vaadin-responsive', RESPONSIVE);

    @customElement('mq-custom-element')
    class MqCustomElement extends MqElementBase {
      @mediaProperty({
        media: window
          .getComputedStyle(document.documentElement)
          .getPropertyValue('--vaadin-responsive')
          .trim()
      })
      responsive: boolean | null | undefined;
    }

    let element: MqCustomElement;

    beforeEach(async () => {
      element = await fixture(html`<mq-custom-element></mq-custom-element>`);
      matchMedia(RESPONSIVE, true);
      await element.updateComplete;
    });

    it('should handle media query set from custom CSS property', () => {
      expect(element.responsive).to.be.true;
    });

    it('should change property value when media query changes', async () => {
      matchMedia(RESPONSIVE, false);
      await element.updateComplete;
      expect(element.responsive).to.be.false;
    });

    it('should not change when custom CSS property value changes', async () => {
      const BREAKPOINT = '(min-width: 768px)';
      document.documentElement.style.setProperty('--vaadin-responsive', BREAKPOINT);
      matchMedia(BREAKPOINT, false);
      await element.updateComplete;
      expect(element.responsive).to.be.true;
    });
  });

  describe('default value', () => {
    @customElement('mq-default-element')
    class MqDefaultElement extends MqElementBase {
      @mediaProperty({ media: FULLSCREEN }) fullscreen: boolean | null | undefined = true;
    }

    let element: MqDefaultElement;

    before(() => {
      matchMedia(FULLSCREEN, false);
    });

    beforeEach(async () => {
      element = await fixture(html`<mq-default-element></mq-default-element>`);
    });

    it('should ignore user-defined default value', () => {
      expect(element.fullscreen).to.be.false;
    });
  });

  afterEach(() => {
    resetMatchMedia();
  });

  after(() => {
    restoreMatchMedia();
  });
});
