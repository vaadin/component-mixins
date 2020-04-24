import { LitElement } from 'lit-element';
import { Constructor } from '@vaadin/mixin-utils';
import getResizeObserver from './resize-observer-polyfill';
import { ResizableClass } from './resizable-class';

export const ResizableMixin = <T extends Constructor<LitElement>>(
  base: T
): T & Constructor<ResizableClass> => {
  class Resizable extends base {
    protected static _resizeObserver?: ResizeObserver;

    connectedCallback() {
      super.connectedCallback();

      this._initResizeObserver().then(() => {
        const observer = Resizable._resizeObserver;

        if (observer && this.isConnected) {
          observer.observe(this);
        }
      });
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      const observer = Resizable._resizeObserver;
      if (observer) {
        observer.unobserve(this);
      }
    }

    private async _initResizeObserver() {
      const observer = Resizable._resizeObserver;
      if (observer == null) {
        const ResizeObserver = await getResizeObserver();

        // @ts-ignore
        Resizable._resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
          entries.forEach((entry) => {
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
