# @vaadin/single-selection-mixin

This package provides `SingleSelectionMixin` that does the following:

1. Add `selected` property (number, reflects to attribute)

2. Change `selected` property on item click

3. Change `selected` property on <kbd>Enter</kbd> or <kbd>Space</kbd> key

4. Dispatch `selected-changed` event when `selected` value is changed

The mixin accepts a class that must apply `SlottedItemsMixin`.
