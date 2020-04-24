# @vaadin/media-query-mixin

This package provides `MediaQueryMixin` and `@mediaProperty` decorator.

```ts
@customElement('mq-basic-element')
class MyElement extends MediaQueryMixin(LitElement) {
  @mediaProperty({ media: '(max-width: 420px)' })
  fullscreen: boolean | null | undefined;
}
```

## Using a `@mediaProperty` decorator

When using `@mediaProperty`, the following restrictions apply:

- property is forced to be of `type: Boolean` regardless of the user config
- property value is set to `true` when query matches, and `false` otherwise
- `attribute: false` is forced so setting attribute is ignored
- property is read-only so manual modifications are ignored
- default property value set by the user is also ignored

As a result, `window.matchMedia` is a single source of truth.
