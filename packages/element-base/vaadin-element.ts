import { ElementMixin } from '@vaadin/vaadin-element-mixin/vaadin-element-mixin.js';
import { ThemableLitElement } from '@vaadin/themable-lit-element/themable-lit-element.js';

export class VaadinElement extends ElementMixin(ThemableLitElement) {
  static finalize() {
    super.finalize();
  }
}
