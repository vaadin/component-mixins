import { LitElement } from 'lit-element';

export abstract class MediaQueryClass extends LitElement {
  static mediaQueries: { [key: string]: unknown };
}
