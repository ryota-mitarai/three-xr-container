import { event_animationFrame } from '../events';
import XRRenderState from './XRRenderState';

export default class XRSession extends EventTarget {
  constructor(xrOffsetMatrix) {
    super();

    this.renderState = new XRRenderState(this);

    this.requestedFns = {};
    this.i = 0;

    this.waitForSession = async () => {
      return new Promise((resolve, reject) => {
        document.addEventListener(
          event_animationFrame().type,
          (e) => {
            const { frame } = e.detail;
            if (frame.session) resolve(frame.session);
            reject();
          },
          {
            once: true,
          }
        );
      });
    };

    document.addEventListener(event_animationFrame().type, (e) => {
      const { time, frame } = e.detail;
      if (!frame) return;
      if (Object.entries(this.requestedFns).length === 0) return;

      this.parentSession = frame.session;
      this.parentRenderState = this.parentSession.renderState;

      const [id, fn] = Object.entries(this.requestedFns)[0];
      delete this.requestedFns[id];
      fn(time, frame);
    });
  }

  requestAnimationFrame = (fn) => {
    this.requestedFns[++this.i] = fn;
    return this.i;
  };

  cancelAnimationFrame = (id) => {
    delete this.requestedFns[id];
  };

  requestReferenceSpace = async (type, options = {}) => {
    const session = this.parentSession ?? (await this.waitForSession());
    return session.requestReferenceSpace(type, options);
  };

  updateRenderState = (newState) => {
    this.renderState.update(newState);
  };

  get [Symbol.toStringTag]() {
    return 'XRSession';
  }

  get inputSources() {
    return this.parentSession.inputSources;
  }

  get baseLayer() {
    return this.renderState.baseLayer;
  }
  set baseLayer(baseLayer) {
    this.updateRenderState({ baseLayer });
  }

  // async end() {
  //   await this.onexitpresent();
  //   this.dispatchEvent(new CustomEvent('end'));
  // }
  //
  // get onblur() {
  //   return _elementGetter(this, 'blur');
  // }
  // set onblur(onblur) {
  //   _elementSetter(this, 'blur', onblur);
  // }
  // get onfocus() {
  //   return _elementGetter(this, 'focus');
  // }
  // set onfocus(onfocus) {
  //   _elementSetter(this, 'focus', onfocus);
  // }
  // get onresetpose() {
  //   return _elementGetter(this, 'resetpose');
  // }
  // set onresetpose(onresetpose) {
  //   _elementSetter(this, 'resetpose', onresetpose);
  // }
  // get onend() {
  //   return _elementGetter(this, 'end');
  // }
  // set onend(onend) {
  //   _elementSetter(this, 'end', onend);
  // }
  // get onselect() {
  //   return _elementGetter(this, 'select');
  // }
  // set onselect(onselect) {
  //   _elementSetter(this, 'select', onselect);
  // }
  // get onselectstart() {
  //   return _elementGetter(this, 'selectstart');
  // }
  // set onselectstart(onselectstart) {
  //   _elementSetter(this, 'selectstart', onselectstart);
  // }
  // get onselectend() {
  //   return _elementGetter(this, 'selectend');
  // }
  // set onselectend(onselectend) {
  //   _elementSetter(this, 'selectend', onselectend);
  // }
}
