import { XRRigidTransform } from 'three';
import { XRViewport } from 'three';

export default class XRView {
  constructor(eye = 'left', session) {
    this.eye = eye;
    this.transform = new XRRigidTransform(eye, session);
    this.projectionMatrix =
      eye === 'left' ? session.xrState.leftProjectionMatrix : session.xrState.rightProjectionMatrix;

    this._viewport = new XRViewport(eye, session);
    this._realViewMatrix = this.transform.inverse.matrix;
    this._localViewMatrix = Float32Array.from([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    this.transform.inverse.matrix = this._localViewMatrix;
  }
}
