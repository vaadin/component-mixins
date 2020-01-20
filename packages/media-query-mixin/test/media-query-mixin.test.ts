import { LitElement, html, customElement, property } from 'lit-element';
import { fixture } from '@open-wc/testing-helpers';
import { MediaQueryMixin } from '../media-query-mixin';

const { expect } = chai;

const listeners: { [key: string]: () => void } = {};
const queryMatches: { [key: string]: boolean } = {};

const runQuery = (query: string, matches: boolean) => {
  queryMatches[query] = matches;
  listeners[query] && listeners[query]();
};

const FULLSCREEN = '(max-width: 420px) and (max-heigh: 420px)';
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
  describe('static get mediaQueries', () => {
    @customElement('mq-basic-element')
    class MqBasicElement extends MqElementBase {
      static get mediaQueries() {
        return {
          fullscreen: FULLSCREEN
        };
      }

      @property({ type: Boolean }) fullscreen: boolean | null | undefined;
    }

    let element: MqBasicElement;

    beforeEach(async () => {
      element = await fixture(`<mq-basic-element></mq-basic-element>`);
    });

    it('should set property value to undefined by default', () => {
      expect(element.fullscreen).to.be.undefined;
    });

    it('should set property value to true when query matches', async () => {
      runQuery(FULLSCREEN, true);
      await element.updateComplete;
      expect(element.fullscreen).to.be.true;
    });

    it('should allow to override property value using setAttribute', async () => {
      element.setAttribute('fullscreen', '');
      await element.updateComplete;
      expect(element.fullscreen).to.be.true;
    });

    // TODO
    it.skip('should not discard overridden value on media query change', async () => {
      element.setAttribute('fullscreen', '');
      await element.updateComplete;
      runQuery(FULLSCREEN, false);
      await element.updateComplete;
      expect(element.fullscreen).to.be.true;
    });

    // TODO
    it.skip('should handle media query change after removeAttribute', async () => {
      element.setAttribute('fullscreen', '');
      await element.updateComplete;
      element.removeAttribute('fullscreen');
      await element.updateComplete;
      runQuery(FULLSCREEN, true);
      await element.updateComplete;
      expect(element.fullscreen).to.be.true;
    });
  });

  describe('custom CSS property', () => {
    document.documentElement.style.setProperty('--vaadin-responsive', RESPONSIVE);

    @customElement('mq-custom-element')
    class MqCustomElement extends MqElementBase {
      static get mediaQueries() {
        return {
          responsive: window
            .getComputedStyle(document.documentElement)
            .getPropertyValue('--vaadin-responsive')
            .trim()
        };
      }

      @property({ type: Boolean }) responsive: boolean | null | undefined;
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

  afterEach(() => {
    Object.keys(queryMatches).forEach(key => {
      delete queryMatches[key];
    });
  });

  after(() => {
    window.matchMedia = origMatchMedia;
  });
});
