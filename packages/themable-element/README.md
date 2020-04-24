# @vaadin/themable-element

This package provides `ThemableElement`, a version of [Vaadin.ThemableMixin](https://github.com/vaadin/vaadin-themable-mixin) re-implemented using [LitElement](https://github.com/Polymer/lit-element).

## Usage

The API provided by `@vaadin/vaadin-themable-mixin` should be used to register styles:

```js
import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';

registerStyles(
  'my-lit-element',
  css`
    /* Styles which will be included in my-element local scope */
  `
);
```

The `registerStyles` helper uses `DomModule` from Polymer 3 internally. This is needed in order to
provide a common theming mechanism for both Polymer and LitElement versions of Vaadin components.
