import { Constructor, applyMixin, wasApplied } from '@vaadin/mixin-utils';
import { DirectionClass } from './direction-class';

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

  applyMixin(DirectionMixin, Direction);

  return Direction;
}
