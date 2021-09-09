export default class XRRenderState {
  constructor(session) {
    this.session = session;

    this._inlineVerticalFieldOfView = 90;
    this._baseLayer = null;
    this._outputContext = null;
  }

  get depthNear() {
    return this._depthNear;
  }
  set depthNear(depthNear) {
    this._depthNear = depthNear;
  }

  get depthFar() {
    return this._depthFar;
  }
  set depthFar(depthFar) {
    this._depthFar = depthFar;
  }

  get inlineVerticalFieldOfView() {
    return this._inlineVerticalFieldOfView;
  }
  set inlineVerticalFieldOfView(inlineVerticalFieldOfView) {
    this._inlineVerticalFieldOfView = inlineVerticalFieldOfView;
  }

  get baseLayer() {
    return this._baseLayer;
  }
  set baseLayer(baseLayer) {
    this._baseLayer = baseLayer;
  }

  update(newState) {
    for (const k in newState) {
      this[k] = newState[k];
    }
  }
}
