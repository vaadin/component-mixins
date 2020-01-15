import { DirectionClass } from './direction-class';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

const appliedMixins = new Set();

function getPrototypeChain<T>(obj: T) {
  const chain = [];
  let proto = obj;
  while (proto) {
    chain.push(proto);
    proto = Object.getPrototypeOf(proto);
  }
  return chain;
}

function wasApplied(superClass: Constructor<HTMLElement>): boolean {
  const classes = getPrototypeChain(superClass);
  return classes.reduce((res: boolean, klass) => res || appliedMixins.has(klass), false);
}

export function DirectionMixin<T extends Constructor<DirectionClass>>(
  base: T
): Constructor<DirectionClass> & T {
  if (wasApplied(base)) {
    return base;
  }

  class Direction extends base {
    protected get _vertical() {
      return false;
    }
  }

  appliedMixins.add(Direction);

  return Direction;
}
