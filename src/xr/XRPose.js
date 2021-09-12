export default class XRPose {
  constructor(session) {
    this.transform = new XRRigidTransform();
    this.emulatedPosition = false;

    // this._realViewMatrix = this.transform.inverse.matrix;
    // this._localViewMatrix = Float32Array.from([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    // this.transform.inverse.matrix = this._localViewMatrix;
    // this.transform.matrix = session.xrState.poseMatrix; //! what tf is xrState, how to bypass
  }
}
