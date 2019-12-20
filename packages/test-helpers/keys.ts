/**
 * Returns a keyboard event. This event bubbles and is cancellable.
 */
export function keyboardEventFor(
  type: string,
  keyCode: number,
  modifiers: string | string[] = [],
  key?: string
) {
  const event = new CustomEvent(type, {
    detail: 0,
    bubbles: true,
    cancelable: true,
    // Allow event to go outside a ShadowRoot.
    composed: true
  });

  // @ts-ignore
  event.keyCode = keyCode;

  // @ts-ignore
  event.code = keyCode;

  const modifierKeys = typeof modifiers === 'string' ? [modifiers] : modifiers;

  // @ts-ignore
  event.shiftKey = modifierKeys.indexOf('shift') !== -1;

  // @ts-ignore
  event.altKey = modifierKeys.indexOf('alt') !== -1;

  // @ts-ignore
  event.ctrlKey = modifierKeys.indexOf('ctrl') !== -1;

  // @ts-ignore
  event.metaKey = modifierKeys.indexOf('meta') !== -1;

  // @ts-ignore
  event.key = key;

  return event;
}

/**
 * Fires a keyboard event on a specific node. This event bubbles and is
 * cancellable.
 */
export function keyEventOn(
  target: Element,
  type: string,
  keyCode: number,
  modifiers: string | string[] = [],
  key?: string
) {
  target.dispatchEvent(keyboardEventFor(type, keyCode, modifiers, key));
}

/**
 * Fires a 'keydown' event on a specific node. This event bubbles and is
 * cancellable.
 */
export function keyDownOn(
  target: Element,
  keyCode: number,
  modifiers: string | string[] = [],
  key?: string
) {
  keyEventOn(target, 'keydown', keyCode, modifiers, key);
}

/**
 * Fires a 'keyup' event on a specific node. This event bubbles and is
 * cancellable.
 */
export function keyUpOn(
  target: Element,
  keyCode: number,
  modifiers: string | string[] = [],
  key?: string
) {
  keyEventOn(target, 'keyup', keyCode, modifiers, key);
}

/* istanbul ignore file */

export function makeKeydownEvent(key: number, modifiers: string | string[] = []) {
  return keyboardEventFor('keydown', key, modifiers);
}

export function tabKeyDown(target: Element, modifiers: string | string[] = []) {
  keyDownOn(target, 9, modifiers, 'Tab');
}

export function tabKeyUp(target: Element, modifiers: string | string[] = []) {
  keyUpOn(target, 9, modifiers, 'Tab');
}

export function tab(target: Element, modifiers: string | string[] = []) {
  tabKeyDown(target, modifiers);
  tabKeyUp(target, modifiers);
}

export function arrowDownKeyDown(target: Element, modifiers: string | string[] = []) {
  keyDownOn(target, 40, modifiers, 'ArrowDown');
}

export function arrowDownKeyUp(target: Element, modifiers: string | string[] = []) {
  keyUpOn(target, 40, modifiers, 'ArrowDown');
}

export function arrowDown(target: Element, modifiers: string | string[] = []) {
  arrowDownKeyDown(target, modifiers);
  arrowDownKeyUp(target, modifiers);
}

export function arrowLeftKeyDown(target: Element, modifiers: string | string[] = []) {
  keyDownOn(target, 37, modifiers, 'ArrowLeft');
}

export function arrowLeftKeyUp(target: Element, modifiers: string | string[] = []) {
  keyUpOn(target, 37, modifiers, 'ArrowLeft');
}

export function arrowLeft(target: Element, modifiers: string | string[] = []) {
  arrowLeftKeyDown(target, modifiers);
  arrowLeftKeyUp(target, modifiers);
}

export function arrowRightKeyDown(target: Element, modifiers: string | string[] = []) {
  keyDownOn(target, 39, modifiers, 'ArrowRight');
}

export function arrowRightKeyUp(target: Element, modifiers: string | string[] = []) {
  keyUpOn(target, 39, modifiers, 'ArrowRight');
}

export function arrowRight(target: Element, modifiers: string | string[] = []) {
  arrowRightKeyDown(target, modifiers);
  arrowRightKeyUp(target, modifiers);
}

export function arrowUpKeyDown(target: Element, modifiers: string | string[] = []) {
  keyDownOn(target, 38, modifiers, 'ArrowUp');
}

export function arrowUpKeyUp(target: Element, modifiers: string | string[] = []) {
  keyUpOn(target, 38, modifiers, 'ArrowUp');
}

export function arrowUp(target: Element, modifiers: string | string[] = []) {
  arrowUpKeyDown(target, modifiers);
  arrowUpKeyUp(target, modifiers);
}

export function home(target: Element, modifiers: string | string[] = []) {
  keyDownOn(target, 36, modifiers, 'Home');
}

export function end(target: Element, modifiers: string | string[] = []) {
  keyDownOn(target, 35, modifiers, 'End');
}

export function enterKeyDown(target: Element, modifiers: string | string[] = []) {
  keyDownOn(target, 13, modifiers, 'Enter');
}

export function enterKeyUp(target: Element, modifiers: string | string[] = []) {
  keyUpOn(target, 13, modifiers, 'Enter');
}

export function enter(target: Element, modifiers: string | string[] = []) {
  enterKeyDown(target, modifiers);
  enterKeyUp(target, modifiers);
}

export function spaceKeyDown(target: Element, modifiers: string | string[] = []) {
  keyDownOn(target, 32, modifiers, ' ');
}

export function spaceKeyUp(target: Element, modifiers: string | string[] = []) {
  keyUpOn(target, 32, modifiers, ' ');
}

export function space(target: Element, modifiers: string | string[] = []) {
  spaceKeyDown(target, modifiers);
  spaceKeyUp(target, modifiers);
}
