import { LitElement, html, customElement } from 'lit-element';
import { fixture } from '@open-wc/testing-helpers';
import { arrowDown, arrowLeft, arrowRight, arrowUp, end, home } from '@vaadin/test-helpers';
import { SlottedItemsMixin } from '@vaadin/slotted-items-mixin';
import { KeyboardDirectionMixin } from '../keyboard-direction-mixin';

const { expect } = chai;

@customElement('kdm-vertical-element')
class KdmVerticalElement extends KeyboardDirectionMixin(SlottedItemsMixin(LitElement)) {
  render() {
    return html`
      <style>
        :host {
          display: block;
        }

        div {
          display: flex;
          flex-direction: column;
        }
      </style>
      <div>
        <slot></slot>
      </div>
    `;
  }

  protected get _vertical() {
    return true;
  }
}

@customElement('kdm-horizontal-element')
class KdmHorizontalElement extends KeyboardDirectionMixin(SlottedItemsMixin(LitElement)) {
  render() {
    return html`
      <style>
        :host {
          display: block;
        }

        div {
          display: flex;
        }
      </style>
      <div>
        <slot></slot>
      </div>
    `;
  }

  protected get _vertical() {
    return false;
  }
}

describe('KeyboardDirectionMixin', () => {
  describe('horizontal mode', () => {
    let element: KdmHorizontalElement;
    let items: HTMLElement[];

    beforeEach(async () => {
      element = await fixture(html`
        <kdm-horizontal-element>
          <div tabindex="0">Foo</div>
          <div tabindex="0">Bar</div>
          <div disabled tabindex="-1">Bay</div>
          <div tabindex="0">Baz</div>
        </kdm-horizontal-element>
      `);

      element.focus();
      items = element.items;
    });

    describe('default', () => {
      it('should set focused to first item by default', () => {
        expect(element.focused).to.equal(items[0]);
      });

      it('should move focus to next item on "arrow-right" key', () => {
        element.focus();
        arrowRight(element);
        expect(element.focused).to.equal(items[1]);
      });

      it('should move focus to prev item on "arrow-left" key', () => {
        element.focus();
        arrowRight(element);
        arrowLeft(element);
        expect(element.focused).to.equal(items[0]);
      });

      it('should move focus to the last item on "end" key', () => {
        end(element);
        expect(element.focused).to.equal(items[3]);
      });

      it('should move focus to the first item on "home" key', () => {
        end(element);
        home(element);
        expect(element.focused).to.equal(items[0]);
      });

      it('should move focus to the first enabled item on "home" key', () => {
        end(element);
        items[0].setAttribute('disabled', '');
        home(element);
        expect(element.focused).to.equal(items[1]);
      });

      it('should move focus to the closest enabled item on "end" key', () => {
        element.items[3].setAttribute('disabled', '');
        end(element);
        expect(element.focused).to.equal(items[1]);
      });

      it('should ignore and skip items with "disabled" attribute when moving focus', () => {
        arrowRight(element);
        arrowRight(element);
        expect(element.focused).to.equal(items[3]);
      });

      it('should ignore and skip items with "hidden" attribute when moving focus', () => {
        element.items[1].setAttribute('hidden', '');
        arrowRight(element);
        expect(element.focused).to.equal(items[3]);
      });

      it('should not throw when calling focus before element is attached', () => {
        expect(() => {
          document.createElement('kdm-horizontal-element').focus();
        }).to.not.throw(Error);
      });
    });

    describe('RTL mode', () => {
      beforeEach(() => element.setAttribute('dir', 'rtl'));

      it('should move focus to next item on "arrow-left" key', () => {
        element.focus();
        arrowLeft(element);
        expect(element.focused).to.equal(items[1]);
      });

      it('should move focus to prev item on "arrow-right" key', () => {
        element.focus();
        arrowLeft(element);
        arrowRight(element);
        expect(element.focused).to.equal(items[0]);
      });

      it('should move focus to the last item on "home" key', () => {
        home(element);
        expect(element.focused).to.equal(items[3]);
      });

      it('should move focus to the first item on "end" key', () => {
        arrowLeft(element);
        end(element);
        expect(element.focused).to.equal(items[0]);
      });
    });
  });

  describe('vertical mode', () => {
    let element: KdmVerticalElement;
    let items: HTMLElement[];

    beforeEach(async () => {
      element = await fixture(html`
        <kdm-vertical-element>
          <div tabindex="0">Foo</div>
          <div tabindex="0">Bar</div>
          <div disabled tabindex="-1">Bay</div>
          <div tabindex="0">Baz</div>
        </kdm-vertical-element>
      `);

      element.focus();
      items = element.items;
    });

    describe('default', () => {
      it('should not move focus when "ctrl" is pressed on "arrow-down" key', () => {
        arrowDown(element, 'ctrl');
        expect(element.focused).to.equal(items[0]);
      });

      it('should not move focus when "meta" is pressed on "arrow-down" key', () => {
        arrowDown(element, 'meta');
        expect(element.focused).to.equal(items[0]);
      });

      it('should move focus to next item on "arrow-down" key', () => {
        arrowDown(element);
        expect(element.focused).to.equal(items[1]);
      });

      it('should move focus to prev item on "arrow-up" key', () => {
        arrowDown(element);
        arrowUp(element);
        expect(element.focused).to.equal(items[0]);
      });

      it('should move focus to the last item on "end" key', () => {
        end(element);
        expect(element.focused).to.equal(items[3]);
      });

      it('should move focus to the first item on "home" key', () => {
        end(element);
        home(element);
        expect(element.focused).to.equal(items[0]);
      });

      it('should move focus to the first item on "arrow-down" key on the last item', () => {
        end(element);
        arrowDown(element);
        expect(element.focused).to.equal(items[0]);
      });

      it('should move focus to the last item on "arrow-up" key on the first item', () => {
        arrowUp(element);
        expect(element.focused).to.equal(items[3]);
      });
    });

    describe('RTL mode', () => {
      beforeEach(() => element.setAttribute('dir', 'rtl'));

      it('should move focus to next item on "arrow-down" key', () => {
        arrowDown(element);
        expect(element.focused).to.equal(items[1]);
      });

      it('should move focus to prev item on "arrow-up" key', () => {
        arrowDown(element);
        arrowUp(element);
        expect(element.focused).to.equal(items[0]);
      });

      it('should move focus to the first item on "home" key', () => {
        arrowDown(element);
        home(element);
        expect(element.focused).to.equal(items[0]);
      });

      it('should move focus to the last item on "end" key', () => {
        end(element);
        expect(element.focused).to.equal(items[3]);
      });
    });
  });
});
