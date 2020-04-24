import { LitElement, html, property, customElement, PropertyValues } from 'lit-element';
import { isIOS } from '@vaadin/browser-utils';
import { Constructor } from '@vaadin/mixin-utils';
import { fixture } from '@open-wc/testing-helpers';
import { TrackEventClass } from '../track-event-class';
import { TrackEventMixin } from '../track-event-mixin';

const { expect } = chai;

class FakeMouseEvent extends Event {
  clientX = 0;

  clientY = 0;

  button?: number;

  buttons?: number;
}

class FakeTouchEvent extends Event {
  clientX = 0;

  clientY = 0;

  touches?: Array<{ clientX: number; clientY: number; identifier: number }>;

  changedTouches?: Array<{ clientX: number; clientY: number; identifier: number }>;
}

const makeTouch = (type: string, clientX: number, clientY: number) => {
  const event = new FakeTouchEvent(type, { bubbles: true, composed: true });
  event.clientX = clientX;
  event.clientY = clientY;
  const touches = [
    {
      clientX,
      clientY,
      identifier: 1
    }
  ];
  event.touches = touches;
  event.changedTouches = touches;
  return event;
};

@customElement('tem-element')
class TemElement extends TrackEventMixin(LitElement) {
  @property({ attribute: false }) stream: Array<Event | CustomEvent> = [];

  render() {
    return html`<div>Content</div>`;
  }

  firstUpdated(props: PropertyValues) {
    super.firstUpdated(props);

    this.addEventListener('mousedown', (event: Event) => {
      this.stream.push(event);
    });

    this.addEventListener('touchstart', (event: Event) => {
      this.stream.push(event);
    });

    this.addEventListener('mouseup', (event: Event) => {
      this.stream.push(event);
    });

    this.addEventListener('touchend', (event: Event) => {
      this.stream.push(event);
    });

    this.addEventListener('track', (event: CustomEvent) => {
      this.stream.push(event);
    });
  }
}

