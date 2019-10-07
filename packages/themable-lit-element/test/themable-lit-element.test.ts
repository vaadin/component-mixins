import { fixture } from '@open-wc/testing-helpers';
import * as Vaadin from '@vaadin/vaadin-themable-mixin/register-styles.js';
import { html, css } from 'lit-element';
import { ThemableLitElement } from '../themable-lit-element';

const { expect } = chai;

const foo = 'lit-foo';
const bar = 'lit-bar';
const baz = 'lit-baz';
const override = 'lit-override';

Vaadin.registerStyles(
  foo,
  Vaadin.css`
    :host {
      display: flex;
    }

    [part="text"] {
      color: rgb(255, 255, 255);
    }
  `
);

Vaadin.registerStyles(
  `${foo} ${bar}`,
  Vaadin.css`
    [part="text"] {
      background-color: rgb(255, 0, 0);
    }
  `
);

Vaadin.registerStyles(
  baz,
  Vaadin.css`
    [part="text"] {
      width: 100px;
    }
  `
);

Vaadin.registerStyles(
  'lit-*a*',
  Vaadin.css`
    [part="text"] {
      position: relative;
    }
  `
);

Vaadin.registerStyles(
  override,
  Vaadin.css`
    :host {
      position: absolute;
    }

    [part="text"] {
      color: rgb(0, 0, 0);
    }
  `,
  { moduleId: 'custom-override-styles-first' }
);

Vaadin.registerStyles(
  override,
  Vaadin.css`
    :host {
      position: relative;
    }
  `,
  { moduleId: 'custom-override-styles-second' }
);

Vaadin.registerStyles(
  override,
  Vaadin.css`
    :host {
      display: flex;
    }
  `,
  { moduleId: 'vaadin-override-styles-first' }
);

Vaadin.registerStyles(
  override,
  Vaadin.css`
    :host {
      display: block;
    }

    [part="text"] {
      color: rgb(255, 255, 255);
      opacity: 1;
      display: block;
    }
  `,
  { moduleId: 'vaadin-override-styles-second' }
);

Vaadin.registerStyles(
  override,
  Vaadin.css`
    [part="text"] {
      color: rgb(255, 0, 0);
      display: inline;
    }
  `,
  { moduleId: 'lumo-override-styles' }
);

Vaadin.registerStyles(
  override,
  Vaadin.css`
    [part="text"] {
      color: rgb(0, 255, 0);
      opacity: 0.5;
    }
  `,
  { moduleId: 'material-override-styles' }
);

class LitFoo extends ThemableLitElement {
  static is = foo;

  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`
      <div part="text" id="text">text</div>
    `;
  }
}

customElements.define(foo, LitFoo);

class LitBar extends ThemableLitElement {
  static is = bar;

  render() {
    return html`
      <div part="text" id="text">text</div>
    `;
  }
}

customElements.define(bar, LitBar);

class LitBaz extends LitBar {
  static is = baz;
}

customElements.define(baz, LitBaz);

class LitOverride extends ThemableLitElement {
  static is = override;

  render() {
    return html`
      <div part="text" id="text">text</div>
    `;
  }
}

customElements.define(override, LitOverride);

describe('ThemableLitElement', () => {
  let wrapper;
  let components: Array<Element> = [];

  const getPart = (idx: number) => {
    return (components[idx] as ThemableLitElement).renderRoot.querySelector('#text') as Element;
  };

  beforeEach(async () => {
    wrapper = await fixture(
      html`
        <div>
          <lit-foo></lit-foo>
          <lit-bar></lit-bar>
          <lit-baz></lit-baz>
          <lit-override></lit-override>
        </div>
      `
    );
    components = Array.from(wrapper.children);
  });

  it('should inject simple module', () => {
    expect(window.getComputedStyle(getPart(0)).color).to.equal('rgb(255, 255, 255)');
  });

  it('should override default value', () => {
    expect(window.getComputedStyle(components[0]).display).to.equal('flex');
  });

  it('should inject multiple style modules', () => {
    expect(window.getComputedStyle(getPart(0)).color).to.equal('rgb(255, 255, 255)');
    expect(window.getComputedStyle(getPart(0)).backgroundColor).to.equal('rgb(255, 0, 0)');
  });

  it('should inject to multiple components', () => {
    expect(window.getComputedStyle(getPart(0)).backgroundColor).to.equal('rgb(255, 0, 0)');
    expect(window.getComputedStyle(getPart(1)).backgroundColor).to.equal('rgb(255, 0, 0)');
  });

  it('should inject to subclassed components', () => {
    expect(window.getComputedStyle(getPart(2)).backgroundColor).to.equal('rgb(255, 0, 0)');
  });

  it('should inject to wildcard styles', () => {
    expect(window.getComputedStyle(getPart(0)).position).to.equal('static');
    expect(window.getComputedStyle(getPart(1)).position).to.equal('relative');
    expect(window.getComputedStyle(getPart(2)).position).to.equal('relative');
  });

  it('should override vaadin module styles', () => {
    expect(window.getComputedStyle(getPart(3)).color).to.equal('rgb(0, 0, 0)');
  });

  it('lumo should override vaadin module styles', () => {
    expect(window.getComputedStyle(getPart(3)).display).to.equal('inline');
  });

  it('material should override vaadin module styles', () => {
    expect(window.getComputedStyle(getPart(3)).opacity).to.equal('0.5');
  });

  it('should override lumo module styles', () => {
    expect(window.getComputedStyle(getPart(3)).color).to.equal('rgb(0, 0, 0)');
  });

  it('should override material module styles', () => {
    expect(window.getComputedStyle(getPart(3)).color).to.equal('rgb(0, 0, 0)');
  });

  it('should respect vaadin style module order', () => {
    expect(window.getComputedStyle(components[3]).display).to.equal('block');
  });

  it('should respect custom style module order', () => {
    expect(window.getComputedStyle(components[3]).position).to.equal('relative');
  });
});
