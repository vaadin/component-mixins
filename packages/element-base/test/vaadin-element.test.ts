import { fixture } from '@open-wc/testing-helpers';
import { flush } from '@polymer/polymer/lib/utils/flush.js';
import { html } from 'lit-element';
import { VaadinElement } from '../vaadin-element';

const { expect } = chai;
const { sinon } = window;

declare global {
  interface Window {
    Vaadin: {
      developmentModeCallback: {
        'usage-statistics': () => {};
      };
      registrations: Array<{ is: string }>;
      usageStatsChecker: {
        maybeGatherAndSend: () => {};
      };
    };
  }
}

describe('VaadinElement', () => {
  it('should initialize registrations on global Vaadin namespace', function() {
    expect(window.Vaadin.registrations).to.deep.equal([]);
  });

  it('should store the class entry in registrations once instance created', async () => {
    class VaadinFoo extends VaadinElement {
      static get is() {
        return 'vaadin-foo';
      }
    }
    customElements.define(VaadinFoo.is, VaadinFoo);
    await fixture(
      html`
        <vaadin-foo></vaadin-foo>
      `
    );
    flush();

    expect(window.Vaadin.registrations[0].is).to.equal('vaadin-foo');
  });

  it('should collect usage statistics once per class', async () => {
    const spy = sinon.stub(window.Vaadin.usageStatsChecker, 'maybeGatherAndSend');

    class VaadinBar extends VaadinElement {
      static get is() {
        return 'vaadin-bar';
      }
    }
    customElements.define(VaadinBar.is, VaadinBar);

    await fixture(
      html`
        <vaadin-bar></vaadin-bar>
      `
    );
    flush();
    expect(spy.callCount).to.equal(1);

    await fixture(
      html`
        <vaadin-bar></vaadin-bar>
      `
    );
    flush();
    expect(spy.callCount).to.equal(1);

    class VaadinBaz extends VaadinElement {
      static get is() {
        return 'vaadin-baz';
      }
    }
    customElements.define(VaadinBaz.is, VaadinBaz);
    await fixture(
      html`
        <vaadin-baz></vaadin-baz>
      `
    );
    flush();
    expect(spy.callCount).to.equal(2);
  });
});