describe('TrackEventMixin', () => {
  const expectEvents = (stream: Array<Event | CustomEvent>, types: string[]) => {
    for (let i = 0; i < stream.length; i += 1) {
      if (stream[i].type === 'track') {
        expect(stream[i]).to.have.property('detail').that.has.property('state').equal(types[i]);
      } else {
        expect(stream[i].type).to.equal(types[i]);
      }
    }
  };

  (isIOS ? describe.skip : describe)('mouse', () => {
    let element: TemElement;

    beforeEach(async () => {
      element = await fixture(`<tem-element></tem-element>`);
    });

    it('should dispatch track event using mouse events', () => {
      const options = { bubbles: true, composed: true };

      const down = new FakeMouseEvent('mousedown', options);
      down.clientX = 0;
      down.clientY = 0;
      element.dispatchEvent(down);

      for (let i = 0; i < 4; i += 1) {
        const move = new FakeMouseEvent('mousemove', options);
        move.clientX = 10 * i;
        move.clientY = 10 * i;
        element.dispatchEvent(move);
      }

      element.dispatchEvent(new CustomEvent('mouseup', options));

      expect(element.stream.length).to.equal(6);
      expectEvents(element.stream, ['mousedown', 'start', 'track', 'track', 'mouseup', 'end']);
    });

    it('should not dispatch track event on not left button mousedown', () => {
      const options = { bubbles: true, composed: true };

      const down = new FakeMouseEvent('mousedown', options);
      down.clientX = 0;
      down.clientY = 0;
      down.button = 1;
      element.dispatchEvent(down);

      for (let i = 0; i < 3; i += 1) {
        const move = new FakeMouseEvent('mousemove', options);
        move.clientX = 10 * i;
        move.clientY = 10 * i;
        element.dispatchEvent(move);
      }

      element.dispatchEvent(new CustomEvent('mouseup', options));

      expect(element.stream.length).to.equal(2);
      expectEvents(element.stream, ['mousedown', 'mouseup']);
    });

    it('should stop track event on not left button mousemove', () => {
      const options = { bubbles: true, composed: true };

      const down = new FakeMouseEvent('mousedown', options);
      down.clientX = 0;
      down.clientY = 0;
      element.dispatchEvent(down);

      for (let i = 0; i < 4; i += 1) {
        const move = new FakeMouseEvent('mousemove', options);
        move.clientX = 10 * i;
        move.clientY = 10 * i;
        // Left button until last move
        move.buttons = i === 3 ? 2 : 1;
        element.dispatchEvent(move);
      }

      element.dispatchEvent(new CustomEvent('mouseup', options));

      expect(element.stream.length).to.equal(5);
      expectEvents(element.stream, ['mousedown', 'start', 'track', 'end', 'mouseup']);
    });

    it('should not dispatch track event if mouse has not moved enough', () => {
      const options = { bubbles: true, composed: true };

      const down = new FakeMouseEvent('mousedown', options);
      down.clientX = 0;
      down.clientY = 0;
      element.dispatchEvent(down);

      const move = new FakeMouseEvent('mousemove', options);
      move.clientX = 1;
      move.clientY = 1;
      element.dispatchEvent(move);

      element.dispatchEvent(new CustomEvent('mouseup', options));

      expect(element.stream.length).to.equal(2);
      expectEvents(element.stream, ['mousedown', 'mouseup']);
    });
  });

  describe('touch', () => {
    let element: TemElement;

    beforeEach(async () => {
      element = await fixture(`<tem-element></tem-element>`);
    });

    it('should dispatch track event using touch events', () => {
      const rect = element.getBoundingClientRect();
      let clientX = rect.left + rect.width / 2;
      const clientY = rect.top + rect.bottom / 2;
      element.dispatchEvent(makeTouch('touchstart', clientX, clientY));

      for (let i = 0; i < 4; i += 1) {
        clientX += 10;
        const type = i === 3 ? 'touchend' : 'touchmove';
        element.dispatchEvent(makeTouch(type, clientX, clientY));
      }

      expect(element.stream.length).to.equal(6);
      expectEvents(element.stream, ['touchstart', 'start', 'track', 'track', 'touchend', 'end']);
    });

    it('should not dispatch track event if touch has not moved enough', () => {
      const rect = element.getBoundingClientRect();
      let clientX = rect.left + rect.width / 2;
      const clientY = rect.top + rect.bottom / 2;
      element.dispatchEvent(makeTouch('touchstart', clientX, clientY));

      for (let i = 0; i < 2; i += 1) {
        clientX += 1;
        const type = i === 1 ? 'touchend' : 'touchmove';
        element.dispatchEvent(makeTouch(type, clientX, clientY));
      }

      expect(element.stream.length).to.equal(2);
      expectEvents(element.stream, ['touchstart', 'touchend']);
    });
  });

  describe('re-attaching', () => {
    let element: TemElement;

    beforeEach(async () => {
      element = document.createElement('tem-element') as TemElement;
      document.body.appendChild(element);
      await element.updateComplete;
    });

    afterEach(() => {
      document.body.removeChild(element);
    });

    it('should dispatch track event after re-attached', async () => {
      document.body.removeChild(element);
      document.body.appendChild(element);
      await element.updateComplete;

      const rect = element.getBoundingClientRect();
      let clientX = rect.left + rect.width / 2;
      const clientY = rect.top + rect.bottom / 2;
      element.dispatchEvent(makeTouch('touchstart', clientX, clientY));

      for (let i = 0; i < 4; i += 1) {
        clientX += 10;
        const type = i === 3 ? 'touchend' : 'touchmove';
        element.dispatchEvent(makeTouch(type, clientX, clientY));
      }

      expect(element.stream.length).to.equal(6);
      expectEvents(element.stream, ['touchstart', 'start', 'track', 'track', 'touchend', 'end']);
    });
  });

  describe('multiple applications', () => {
    const TrackMixinA = <T extends Constructor<LitElement>>(
      base: T
    ): T & Constructor<TrackEventClass> => {
      class TrackA extends TrackEventMixin(base) {
        protected get _trackTargets() {
          const superTargets = super._trackTargets || [];
          return [...superTargets, this.renderRoot.querySelector('#a') as Element];
        }
      }
      return TrackA;
    };

    const TrackMixinB = <T extends Constructor<LitElement>>(
      base: T
    ): T & Constructor<TrackEventClass> => {
      class TrackA extends TrackEventMixin(base) {
        protected get _trackTargets() {
          const superTargets = super._trackTargets || [];
          return [...superTargets, this.renderRoot.querySelector('#b') as Element];
        }
      }
      return TrackA;
    };

    @customElement('tem-multi-element')
    class TemMultiElement extends TrackMixinA(TrackMixinB(LitElement)) {
      @property({ attribute: false }) stream: Array<CustomEvent> = [];

      render() {
        return html`
          <div id="a" @track="${this.handle}">Content A</div>
          <div id="b" @track="${this.handle}">Content B</div>
        `;
      }

      protected get _trackTargets(): Element[] {
        return (super._trackTargets || []).filter((target) => target !== this);
      }

      protected handle(event: CustomEvent) {
        this.stream.push(event);
      }
    }

    let element: TemMultiElement;
    let targetA: HTMLElement;
    let targetB: HTMLElement;

    beforeEach(async () => {
      element = await fixture(`<tem-multi-element></tem-multi-element>`);
      targetA = element.renderRoot.querySelector('#a') as HTMLElement;
      targetB = element.renderRoot.querySelector('#b') as HTMLElement;
    });

    it('should dispatch track for all the registered targets', () => {
      const rectA = targetA.getBoundingClientRect();
      let clientX = rectA.left + rectA.width / 2;
      let clientY = rectA.top + rectA.bottom / 2;
      targetA.dispatchEvent(makeTouch('touchstart', clientX, clientY));

      for (let i = 0; i < 3; i += 1) {
        clientX += 10;
        const type = i === 2 ? 'touchend' : 'touchmove';
        targetA.dispatchEvent(makeTouch(type, clientX, clientY));
      }

      const rectB = targetB.getBoundingClientRect();
      clientX = rectB.left + rectB.width / 2;
      clientY = rectB.top + rectB.bottom / 2;
      targetB.dispatchEvent(makeTouch('touchstart', clientX, clientY));

      for (let i = 0; i < 3; i += 1) {
        clientX += 10;
        const type = i === 2 ? 'touchend' : 'touchmove';
        targetB.dispatchEvent(makeTouch(type, clientX, clientY));
      }

      expect(element.stream.length).to.equal(6);
      expectEvents(element.stream, ['start', 'track', 'end', 'start', 'track', 'end']);
    });
  });
});
