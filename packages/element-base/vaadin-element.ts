import { ElementMixin } from '@vaadin/vaadin-element-mixin/vaadin-element-mixin.js';
import { ThemableElement } from '@vaadin/themable-element/themable-element.js';

export class VaadinElement extends ElementMixin(ThemableElement) {
  static finalize() {
    super.finalize();
  }
}
