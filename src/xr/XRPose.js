import XRRigidTransform from './XRRigidTransform';

export default class XRPose {
  constructor() {
    this.transform = new XRRigidTransform();
    this.emulatedPosition = false;
  }
}
