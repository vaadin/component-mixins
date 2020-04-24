import { LitElement, property } from 'lit-element';
import { PropertyDeclaration } from 'lit-element/lib/updating-element.js';
import { Constructor } from '@vaadin/mixin-utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mediaProperty(opts?: MediaDeclaration): (proto: object, name?: PropertyKey) => any {
  return property(opts as PropertyDeclaration);
}

export interface MediaDeclaration {
  readonly media?: string;
}

export const MediaQueryMixin = <T extends Constructor<LitElement>>(
  base: T
): T & Constructor<LitElement> => {
  class MediaQuery extends base {
    private static _mediaQueries: {
      [prop: string]: { query: MediaQueryList; updating?: boolean };
    } = {};

    private _boundQueries: { [prop: string]: () => void } = {};

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

        // Create custom accessors to disallow external property modifications. See original code at
        // https://github.com/Polymer/lit-element/blob/41e9fd3/src/lib/updating-element.ts#L306-L320
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
            MediaQuery._mediaQueries[prop].updating = false;
          },
          configurable: true,
          enumerable: true
        });
      }
    }

    connectedCallback() {
      super.connectedCallback();

      const queries = MediaQuery._mediaQueries;

      Object.keys(queries).forEach((prop) => {
        const { query } = queries[prop];
        const handler = () => {
          // allow property modification
          queries[prop].updating = true;
          ((this as {}) as { [key: string]: unknown })[prop] = query.matches;
        };

        query.addListener(handler);
        this._boundQueries[prop] = handler;

        // Set default value
        handler();
      });
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      const queries = MediaQuery._mediaQueries;

      Object.keys(queries).forEach((prop) => {
        const { query } = queries[prop];
        const handler = this._boundQueries[prop];
        query.removeListener(handler);
        delete this._boundQueries[prop];
      });
    }
  }

  return MediaQuery;
};
