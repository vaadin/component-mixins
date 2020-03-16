import { isIOS } from '@vaadin/browser-utils';

// Number of last N track positions to keep
const TRACK_LENGTH = 2;
// Radius for track
const TRACK_DISTANCE = 5;
// Stored touch identifier
const TOUCH_STATE = {
  id: -1
};

type TrackMove = {
  x: number;
  y: number;
};

type TrackGestureInfo = {
  x: number;
  y: number;
  state: 'start' | 'track' | 'pan-x' | 'pan-y' | 'end';
  started: boolean;
  moves: TrackMove[];
  addMove: (move: TrackMove) => void;
  moveFn?: (event: MouseEvent) => void;
  upFn?: (event: MouseEvent) => void;
};

type TrackGesture = {
  name: string;
  touchAction: string;
  deps: Array<'mousedown' | 'touchstart' | 'touchmove' | 'touchend'>;
  info: TrackGestureInfo;
  reset: () => void;
  mousedown: (event: MouseEvent) => void;
  touchstart: (event: TouchEvent) => void;
  touchmove: (event: TouchEvent) => void;
  touchend: (event: TouchEvent) => void;
};

function isMouseEvent(name: string): boolean {
  return ['mousedown', 'mousemove', 'mouseup'].includes(name);
}

function hasLeftMouseButton(ev: MouseEvent): boolean {
  const { type } = ev;
  let result;
  if (type === 'mousemove') {
    // ev.button is not reliable for mousemove (0 is overloaded as both left button and no buttons)
    // instead we use ev.buttons (bitmask of buttons): 0 for no buttons, 1 for left button
    // NOTE: allow undefined for testing events
    const buttons = ev.buttons === undefined ? 1 : ev.buttons;
    // buttons is a bitmask, check that the left button bit is set (1)
    result = Boolean(buttons & 1); // eslint-disable-line no-bitwise
  } else {
    // NOTE: allow undefined for testing events
    const button = ev.button === undefined ? 0 : ev.button;
    // ev.button is 0 in mousedown/mouseup/click for left button activation
    result = button === 0;
  }
  return result;
}

function trackHasMovedEnough(info: TrackGestureInfo, x: number, y: number): boolean {
  if (info.started) {
    return true;
  }
  const dx = Math.abs(info.x - x);
  const dy = Math.abs(info.y - y);
  return dx >= TRACK_DISTANCE || dy >= TRACK_DISTANCE;
}

function fireTrack(info: TrackGestureInfo, target: EventTarget, touch: Touch | MouseEvent) {
  const { x, y, moves, state } = info;
  const secondLast = moves[moves.length - 2];
  const lastMove = moves[moves.length - 1];
  const dx = lastMove.x - x;
  const dy = lastMove.y - y;
  let ddx = 0;
  let ddy = 0;
  if (secondLast) {
    ddx = lastMove.x - secondLast.x;
    ddy = lastMove.y - secondLast.y;
  }
  target.dispatchEvent(
    new CustomEvent('track', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        state,
        x: touch.clientX,
        y: touch.clientY,
        dx,
        dy,
        ddx,
        ddy,
        sourceEvent: touch
      }
    })
  );
}

function trackDocument(
  info: TrackGestureInfo,
  moveFn: (event: MouseEvent) => void,
  upFn: (event: MouseEvent) => void
) {
  info.moveFn = moveFn;
  info.upFn = upFn;
  document.addEventListener('mousemove', moveFn);
  document.addEventListener('mouseup', upFn);
}

function unTrackDocument(info: TrackGestureInfo) {
  document.removeEventListener('mousemove', info.moveFn as EventListener);
  document.removeEventListener('mouseup', info.upFn as EventListener);
  info.moveFn = undefined;
  info.upFn = undefined;
}

