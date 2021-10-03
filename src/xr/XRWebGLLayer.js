import XRViewport from './XRViewport';

export default class XRWebGLLayer {
  constructor(session, context, options = {}) {
    this.session = session;
    this.context = context;

    const { antialias = true, depth = false, stencil = false, alpha = true } = options;

    this.antialias = antialias;
    this.depth = depth;
    this.stencil = stencil;
    this.alpha = alpha;

    this._framebuffer = context.createFramebuffer();

    this._viewports = {
      left: new XRViewport({ x: 0, y: 0, width: 0, height: 0 }, 'left'),
      right: new XRViewport({ x: 0, y: 0, width: 0, height: 0 }, 'right'),
    };
    this._framebufferWidth = 0;
    this._framebufferHeight = 0;
  }

  getViewport = (view) => {
    return this._viewports[view.eye];
  };

  requestViewportScaling(viewportScaleFactor) {}

  get framebuffer() {
    return this._framebuffer;
  }
  set framebuffer(framebuffer) {
    this._framebuffer = framebuffer;
  }

  get framebufferWidth() {
    return this._framebufferWidth;
  }
  set framebufferWidth(framebufferWidth) {}

  get framebufferHeight() {
    return this._framebufferHeight;
  }
  set framebufferHeight(framebufferHeight) {}
}
