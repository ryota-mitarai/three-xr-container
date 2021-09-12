import XRBoundedReferenceSpace from './XRBoundedReferenceSpace';
import XRRenderState from './XRRenderState';

export default class XRSession extends EventTarget {
  constructor(xrOffsetMatrix) {
    super();

    this._referenceSpace = new XRBoundedReferenceSpace(this);
    this.renderState = new XRRenderState(this);
  }

  requestAnimationFrame = (fn) => {};

  cancelAnimationFrame = (id) => {};

  requestReferenceSpace = (type, options = {}) => {
    return Promise.resolve(this._referenceSpace);
  };

  updateRenderState = (newState) => {
    this.renderState.update(newState);
  };

  get [Symbol.toStringTag]() {
    return 'XRSession';
  }
}
