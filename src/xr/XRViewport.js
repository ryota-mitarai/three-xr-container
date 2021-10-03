export default class XRViewport {
  constructor(viewport, eye) {
    this.eye = eye;

    this.x = viewport.x;
    this.y = viewport.y;
    this.width = viewport.width;
    this.height = viewport.height;
  }
}
