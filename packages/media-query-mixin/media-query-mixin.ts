import { LitElement, property } from 'lit-element';
import { PropertyDeclaration } from 'lit-element/lib/updating-element.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mediaProperty(opts?: MediaDeclaration): (proto: object, name?: PropertyKey) => any {
  return property(opts as PropertyDeclaration);
}

export interface MediaDeclaration {
  readonly media?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

export const MediaQueryMixin = <T extends Constructor<LitElement>>(
  base: T
): T & Constructor<LitElement> => {
  class MediaQuery extends base {
    private static _mediaQueries: {
      [prop: string]: { query: MediaQueryList; updating?: boolean };
    } = {};

    private static _queryProps: Set<string> = new Set();

    private _boundQueries: {
      [prop: string]: { handler: () => void };
    } = {};

    /**
     * Extend the LitElement `createProperty` method to watch media query.
     */
    static createProperty(name: PropertyKey, options: PropertyDeclaration) {
      const { media } = options as MediaDeclaration;
      const prop = name as string;

      const isMediaString = typeof media === 'string';
      const opts = isMediaString
        ? {
            type: Boolean,
            attribute: false,
            noAccessor: true,
            media
          }
        : options;

      ((base as unknown) as typeof LitElement).createProperty(name, opts);

      if (isMediaString) {
        const query = window.matchMedia(media as string);
        this._mediaQueries[prop] = { query };
        this._queryProps.add(prop);

        const key = `__${prop}`;
        Object.defineProperty(this.prototype, prop, {
          get(): boolean | null | undefined {
            return (this as { [key: string]: boolean | null | undefined })[key];
          },
          set(this: MediaQuery, value: boolean | null | undefined) {
            if (MediaQuery._mediaQueries[prop].updating !== true) {
              return;
            }
            const oldValue = ((this as {}) as { [key: string]: unknown })[prop];
            ((this as {}) as { [key: string]: unknown })[key] = value;
            this.requestUpdate(name, oldValue);
          },
          configurable: true,
          enumerable: true
        });
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);

      const { _queryProps: props, _mediaQueries: queries } = MediaQuery;

      props.forEach(prop => {
        const { query } = queries[prop];
        const handler = () => {
          // allow property modification
          queries[prop].updating = true;
          ((this as {}) as { [key: string]: unknown })[prop] = query.matches;

          // disallow property modification
          Promise.resolve().then(() => {
            queries[prop].updating = false;
          });
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
        // Set default value
        handler();
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
