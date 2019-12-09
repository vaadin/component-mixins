# @vaadin/active-state-mixin

This package provides `ActiveStateMixin` that does the following:

1. Listen to keyboard, mouse and touch events on the host element

2. Set `active` attribute on the host element in following cases:

- Element has `disabled` property set to `false`
- Mouse: primary (left) button is pressed
- Keyboard: <kbd>Enter</kbd> or <kbd>Space</kbd> is pressed

3. Remove `active` attribute when mouse / key / touch is released.

The mixin accepts a class that must apply `DisabledStateMixin`.
