// See https://stackoverflow.com/a/58064481
export const isIOS =
  /iPad|iPhone|iPod/.test(navigator.platform) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

let observed = false;

const detectIosNavbar = () => {
  const prop = '--vaadin-viewport-offset-bottom';
  const doc = document.documentElement;

  const { innerHeight, innerWidth } = window;
  const landscape = innerWidth > innerHeight;
  const { clientHeight } = doc;
  if (landscape && clientHeight > innerHeight) {
    doc.style.setProperty(prop, `${clientHeight - innerHeight}px`);
  } else {
    doc.style.setProperty(prop, '');
  }
};

export const observeIosNavbar = (force?: boolean) => {
  if ((force || isIOS) && !observed) {
    observed = true;
    detectIosNavbar();
    window.addEventListener('resize', detectIosNavbar);
  }
};
