# @vaadin/slotted-items-mixin

This package provides `SlottedItemsMixin` that does the following:

1. Set read-only `items` property based on the light DOM children

2. Add `slotchange` listener on the default `slot` to update items

3. Dispatch `items-changed` event when `items` value is changed
