import { UpdatingElement, PropertyDeclaration } from 'lit-element/lib/updating-element.js';

export abstract class MediaQueryClass extends UpdatingElement {
  static mediaQueries: { [key: string]: unknown };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export const MediaQueryMixin = <T extends Constructor<UpdatingElement>>(
  base: T
): T & Constructor<MediaQueryClass> => {
  class MediaQuery extends base {
    static get mediaQueries() {
      return {};
    }

    private static _mediaQueries: { [key: string]: { query: MediaQueryList; prop: string } } = {};

    private _boundQueryHandlers: { [key: string]: () => void } = {};

    /**
     * Extend the LitElement `createProperty` method to map properties to events
     */
    static createProperty(name: PropertyKey, options: PropertyDeclaration) {
      const mq = (this.mediaQueries as { [key: string]: unknown })[name as string];
      const needQuery = typeof mq === 'string';

      // @ts-ignore
      super.createProperty(
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
        this._mediaQueries[mq as string] = { prop, query };
      }
    }

    connectedCallback() {
      super.connectedCallback();

      const queries = MediaQuery._mediaQueries;

      Object.keys(queries).forEach(key => {
        const { query, prop } = queries[key];
        const handler = () => {
          ((this as {}) as { [key: string]: unknown })[prop] = query.matches;
        };
        query.addListener(handler);
        this._boundQueryHandlers[key] = handler;
      });
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      const queries = MediaQuery._mediaQueries;

      Object.keys(queries).forEach(key => {
        const handler = this._boundQueryHandlers[key];
        queries[key].query.removeListener(handler);
        delete this._boundQueryHandlers[key];
      });
    }
  }

  return MediaQuery;
};
