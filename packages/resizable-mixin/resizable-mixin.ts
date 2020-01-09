import { LitElement } from 'lit-element';
import getResizeObserver from './resize-observer-polyfill';
import { ResizableClass } from './resizable-class';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

const resizables = new Set();

export const ResizableMixin = <T extends Constructor<LitElement>>(
  base: T
): T & Constructor<ResizableClass> => {
  class Resizable extends base {
    protected static _resizeObserver?: ResizeObserver;

    connectedCallback() {
      super.connectedCallback();

      resizables.add(this);

      this._initResizeObserver().then(() => {
        const observer = Resizable._resizeObserver;
        observer && observer.observe(this);
        resizables.add(this);
      });
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      const observer = Resizable._resizeObserver;
      if (observer) {
        observer.unobserve(this);
        resizables.delete(this);

        if (resizables.size === 0) {
          observer.disconnect();
        }
      }
    }

    private async _initResizeObserver() {
      const observer = Resizable._resizeObserver;
      if (observer == null) {
        const ResizeObserver = await getResizeObserver();

        // @ts-ignore
        Resizable._resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
          entries.forEach(entry => {
            (entry.target as Resizable)._sizeChanged(entry.contentRect as DOMRect);
          });
        });
      }
    }

    protected _sizeChanged(contentRect: DOMRect) {
      this.dispatchEvent(
        new CustomEvent('resize', {
          detail: {
            contentRect
          }
        })
      );
    }
  }

  return Resizable;
};
