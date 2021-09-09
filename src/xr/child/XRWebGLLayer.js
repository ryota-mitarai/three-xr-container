export default class XRWebGLLayer {
  constructor(session, context, options = {}) {
    this.session = session;
    this.context = context;

    const {
      antialias = true,
      depth = false,
      stencil = false,
      alpha = true,
      framebufferScaleFactor = 1,
    } = options;
    this.antialias = antialias;
    this.depth = depth;
    this.stencil = stencil;
    this.alpha = alpha;

    this.xrFramebuffer = null;
  }

  getViewport(view) {
    return view._viewport;
  }

  requestViewportScaling(viewportScaleFactor) {}

  get framebuffer() {
    return this.xrFramebuffer;
  }
  set framebuffer(framebuffer) {}

  get framebufferWidth() {
    return this.session.xrState.renderWidth[0] * 2; //! maybe context.drawingBufferWidth
  }
  set framebufferWidth(framebufferWidth) {}

  get framebufferHeight() {
    return this.session.xrState.renderHeight[0]; //!
  }
  set framebufferHeight(framebufferHeight) {}
}
