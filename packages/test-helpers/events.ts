/* istanbul ignore file */

export function focusin(node: Element) {
  node.dispatchEvent(new CustomEvent('focusin', { bubbles: true, composed: true }));
}

export function focusout(node: Element) {
  const event = new CustomEvent('focusout', { bubbles: true, composed: true });
  node.dispatchEvent(event);
}

export function mousedown(node: Element, buttons = 1) {
  const event = new MouseEvent('mousedown', { bubbles: true, buttons });
  node.dispatchEvent(event);
}

export function mouseup(node: Element) {
  const event = new MouseEvent('mouseup', { bubbles: true });
  node.dispatchEvent(event);
}

export { touchstart, touchend } from '@polymer/iron-test-helpers/mock-interactions.js';
