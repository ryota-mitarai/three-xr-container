import XRSpace from './XRSpace';

export default class XRReferenceSpace extends XRSpace {
  constructor(session) {
    super(session);
  }

  getOffsetReferenceSpace(originOffset) {
    return this;
  }
}
