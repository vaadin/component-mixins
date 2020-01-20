import { LitElement } from 'lit-element';
import { PropertyDeclaration } from 'lit-element/lib/updating-element.js';
import { MediaQueryClass } from './media-query-class';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export const MediaQueryMixin = <T extends Constructor<LitElement>>(
  base: T
): T & Constructor<MediaQueryClass> => {
  class MediaQuery extends base {
    static get mediaQueries() {
      return {};
    }

    private static _mediaQueries: { [prop: string]: { query: MediaQueryList } } = {};

    private static _queryProps: Set<string> = new Set();

    private _boundQueries: {
      [prop: string]: { handler: () => void; state?: 'attr' | 'query' };
    } = {};

    /**
     * Extend the LitElement `createProperty` method to map properties to events
     */
    static createProperty(name: PropertyKey, options: PropertyDeclaration) {
      const mq = (this.mediaQueries as { [key: string]: unknown })[name as string];
      const needQuery = typeof mq === 'string';

      ((base as unknown) as typeof LitElement).createProperty(
        name,
        options
        /*
        needQuery
          ? {
              ...options,
              noAccessor: true
            }
          : options
        */
      );

      if (needQuery) {
        const query = window.matchMedia(mq as string);
        const prop = name as string;
        this._mediaQueries[prop as string] = { query };
        this._queryProps.add(prop);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);

      const { _queryProps: props, _mediaQueries: queries } = MediaQuery;

      props.forEach(prop => {
        const { query } = queries[prop];
        const handler = () => {
          const { state } = this._boundQueries[prop];
          if (state !== 'attr') {
            this._boundQueries[prop].state = 'query';
            ((this as {}) as { [key: string]: unknown })[prop] = query.matches;
          }
        };
        // Store handlers in constructor to handle default attribute value if set,
        // which can be done in attributeChangedCallback before connectedCallback
        this._boundQueries[prop] = { handler };
      });
    }

    connectedCallback() {
      super.connectedCallback();

      const { _queryProps: props, _mediaQueries: queries } = MediaQuery;

      props.forEach(prop => {
        const { query } = queries[prop];
        const { handler } = this._boundQueries[prop];
        query.addListener(handler);
      });
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      const { _queryProps: props, _mediaQueries: queries } = MediaQuery;

      props.forEach(prop => {
        const { query } = queries[prop];
        const { handler } = this._boundQueries[prop];
        query.removeListener(handler);
        delete this._boundQueries[prop];
      });
    }
  }

  return MediaQuery;
};
