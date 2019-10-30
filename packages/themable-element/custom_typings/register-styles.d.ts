declare module '@vaadin/vaadin-themable-mixin/register-styles.js' {
  export { registerStyles };

  /**
   * Registers CSS styles for a component type. Make sure to register the styles before
   * the first instance of a component of the type is attached to DOM.
   */
  function registerStyles(
    themeFor: String | null,
    styles: CSSResult | Array<CSSResult | null> | null,
    options?: { moduleId: string }
  ): void;

  export class CSSResult {
    constructor(cssText: string, safeToken: unknown);

    toString(): string;
  }

  export { unsafeCSS };

  /**
   * Wrap a value for interpolation in a css tagged template literal.
   *
   * This is unsafe because untrusted CSS text can be used to phone home
   * or exfiltrate data to an attacker controlled site. Take care to only use
   * this with trusted input.
   *
   */
  function unsafeCSS(value: unknown): CSSResult;

  export { css };

  function css(strings: TemplateStringsArray, ...values: (number | CSSResult)[]): CSSResult;
}