const TrackGesture: TrackGesture = {
  name: 'track',
  touchAction: 'none',
  deps: ['mousedown', 'touchstart', 'touchmove', 'touchend'],
  info: {
    x: 0,
    y: 0,
    state: 'start',
    started: false,
    moves: [],
    addMove(move) {
      if (this.moves.length > TRACK_LENGTH) {
        this.moves.shift();
      }
      this.moves.push(move);
    },
    moveFn: undefined,
    upFn: undefined
  },

  reset() {
    this.info.state = 'start';
    this.info.started = false;
    this.info.moves = [];
    this.info.x = 0;
    this.info.y = 0;
    unTrackDocument(this.info);
  },

  mousedown(event: MouseEvent) {
    if (!hasLeftMouseButton(event)) {
      return;
    }
    const target = event.composedPath()[0];
    const self = TrackGesture;
    const moveFn = function moveFn(e: MouseEvent) {
      const x = e.clientX;
      const y = e.clientY;
      if (trackHasMovedEnough(self.info, x, y)) {
        // first move is 'start', subsequent moves are 'move', mouseup is 'end'
        const newState = e.type === 'mouseup' ? 'end' : 'track';
        self.info.state = self.info.started ? newState : 'start';
        self.info.addMove({ x, y });
        if (!hasLeftMouseButton(e)) {
          // always fire "end"
          self.info.state = 'end';
          unTrackDocument(self.info);
        }
        /* istanbul ignore else */
        if (target) {
          fireTrack(self.info, target, e);
        }
        self.info.started = true;
      }
    };
    const upFn = function upFn(e: MouseEvent) {
      if (self.info.started) {
        moveFn(e);
      }
      // remove the temporary listeners
      unTrackDocument(self.info);
    };
    // add temporary document listeners
    trackDocument(this.info, moveFn, upFn);
    this.info.x = event.clientX;
    this.info.y = event.clientY;
  },

  touchstart(event: TouchEvent) {
    const touch = event.changedTouches[0];
    this.info.x = touch.clientX;
    this.info.y = touch.clientY;
  },

  touchmove(event: TouchEvent) {
    const target = event.composedPath()[0];
    const touch = event.changedTouches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    if (trackHasMovedEnough(this.info, x, y)) {
      this.info.addMove({ x, y });
      fireTrack(this.info, target, touch);
      this.info.state = 'track';
      this.info.started = true;
    }
  },

  touchend(event: TouchEvent) {
    const target = event.composedPath()[0];
    const touch = event.changedTouches[0];
    // only end if track was started and not aborted
    if (this.info.started) {
      // reset started state on up
      this.info.state = 'end';
      this.info.addMove({ x: touch.clientX, y: touch.clientY });
      fireTrack(this.info, target, touch);
    }
  }
};

const handleNative = (ev: MouseEvent | TouchEvent) => {
  const { type } = ev;

  if (type.slice(0, 5) === 'touch') {
    const event = ev as TouchEvent;
    const touch = event.changedTouches[0];
    if (type === 'touchstart') {
      // only handle the first finger
      if (event.touches.length === 1) {
        TOUCH_STATE.id = touch.identifier;
      }
    }
    if (TOUCH_STATE.id !== touch.identifier) {
      return;
    }
  }

  if (type === 'mousedown' || type === 'touchstart') {
    TrackGesture.reset();
  }

  switch (type) {
    case 'mousedown':
      TrackGesture.mousedown(ev as MouseEvent);
      break;
    case 'touchstart':
      TrackGesture.touchstart(ev as TouchEvent);
      break;
    case 'touchmove':
      TrackGesture.touchmove(ev as TouchEvent);
      break;
    case 'touchend':
      TrackGesture.touchend(ev as TouchEvent);
      break;
    /* istanbul ignore next */
    default:
  }
};

/**
 * Add event listeners for handling track.
 */
export function addTrackListeners(node: HTMLElement) {
  const { deps } = TrackGesture;
  for (let i = 0, dep; i < deps.length; i += 1) {
    dep = deps[i];
    // don't add mouse handlers on iOS because they cause gray selection overlays
    /* istanbul ignore else */
    if (Boolean(isIOS && isMouseEvent(dep)) === false) {
      node.addEventListener(dep, handleNative as EventListener);
    }
  }

  node.style.touchAction = TrackGesture.touchAction;
}

/**
 * Remove event listeners for handling track.
 */
export function removeTrackListeners(node: Element) {
  const { deps } = TrackGesture;
  for (let i = 0, dep; i < deps.length; i += 1) {
    dep = deps[i];
    /* istanbul ignore else */
    if (Boolean(isIOS && isMouseEvent(dep)) === false) {
      node.removeEventListener(dep, handleNative as EventListener);
    }
  }
}

declare global {
  interface HTMLElementEventMap {
    track: CustomEvent<{
      state: 'start' | 'track' | 'end';
      x: number;
      y: number;
      dx: number;
      dy: number;
      ddx: number;
      ddy: number;
      sourceEvent: Touch | MouseEvent;
    }>;
  }
}
