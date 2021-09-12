import XRReferenceSpace from './XRReferenceSpace';

export default class XRBoundedReferenceSpace extends XRReferenceSpace {
  constructor(session) {
    super(session);

    this.boundsGeometry = [
      new DOMPoint(-3, -3),
      new DOMPoint(3, -3),
      new DOMPoint(3, 3),
      new DOMPoint(-3, 3),
    ];
    this.emulatedHeight = 0;
  }
}
