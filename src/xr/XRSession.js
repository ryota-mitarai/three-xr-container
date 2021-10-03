import XRFrame from './XRFrame';
import XRReferenceSpace from './XRReferenceSpace';
import XRRenderState from './XRRenderState';

export default class XRSession extends EventTarget {
  constructor() {
    super();

    this.renderState = new XRRenderState(this);
    this._referenceSpace = new XRReferenceSpace(this);

    this.requestedFns = {};
    this.i = 0;

    window.addEventListener('message', (e) => {
      const message = e.data.message;
      const value = e.data.value;

      switch (message) {
        case 'xrcInputSources':
          this._inputSources = value;
          break;
        case 'xrcReferenceSpace':
          this._referenceSpace = value;
          break;
        case 'xrcViewerPose':
          this._fakeViewerPose = value;
          break;
        case 'xrcViewport':
          if (!this.baseLayer) return;

          const { viewports, framebufferWidth, framebufferHeight } = value;

          this.baseLayer.framebufferWidth = framebufferWidth;
          this.baseLayer.framebufferHeight = framebufferHeight;

          const newViewports = {};
          viewports.forEach((viewport) => {
            newViewports[viewport.eye] = viewport;
          });
          this.baseLayer._viewports = newViewports;

          window.postMessage(
            {
              message: 'xrcSetResolution',
              value: { x: framebufferWidth, y: framebufferHeight },
            },
            '*'
          );
          break;
        case 'xrcAnimationFrame':
          const { time } = value;

          const frame = new XRFrame(this._fakeViewerPose, this);

          if (!frame) return;
          if (Object.entries(this.requestedFns).length === 0) return;

          const [id, fn] = Object.entries(this.requestedFns)[0];
          delete this.requestedFns[id];
          fn(time, frame);
          break;
      }
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
    return Promise.resolve(this._referenceSpace);
  };

  updateRenderState = (newState) => {
    this.renderState.update(newState);
  };

  get [Symbol.toStringTag]() {
    return 'XRSession';
  }

  get inputSources() {
    return this._inputSources;
  }

  get baseLayer() {
    return this.renderState.baseLayer;
  }
  set baseLayer(baseLayer) {
    this.updateRenderState({ baseLayer });
  }
}
