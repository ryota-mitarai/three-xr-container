export default class XRViewport {
  constructor(eye, session) {
    this.session = session;
    this.eye = eye;
  }
  get x() {
    if (this.session.xrState.stereo[0]) {
      return this.eye === 'left' ? 0 : this.session.xrState.renderWidth[0];
    } else {
      return this.eye === 'left' ? 0 : this.session.xrState.renderWidth[0] * 2;
    }
  }
  set x(x) {}
  get y() {
    return 0;
  }
  set y(y) {}
  get width() {
    if (this.session.xrState.stereo[0]) {
      return this.session.xrState.renderWidth[0];
    } else {
      if (this.eye === 'left') {
        return this.session.xrState.renderWidth[0] * 2;
      } else {
        return 0;
      }
    }
  }
  set width(width) {}
  get height() {
    return this.session.xrState.renderHeight[0];
  }
  set height(height) {}
}
