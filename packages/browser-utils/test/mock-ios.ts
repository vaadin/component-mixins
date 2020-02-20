const origPlatform = window.navigator.platform;
let platform = 'iPhone';

Object.defineProperty(window.navigator, 'platform', {
  get() {
    return platform;
  }
});

export const restoreNavigator = () => {
  platform = origPlatform;
};
