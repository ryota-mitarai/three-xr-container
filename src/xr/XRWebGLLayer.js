import { event_resolution, event_childBuffer } from '../events';

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

    this.xrFramebuffer = context.createFramebuffer();
  }

  getViewport(view) {
    document.dispatchEvent(event_resolution(this.framebufferWidth, this.framebufferHeight));

    const viewport = this.session.parentRenderState.baseLayer.getViewport(view);
    return viewport;
  }

  requestViewportScaling(viewportScaleFactor) {}

  get framebuffer() {
    return this.xrFramebuffer;
  }
  set framebuffer(framebuffer) {
    this.xrFramebuffer = framebuffer;
  }

  get framebufferWidth() {
    return this.session.parentRenderState.baseLayer.framebufferWidth;
  }
  set framebufferWidth(framebufferWidth) {}

  get framebufferHeight() {
    return this.session.parentRenderState.baseLayer.framebufferHeight;
  }
  set framebufferHeight(framebufferHeight) {}
}
