import { DirectionClass } from './direction-class';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

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

function wasApplied(mixin: unknown, superClass: Constructor<HTMLElement>): boolean {
  const classes = getPrototypeChain(superClass);
  return classes.reduce((res: boolean, klass) => res || appliedMixins.get(klass) === mixin, false);
}

export function DirectionMixin<T extends Constructor<DirectionClass>>(
  base: T
): Constructor<DirectionClass> & T {
  if (wasApplied(DirectionMixin, base)) {
    return base;
  }

  class Direction extends base {
    protected get _vertical() {
      return false;
    }
  }

  appliedMixins.set(Direction, DirectionMixin);

  return Direction;
}
