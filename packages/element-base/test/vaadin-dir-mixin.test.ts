import { LitElement } from 'lit-element';
import { DirMixin } from '@vaadin/vaadin-element-mixin/vaadin-dir-mixin.js';

const { expect } = chai;

describe('DirMixin', () => {
  class DirElement extends DirMixin(LitElement) {
    static get is() {
      return 'dir-element';
    }
  }
  customElements.define(DirElement.is, DirElement);

  const element = document.createElement('dir-element') as LitElement;

  before(() => {
    document.body.appendChild(element);
  });

  beforeEach(() => {
    // Clean up the dir attribute
    document.documentElement.removeAttribute('dir');
    element.removeAttribute('dir');
  });

  after(() => {
    document.body.removeChild(element);
  });

  // Toggle the document dir attribute value
  function setDir(direction: string | null) {
    if (direction) {
      document.documentElement.setAttribute('dir', direction);
    } else {
      document.documentElement.removeAttribute('dir');
    }
  }

  // Checks that for each `documentDirections` value set, `testElement` dir attribute
  // value equals to the correspondent value from `elementDirections`
  async function elementDirectionsAreCorrect(
    documentDirections: Array<string | null>,
    elementDirections: Array<string | null>,
    testElement: LitElement
  ): Promise<boolean> {
    for await (const [index, dir] of documentDirections.entries()) {
      setDir(dir);
      await testElement.updateComplete;
      if (testElement.getAttribute('dir') !== elementDirections[index]) {
        return false;
      }
    }
    return true;
  }

  it('should propagate direction as dir attribute to the element from the documentElement', async () => {
    expect(
      await elementDirectionsAreCorrect(
        ['rtl', 'ltr', '', 'rtl', null],
        ['rtl', 'ltr', null, 'rtl', null],
        element
      )
    ).to.be.true;
  });

  it('should preserve direction if was set by the user', async () => {
    element.setAttribute('dir', 'ltr');

    expect(
      await elementDirectionsAreCorrect(
        ['rtl', 'ltr', '', 'rtl', null],
        ['ltr', 'ltr', 'ltr', 'ltr', 'ltr'],
        element
      )
    ).to.be.true;
  });

  it('should subscribe to the changes if set to equal the document direction', async () => {
    element.setAttribute('dir', 'ltr');

    expect(await elementDirectionsAreCorrect(['rtl', 'ltr', 'rtl'], ['ltr', 'ltr', 'ltr'], element))
      .to.be.true;

    element.setAttribute('dir', 'rtl');

    expect(await elementDirectionsAreCorrect(['ltr', 'rtl', ''], ['ltr', 'rtl', null], element)).to
      .be.true;
  });

  it('should subscribe to the changes if attribute removed', async () => {
    element.setAttribute('dir', 'ltr');

    expect(await elementDirectionsAreCorrect(['rtl', 'ltr', 'rtl'], ['ltr', 'ltr', 'ltr'], element))
      .to.be.true;

    element.removeAttribute('dir');

    expect(await elementDirectionsAreCorrect(['ltr', 'rtl', ''], ['ltr', 'rtl', null], element)).to
      .be.true;
  });

  it('should unsubscribe if attribute set by the user', async () => {
    expect(await elementDirectionsAreCorrect(['rtl', 'ltr', 'rtl'], ['rtl', 'ltr', 'rtl'], element))
      .to.be.true;

    element.setAttribute('dir', 'ltr');

    expect(await elementDirectionsAreCorrect(['ltr', 'rtl', ''], ['ltr', 'ltr', 'ltr'], element)).to
      .be.true;
  });
});
