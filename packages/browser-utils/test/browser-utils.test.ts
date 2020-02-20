import { isIOS, observeIosNavbar } from '../browser-utils';

const { expect } = chai;
const { sinon } = window;

(isIOS ? describe : describe.skip)('iOS navbar', () => {
  it('should set --vaadin-viewport-bottom when landscape and clientHeight > innerHeight', () => {
    const sandbox = sinon.createSandbox();
    sandbox.stub(document.documentElement, 'clientHeight').value(250);
    sandbox.stub(window, 'innerHeight').value(200);
    sandbox.stub(window, 'innerWidth').value(300);
    observeIosNavbar();
    expect(
      getComputedStyle(document.documentElement).getPropertyValue('--vaadin-viewport-offset-bottom')
    ).to.equal('50px');
    sandbox.restore();
  });

  it('should set --vaadin-viewport-bottom when resize event is dispatched', () => {
    const sandbox = sinon.createSandbox();
    sandbox.stub(document.documentElement, 'clientHeight').value(275);
    sandbox.stub(window, 'innerHeight').value(200);
    sandbox.stub(window, 'innerWidth').value(300);
    window.dispatchEvent(new CustomEvent('resize'));
    expect(
      getComputedStyle(document.documentElement).getPropertyValue('--vaadin-viewport-offset-bottom')
    ).to.equal('75px');
    sandbox.restore();
  });
});
