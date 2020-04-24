/* istanbul ignore file */
const HAS_NEW_TOUCH = (() => {
  let has = false;
  try {
    has = Boolean(new TouchEvent('x'));
  } catch (_) {
    // nothing to do
  }
  return has;
})();

/**
 * Returns the (x,y) coordinates representing the middle of a node.
 */
function middleOfNode(node: Element) {
  const bcr = node.getBoundingClientRect();
  return { y: bcr.top + bcr.height / 2, x: bcr.left + bcr.width / 2 };
}

/**
 * Returns a list of Touch objects that correspond to an array of positions
 * and a target node. The Touch instances will each have a unique Touch
 * identifier.
 *
 * @param {!Array<{ x: number, y: number }>} xyList A list of (x,y) coordinate
 * objects.
 * @param {!Element} node A target element node.
 * @return {!Array<!Touch>}
 */
export function makeTouches(xyList: Array<{ x: number; y: number }>, node: Element): Array<Touch> {
  let id = 0;

  return xyList.map((xy) => {
    id += 1;
    const touchInit = { identifier: id, target: node, clientX: xy.x, clientY: xy.y };

    // @ts-ignore
    return HAS_NEW_TOUCH ? new Touch(touchInit) : touchInit;
  }) as Touch[];
}

/**
 * Generates and dispatches a TouchEvent of a given type, at a specified
 * position of a target node.
 *
 * @param {string} type The type of TouchEvent to generate.
 * @param {{ x: number, y: number }} xy An (x,y) coordinate for the generated
 * TouchEvent.
 * @param {!Element} node The target element node for the generated
 * TouchEvent to be dispatched on.
 * @return {undefined}
 */
export function makeSoloTouchEvent(type: string, coords: { x: number; y: number }, node: Element) {
  const xy = coords || middleOfNode(node);
  const touches = makeTouches([xy], node);
  const touchEventInit = {
    touches,
    targetTouches: touches,
    changedTouches: touches
  };

  let event: CustomEvent | TouchEvent;

  if (HAS_NEW_TOUCH) {
    // @ts-ignore
    touchEventInit.bubbles = true;

    // @ts-ignore
    touchEventInit.cancelable = true;
    event = new TouchEvent(type, touchEventInit);
  } else {
    event = new CustomEvent(type, {
      bubbles: true,
      cancelable: true,
      // Allow event to go outside a ShadowRoot.
      composed: true
    });
    Object.keys(touchEventInit).forEach((property) => {
      // @ts-ignore
      event[property] = touchEventInit[property];
    });
  }

  node.dispatchEvent(event);
}

/**
 * Generate a touchstart event on a given node, optionally at a given
 * coordinate.
 */
export function touchstart(node: Element, coords?: { x: number; y: number }) {
  const xy = coords || middleOfNode(node);
  makeSoloTouchEvent('touchstart', xy, node);
}

/**
 * Generate a touchend event on a given node
 */
export function touchend(node: Element, coords?: { x: number; y: number }) {
  const xy = coords || middleOfNode(node);
  makeSoloTouchEvent('touchend', xy, node);
}

export function focusin(node: Element) {
  node.dispatchEvent(new CustomEvent('focusin', { bubbles: true, composed: true }));
}

export function focusout(node: Element) {
  const event = new CustomEvent('focusout', { bubbles: true, composed: true });
  node.dispatchEvent(event);
}

export function mousedown(node: Element, buttons = 1) {
  const event = new MouseEvent('mousedown', { bubbles: true, composed: true, buttons });
  node.dispatchEvent(event);
}

export function mouseup(node: Element) {
  const event = new MouseEvent('mouseup', { bubbles: true, composed: true });
  node.dispatchEvent(event);
}
