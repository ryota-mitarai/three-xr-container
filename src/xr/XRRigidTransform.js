import * as THREE from 'three';

export default class XRRigidTransform {
  constructor(xrRigidTransform, isInverse = false) {
    if (xrRigidTransform) {
      this.matrix = xrRigidTransform.matrix;
      this.orientation = xrRigidTransform.orientation;
      this.position = xrRigidTransform.position;

      if (isInverse !== true) {
        this.inverse = new XRRigidTransform(xrRigidTransform.inverse, true);
      }
    } else {
      this.matrix = [];
      this.inverse = [];

      this.orientation = { x: 0, y: 0, z: 0, w: 1 };
      this.position = { x: 0, y: 0, z: 0, w: 1 };

      this._orientation = [0, 0, 0, 1];
      this._position = [0, 0, 0];
      this._scale = [1, 1, 1];

      const matrix = new THREE.Matrix4();
      matrix.compose(
        new THREE.Vector3().fromArray(this._position),
        new THREE.Quaternion().fromArray(this._orientation),
        new THREE.Vector3().fromArray(this._scale)
      );

      matrix.toArray(this.matrix);
      matrix.invert().toArray(this.inverse);

      this.matrix = Float32Array.from(this.matrix);

      this.inverse = {
        matrix: Float32Array.from(this.inverse),
        orientation: this.orientation,
        position: this.position,
        inverse: this,
      };
    }
  }
}
