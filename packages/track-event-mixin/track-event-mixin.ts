import { LitElement } from 'lit-element';
import { Constructor, applyMixin, wasApplied } from '@vaadin/mixin-utils';
import { TrackEventClass } from './track-event-class';
import { addTrackListeners, removeTrackListeners } from './track-event-gesture';

export const TrackEventMixin = <T extends Constructor<LitElement>>(
  base: T
): T & Constructor<TrackEventClass> => {
  if (wasApplied(TrackEventMixin, base)) {
    return base;
  }

  class TrackEvent extends base {
    protected get _trackTargets() {
      return [this];
    }

    connectedCallback() {
      super.connectedCallback();

      this.updateComplete.then(() => {
        if (Array.isArray(this._trackTargets)) {
          this._trackTargets.forEach((target: Element) => {
            if (target instanceof HTMLElement) {
              addTrackListeners(target);
            }
          });
        }
      });
    }

    disconnectedCallback() {
      super.disconnectedCallback();

      if (Array.isArray(this._trackTargets)) {
        this._trackTargets.forEach((target: Element) => {
          if (target instanceof HTMLElement) {
            removeTrackListeners(target);
          }
        });
      }
    }
  }

  applyMixin(TrackEventMixin, TrackEvent);

  return TrackEvent;
};
