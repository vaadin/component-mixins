/* eslint-disable @typescript-eslint/no-explicit-any */
export type Constructor<T = object> = new (...args: any[]) => T;

export type AnyFunction<T = any> = (...args: any[]) => T;

const appliedMixins = new WeakMap();

function getPrototypeChain<T>(obj: T) {
  const chain = [];
  let proto = obj;
  while (proto) {
    chain.push(proto);
    proto = Object.getPrototypeOf(proto);
  }
  return chain;
}

export function wasApplied(mixin: AnyFunction, superClass: Constructor<HTMLElement>): boolean {
  const entries = appliedMixins.get(mixin);
  return entries
    ? getPrototypeChain(superClass).reduce(
        (res: boolean, klass) => res || entries.has(klass),
        false
      )
    : false;
}

export function applyMixin(mixin: AnyFunction, superClass: Constructor<HTMLElement>): void {
  let entries = appliedMixins.get(mixin);
  if (!entries) {
    entries = new WeakSet();
    appliedMixins.set(mixin, entries);
  }
  entries.add(superClass);
}
