import { registerStyles, css, unsafeCSS } from '@vaadin/vaadin-themable-mixin/register-styles.js';
import { html } from 'lit-element';
import { ThemableLitElement } from '../themable-lit-element';

const { expect } = chai;

let attachedInstances: Array<HTMLElement> = [];
function define(customElementName: string) {
  customElements.define(
    customElementName,
    class extends ThemableLitElement {
      static is = customElementName;

      render() {
        return html`
          ${customElementName}
        `;
      }
    }
  );
}

async function defineAndInstantiate(customElementName: string) {
  define(customElementName);
  const instance = document.createElement(customElementName) as ThemableLitElement;
  document.body.appendChild(instance);
  await instance.updateComplete;
  attachedInstances.push(instance);
  return instance;
}

describe('registerStyles', () => {
  let testId = 0;

  function unique(seed = 'bar') {
    return `foo-${testId}-${seed}`;
  }

  beforeEach(() => {
    testId += 1;
  });

  afterEach(() => {
    attachedInstances.forEach(instance => {
      document.body.removeChild(instance);
    });
    attachedInstances = [];
  });

  it('should add theme for a component', async () => {
    const id = unique();
    registerStyles(
      id,
      css`
        :host {
          color: rgb(255, 0, 0);
        }
      `
    );
    const instance = await defineAndInstantiate(id);
    expect(window.getComputedStyle(instance).color).to.equal('rgb(255, 0, 0)');
  });

  it('should add multiple themes for a component', async () => {
    const id = unique();
    registerStyles(unique(), [
      css`
        :host {
          color: rgb(255, 0, 0);
        }
      `,
      css`
        :host {
          background-color: rgb(0, 255, 0);
        }
      `
    ]);
    const instance = await defineAndInstantiate(id);
    expect(window.getComputedStyle(instance).color).to.equal('rgb(255, 0, 0)');
    expect(window.getComputedStyle(instance).backgroundColor).to.equal('rgb(0, 255, 0)');
  });

  it('should add unsafe css for a component', async () => {
    const id = unique();
    const unsafe = `:host {
      color: rgb(255, 0, 0);
    }`;
    registerStyles(id, unsafeCSS(unsafe));
    const instance = await defineAndInstantiate(id);
    expect(window.getComputedStyle(instance).color).to.equal('rgb(255, 0, 0)');
  });

  it('should interpolate numbers in the template literal', async () => {
    const id = unique();
    const r = 255;
    registerStyles(
      id,

      css`
        :host {
          color: rgb(${r}, 0, 0);
        }
      `
    );
    const instance = await defineAndInstantiate(id);
    expect(window.getComputedStyle(instance).color).to.equal('rgb(255, 0, 0)');
  });
});
