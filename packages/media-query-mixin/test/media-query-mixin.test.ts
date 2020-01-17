import { LitElement, customElement, html, property } from 'lit-element';
import { fixture } from '@open-wc/testing-helpers';
import { MediaQueryMixin } from '../media-query-mixin';

const { expect } = chai;

const listeners: { [key: string]: () => void } = {};
const queryMatches: { [key: string]: boolean } = {};

const runQuery = (query: string, matches: boolean) => {
  queryMatches[query] = matches;
  listeners[query]();
};

const FULLSCREEN = '(max-width: 420px) and (max-heigh: 420px)';

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

@customElement('mq-element')
class MqElement extends MediaQueryMixin(LitElement) {
  static get mediaQueries() {
    return {
      fullscreen: FULLSCREEN
    };
  }

  @property({ type: Boolean }) fullscreen: boolean | null | undefined;

  render() {
    return html`
      <div part="content">Content</div>
    `;
  }
}

describe('MediaQueryMixin', () => {
  let element: MqElement;

  beforeEach(async () => {
    element = await fixture(`<mq-element></mq-element>`);
  });

  afterEach(() => {
    Object.keys(queryMatches).forEach(key => {
      delete queryMatches[key];
    });
  });

  after(() => {
    window.matchMedia = origMatchMedia;
  });

  it('should set property value to undefined by default', () => {
    expect(element.fullscreen).to.be.undefined;
  });

  it('should set property value to true when query matches', async () => {
    runQuery(FULLSCREEN, true);
    await element.updateComplete;
    expect(element.fullscreen).to.be.true;
  });
});
