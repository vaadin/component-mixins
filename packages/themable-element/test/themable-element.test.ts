import { fixture } from '@open-wc/testing-helpers';
import { registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles.js';
import { html, css } from 'lit-element';
import { ThemableElement } from '../themable-element';

const { expect } = chai;

const foo = 'lit-foo';
const bar = 'lit-bar';
const baz = 'lit-baz';
const override = 'lit-override';

registerStyles(
  foo,
  css`
    :host {
      display: flex;
    }

    [part='text'] {
      color: rgb(255, 255, 255);
    }
  `
);

registerStyles(
  `${foo} ${bar}`,
  css`
    [part='text'] {
      background-color: rgb(255, 0, 0);
    }
  `
);

registerStyles(
  baz,
  css`
    [part='text'] {
      width: 100px;
    }
  `
);

registerStyles(
  'lit-*a*',
  css`
    [part='text'] {
      position: relative;
    }
  `
);

registerStyles(
  override,
  css`
    :host {
      position: absolute;
    }

    [part='text'] {
      color: rgb(0, 0, 0);
    }
  `,
  { moduleId: 'custom-override-styles-first' }
);

registerStyles(
  override,
  css`
    :host {
      position: relative;
    }
  `,
  { moduleId: 'custom-override-styles-second' }
);

registerStyles(
  override,
  css`
    :host {
      display: flex;
    }
  `,
  { moduleId: 'vaadin-override-styles-first' }
);

registerStyles(
  override,
  css`
    :host {
      display: block;
    }

    [part='text'] {
      color: rgb(255, 255, 255);
      opacity: 1;
      display: block;
    }
  `,
  { moduleId: 'vaadin-override-styles-second' }
);

registerStyles(
  override,
  css`
    [part='text'] {
      color: rgb(255, 0, 0);
      display: inline;
    }
  `,
  { moduleId: 'lumo-override-styles' }
);

registerStyles(
  override,
  css`
    [part='text'] {
      color: rgb(0, 255, 0);
      opacity: 0.5;
    }
  `,
  { moduleId: 'material-override-styles' }
);

class LitFoo extends ThemableElement {
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

class LitBar extends ThemableElement {
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

class LitOverride extends ThemableElement {
  static is = override;

  render() {
    return html`
      <div part="text" id="text">text</div>
    `;
  }
}

customElements.define(override, LitOverride);

describe('ThemableElement', () => {
  let wrapper: HTMLElement;
  let components: Array<Element> = [];

  const getPart = (idx: number) => {
    return (components[idx] as ThemableElement).renderRoot.querySelector('#text') as Element;
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

  it('should not inject to subclassed components', () => {
    expect(window.getComputedStyle(getPart(2)).backgroundColor).to.not.equal('rgb(255, 0, 0)');
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
