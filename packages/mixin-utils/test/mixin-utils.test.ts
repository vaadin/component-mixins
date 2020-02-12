import { LitElement } from 'lit-element';
import { Constructor, applyMixin, wasApplied } from '../mixin-utils';
import { getPropertyDescriptors } from '../mixin-test-utils';

const { expect } = chai;

interface DedupingMixinInterface {
  getter: boolean;
}

function DedupingMixin<T extends Constructor<LitElement>>(
  base: T
): Constructor<LitElement & DedupingMixinInterface> & T {
  if (wasApplied(DedupingMixin, base)) {
    return base as Constructor<LitElement & DedupingMixinInterface> & T;
  }

  class Deduping extends base {
    get getter() {
      return true;
    }
  }

  applyMixin(DedupingMixin, Deduping);

  return Deduping;
}

describe('mixin utils', () => {
  it('should initialize a property getter', () => {
    const MixedClass = DedupingMixin(LitElement);
    const descriptors = getPropertyDescriptors(MixedClass, 'getter');
    expect(descriptors.length).to.equal(1);
    expect(descriptors[0].get).to.be.a('function');
    expect(descriptors[0].set).to.be.undefined;
  });

  it('should de-duplicate and only apply mixin once', () => {
    const MixedClass1 = DedupingMixin(LitElement);
    const MixedClass2 = DedupingMixin(MixedClass1);
    const descriptors = getPropertyDescriptors(MixedClass2, 'getter');
    expect(descriptors.length).to.equal(1);
  });
});
