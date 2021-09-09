export default class XRSession extends EventTarget {
  constructor(session) {
    super();

    this.session = session;

    this.animationFrameFunctions = [];
    this.animationFrameCounter = 0;

    session.requestAnimationFrame((timestamp, frame) => {
      this.animationFrameFunctions.forEach((obj) => obj.fn(timestamp, frame));
      this.animationFrameFunctions = [];
    });
  }

  requestAnimationFrame = (fn) => {
    const id = this.animationFrameCounter++;
    this.animationFrameFunctions.push({ id: id, fn: fn });
    return id;
  };

  cancelAnimationFrame = (id) => {
    const obj = this.animationFrameFunctions.find((obj) => obj.id === id);
    const index = this.animationFrameFunctions.indexOf(obj);
    this.animationFrameFunctions[index] = () => {};
  };

  requestReferenceSpace = (type, options = {}) => {
    return this.session.requestReferenceSpace(type, options);
  };

  end = () => {
    this.session.end();
  };

  requestHitTestSource = () => {
    return this.session.requestHitTestSource();
  };
  requestHitTestSourceForTransientInput = () => {
    return this.session.requestHitTestSourceForTransientInput();
  };
  requestLightProbe = () => {
    return this.session.requestLightProbe();
  };
  requestReferenceSpace = (type) => {
    return this.session.requestReferenceSpace(type);
  };
  updateRenderState = () => {
    return this.session.updateRenderState();
  };

  get [Symbol.toStringTag]() {
    return 'XRSession';
  }

  get depthDataFormat() {
    return this.session.depthDataFormat;
  }

  get depthUsage() {
    return this.session.depthUsage;
  }

  get domOverlayState() {
    return this.session.domOverlayState;
  }

  get environmentBlendMode() {
    return this.session.environmentBlendMode;
  }

  get inputSources() {
    return this.session.inputSources;
  }

  get interactionMode() {
    return this.session.interactionMode;
  }

  get onend() {
    return this.session.onend;
  }
  set onend(fn) {
    this.session.onend = fn;
  }

  get oninputsourceschange() {
    return this.session.oninputsourceschange;
  }
  set oninputsourceschange(fn) {
    this.session.oninputsourceschange = fn;
  }

  get onselect() {
    return this.session.onselect;
  }
  set onselect(fn) {
    this.session.onselect = fn;
  }

  get onselectend() {
    return this.session.onselectend;
  }
  set onselectend(fn) {
    this.session.onselectend = fn;
  }

  get onselectstart() {
    return this.session.onselectstart;
  }
  set onselectstart(fn) {
    this.session.onselectstart = fn;
  }

  get onsqueeze() {
    return this.session.onsqueeze;
  }
  set onsqueeze(fn) {
    this.session.onsqueeze = fn;
  }

  get onsqueezeend() {
    return this.session.onsqueezeend;
  }
  set onsqueezeend(fn) {
    this.session.onsqueezeend = fn;
  }

  get onsqueezestart() {
    return this.session.onsqueezestart;
  }
  set onsqueezestart(fn) {
    this.session.onsqueezestart = fn;
  }

  get onvisibilitychange() {
    return this.session.onvisibilitychange;
  }
  set onvisibilitychange(fn) {
    this.session.onvisibilitychange = fn;
  }

  get preferredReflectionFormat() {
    return this.session.preferredReflectionFormat;
  }

  get visibilityState() {
    return this.session.visibilityState;
  }

  get renderState() {
    return this.session.renderState;
  }
}
