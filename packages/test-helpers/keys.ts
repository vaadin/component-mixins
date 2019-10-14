import {
  keyDownOn,
  keyUpOn,
  keyboardEventFor
} from '@polymer/iron-test-helpers/mock-interactions.js';

export function makeShiftTabEvent(): Event {
  return keyboardEventFor('keydown', 9, 'shift');
}

export function shiftTabDown(target: Element) {
  keyDownOn(target, 9, 'shift', 'Tab');
}

export function tabDown(target: Element) {
  keyDownOn(target, 9, [], 'Tab');
}

export function tabUp(target: Element) {
  keyUpOn(target, 9, [], 'Tab');
}
