export function focusin(node: Element) {
  node.dispatchEvent(new CustomEvent('focusin', { bubbles: true, composed: true }));
}

export function focusout(node: Element) {
  const event = new CustomEvent('focusout', { bubbles: true, composed: true });
  node.dispatchEvent(event);
}
