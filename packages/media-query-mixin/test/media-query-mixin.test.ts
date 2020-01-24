import { LitElement, html, customElement } from 'lit-element';
import { fixture } from '@open-wc/testing-helpers';
import { MediaQueryMixin, mediaProperty } from '../media-query-mixin';

const { expect } = chai;

const listeners: { [key: string]: () => void } = {};
const queryMatches: { [key: string]: boolean } = {};

const runQuery = (query: string, matches: boolean) => {
  queryMatches[query] = matches;
  listeners[query] && listeners[query]();
};

const FULLSCREEN = '(max-width: 420px)';
const RESPONSIVE = '(max-width: 600px)';

const origMatchMedia = window.matchMedia;
window.matchMedia = (query: string) => {
  return {
    get matches() {
      return queryMatches[query] as boolean;
    },
    addListener(listener: () => void) {
      listeners[query] = listener;
    },
    removeListener(_listener) {
      delete listeners[query];
    }
  } as MediaQueryList;
};

class MqElementBase extends MediaQueryMixin(LitElement) {
  render() {
    return html`
      <div part="content">Content</div>
    `;
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
      runQuery(FULLSCREEN, true);
    });

    beforeEach(async () => {
      element = await fixture(`<mq-basic-element></mq-basic-element>`);
    });

    it('should set default property value based on media query', () => {
      expect(element.fullscreen).to.be.true;
    });

    it('should toggle property value when query does not match', async () => {
      runQuery(FULLSCREEN, false);
      await element.updateComplete;
      expect(element.fullscreen).to.be.false;
    });

    it('should disallow direct property modification attempt', async () => {
      runQuery(FULLSCREEN, false);
      await element.updateComplete;
      element.fullscreen = true;
      await element.updateComplete;
      expect(element.fullscreen).to.be.false;
    });

    it('should disallow property modification using attribute', async () => {
      runQuery(FULLSCREEN, false);
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
      element = await fixture(`<mq-custom-element></mq-custom-element>`);
      runQuery(RESPONSIVE, true);
      await element.updateComplete;
    });

    it('should handle media query set from custom CSS property', () => {
      expect(element.responsive).to.be.true;
    });

    it('should change property value when media query changes', async () => {
      runQuery(RESPONSIVE, false);
      await element.updateComplete;
      expect(element.responsive).to.be.false;
    });

    it('should not change when custom CSS property value changes', async () => {
      const BREAKPOINT = '(min-width: 768px)';
      document.documentElement.style.setProperty('--vaadin-responsive', BREAKPOINT);
      runQuery(BREAKPOINT, false);
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
      runQuery(FULLSCREEN, false);
    });

    beforeEach(async () => {
      element = await fixture(`<mq-default-element></mq-default-element>`);
    });

    it('should ignore user-defined default value', () => {
      expect(element.fullscreen).to.be.false;
    });
  });

  afterEach(() => {
    Object.keys(queryMatches).forEach(key => {
      delete queryMatches[key];
    });
  });

  after(() => {
    window.matchMedia = origMatchMedia;
  });
});
