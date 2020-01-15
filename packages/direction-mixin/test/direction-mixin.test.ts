import { LitElement } from 'lit-element';
import { DirectionMixin } from '../direction-mixin';

const { expect } = chai;

const getPropertyDescriptors = (
  constructor: new () => HTMLElement,
  prop: string
): PropertyDescriptor[] => {
  function getDescriptors(
    obj: new () => HTMLElement,
    descriptors: PropertyDescriptor[] = []
  ): PropertyDescriptor[] {
    while (obj !== HTMLElement) {
      const descriptor = Object.getOwnPropertyDescriptor(obj.prototype, prop);
      if (descriptor) {
        descriptors.push(descriptor);
      }
      return getDescriptors(Object.getPrototypeOf(obj), descriptors);
    }
    return descriptors;
  }
  return getDescriptors(constructor);
};

describe('DirectionMixin', () => {
  it('should initialize _vertical property getter', () => {
    const MixedClass1 = DirectionMixin(LitElement);
    const descriptors = getPropertyDescriptors(MixedClass1, '_vertical');
    expect(descriptors.length).to.equal(1);
    expect(descriptors[0].get).to.be.a('function');
    expect(descriptors[0].set).to.be.undefined;
  });

  it('should set _vertical to false by default', () => {
    const MixedClass1 = DirectionMixin(LitElement);
    const descriptors = getPropertyDescriptors(MixedClass1, '_vertical');
    expect(descriptors[0].get!()).to.equal(false);
    expect(descriptors[0].set).to.be.undefined;
  });

  it('should de-duplicate and only apply mixin once', () => {
    const MixedClass1 = DirectionMixin(LitElement);
    const MixedClass2 = DirectionMixin(MixedClass1);
    const descriptors = getPropertyDescriptors(MixedClass2, '_vertical');
    expect(descriptors.length).to.equal(1);
  });
});
