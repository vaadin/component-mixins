# @vaadin/roving-tabindex-mixin

This package provides `RovingTabIndexMixin` that does the following:

1. When one of the items receives focus, set its `tabIndex` to 0

2. Set `tabIndex` to -1 for all the items except the focused one

The mixin accepts a class that must apply `SlottedItemsMixin` and `KeyboardDirectionMixin`.
