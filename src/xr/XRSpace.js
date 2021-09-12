import XRPose from './XRPose';

export default class XRSpace extends EventTarget {
  constructor(session) {
    super();

    this._pose = new XRPose(session);
  }
}
