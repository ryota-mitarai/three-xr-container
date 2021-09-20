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

    this.width = context.drawingBufferWidth;
    this.height = context.drawingBufferHeight;

    this.xrFramebuffer = null;
  }

  getViewport(view) {
    return this.session.parentRenderState.baseLayer.getViewport(view);
  }

  //TODO: fix lag when entering XR
  //started happening after i hooked up getViewport() above

  requestViewportScaling(viewportScaleFactor) {}

  get framebuffer() {
    return this.xrFramebuffer;
  }
  set framebuffer(framebuffer) {
    this.xrFramebuffer = framebuffer;
  }

  get framebufferWidth() {
    return this.width;
  }
  set framebufferWidth(framebufferWidth) {}

  get framebufferHeight() {
    return this.height;
  }
  set framebufferHeight(framebufferHeight) {}
}
