import { DomModule } from '@polymer/polymer/lib/elements/dom-module.js';
import { cssFromModule } from '@polymer/polymer/lib/utils/style-gather.js';
import { LitElement, unsafeCSS, CSSResult, CSSResultArray } from 'lit-element';

const sortModules = (modules: Array<{ [s: string]: DomModule }>) => {
  return Object.keys(modules).sort((moduleNameA, moduleNameB) => {
    const vaadinA = moduleNameA.indexOf('vaadin-') === 0;
    const vaadinB = moduleNameB.indexOf('vaadin-') === 0;

    const prefixes = ['lumo-', 'material-'];
    const vaadinThemeA = prefixes.filter((p) => moduleNameA.indexOf(p) === 0).length > 0;
    const vaadinThemeB = prefixes.filter((p) => moduleNameB.indexOf(p) === 0).length > 0;

    let result;

    if (vaadinA !== vaadinB) {
      // Include vaadin core styles first
      result = vaadinA ? -1 : 1;
    } else if (vaadinThemeA !== vaadinThemeB) {
      // Include vaadin theme styles after that
      result = vaadinThemeA ? -1 : 1;
    } else {
      // Lastly include custom styles so they override all vaadin styles
      result = 0;
    }

    return result;
  });
};

export class ThemableElement extends LitElement {
  protected static is: string;

  static getStyles(): CSSResult | CSSResultArray | undefined {
    const styles = super.getStyles();
    const themes: CSSResultArray = styles ? [styles] : [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { modules } = DomModule.prototype as any;

    sortModules(modules).forEach((moduleName) => {
      const themeFor = modules[moduleName].getAttribute('theme-for');
      if (themeFor) {
        themeFor.split(' ').forEach((themeForToken: string) => {
          if (new RegExp(`^${themeForToken.split('*').join('.*')}$`).test(this.is)) {
            themes.push(unsafeCSS(cssFromModule(moduleName)));
          }
        });
      }
    });

    return themes;
  }
}
