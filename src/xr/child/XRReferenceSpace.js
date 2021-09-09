import XRSpace from './XRSpace';

export default class XRReferenceSpace extends XRSpace {
  constructor(session) {
    super(session);
  }

  getOffsetReferenceSpace(originOffset) {
    return this; // TODO: do the offsetting
  }

  //TODO: add onreset events
  get onreset() {}
  set onreset(onreset) {}
}
