import Gamepad from './Gamepad';
import XRSpace from './XRSpace';

export default class XRInputSource {
  constructor(xrInputSource, session) {
    this.handedness = xrInputSource.handedness;
    this.profiles = xrInputSource.profiles;
    this.targetRayMode = xrInputSource.targetRayMode;
    this.targetRaySpace = new XRSpace(session, 'targetRay');
    this.gripSpace = new XRSpace(session, 'gripSpace');
    this.gamepad = new Gamepad(xrInputSource.gamepad);
  }
}
