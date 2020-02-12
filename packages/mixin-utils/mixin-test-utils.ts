export const getPropertyDescriptors = (
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
