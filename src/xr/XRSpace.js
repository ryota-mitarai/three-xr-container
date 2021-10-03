import XRPose from './XRPose';

export default class XRSpace {
  constructor(session) {
    this._pose = new XRPose(session);
  }
}
