# @vaadin/selected-state-mixin

This package provides `SelectedStateMixin` that does the following:

1. Add `selected` property (boolean, false by default, reflects to attribute)

2. Toggle `aria-selected` attribute when `selected` property changes

The mixin accepts a class that must apply `DisabledStateMixin`.
