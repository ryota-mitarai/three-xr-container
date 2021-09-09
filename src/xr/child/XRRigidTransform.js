import * as THREE from 'three';
import DOMPoint from './DOMPoint';

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localMatrix = new THREE.Matrix4();

export default class XRRigidTransform extends EventTarget {
  constructor(position, orientation, scale) {
    super();

    if (typeof position == 'object') {
      const inverse = orientation instanceof XRRigidTransform ? orientation : null;

      this.initialize(position, inverse);
    } else if (typeof position === 'string') {
      const eye = position;
      const session = orientation;

      const result = new XRRigidTransform();
      result.inverse.matrix =
        eye === 'left' ? session.xrState.leftViewMatrix : session.xrState.rightViewMatrix; // XXX share all other XRRigidTransform properties
      return result;
    } else {
      this.initialize();

      if (!position) {
        position = { x: 0, y: 0, z: 0 };
      }
      if (!orientation) {
        orientation = { x: 0, y: 0, z: 0, w: 1 };
      }
      if (!scale) {
        scale = { x: 1, y: 1, z: 1 };
      }

      this._position._buffer[0] = position.x;
      this._position._buffer[1] = position.y;
      this._position._buffer[2] = position.z;

      this._orientation._buffer[0] = orientation.x;
      this._orientation._buffer[1] = orientation.y;
      this._orientation._buffer[2] = orientation.z;
      this._orientation._buffer[3] = orientation.w;

      this._scale._buffer[0] = scale.x;
      this._scale._buffer[1] = scale.y;
      this._scale._buffer[2] = scale.z;

      localMatrix
        .compose(
          localVector.fromArray(this._position._buffer),
          localQuaternion.fromArray(this._orientation._buffer),
          localVector2.fromArray(this._scale._buffer)
        )
        .toArray(this.matrix);
      localMatrix.getInverse(localMatrix).toArray(this.matrixInverse);
      localMatrix.decompose(localVector, localQuaternion, localVector2);
      localVector.toArray(this._positionInverse._buffer);
      localQuaternion.toArray(this._orientationInverse._buffer);
      localVector2.toArray(this._scaleInverse._buffer);
    }

    if (!this._inverse) {
      this._inverse = new XRRigidTransform(this._buffer, this);
    }
  }

  initialize = (
    _buffer = new ArrayBuffer((3 + 4 + 3 + 16) * 2 * Float32Array.BYTES_PER_ELEMENT),
    inverse = null
  ) => {
    this._buffer = _buffer;
    this._inverse = inverse;

    {
      let index = this._inverse ? (3 + 4 + 3 + 16) * Float32Array.BYTES_PER_ELEMENT : 0;

      this._position = new DOMPoint(new Float32Array(this._buffer, index, 3));

      index += 3 * Float32Array.BYTES_PER_ELEMENT;

      this._orientation = new DOMPoint(new Float32Array(this._buffer, index, 4));
      index += 4 * Float32Array.BYTES_PER_ELEMENT;

      this._scale = new DOMPoint(new Float32Array(this._buffer, index, 3));
      index += 3 * Float32Array.BYTES_PER_ELEMENT;

      this.matrix = new Float32Array(this._buffer, index, 16);
      index += 16 * Float32Array.BYTES_PER_ELEMENT;
    }
    {
      let index = this._inverse ? 0 : (3 + 4 + 3 + 16) * Float32Array.BYTES_PER_ELEMENT;

      this._positionInverse = new DOMPoint(new Float32Array(this._buffer, index, 3));
      index += 3 * Float32Array.BYTES_PER_ELEMENT;

      this._orientationInverse = new DOMPoint(new Float32Array(this._buffer, index, 4));
      index += 4 * Float32Array.BYTES_PER_ELEMENT;

      this._scaleInverse = new DOMPoint(new Float32Array(this._buffer, index, 3));
      index += 3 * Float32Array.BYTES_PER_ELEMENT;

      this.matrixInverse = new Float32Array(this._buffer, index, 16);
      index += 16 * Float32Array.BYTES_PER_ELEMENT;
    }
  };

  get inverse() {
    return this._inverse;
  }
  set inverse(inverse) {}

  get position() {
    return this._position;
  }
  set position(position) {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          key: 'position',
          value: position,
        },
      })
    );
  }
  get orientation() {
    return this._orientation;
  }
  set orientation(orientation) {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          key: 'orientation',
          value: orientation,
        },
      })
    );
  }
  get scale() {
    return this._scale;
  }
  set scale(scale) {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          key: 'scale',
          value: scale,
        },
      })
    );
  }

  pushUpdate = () => {
    localMatrix
      .compose(
        localVector.fromArray(this._position._buffer),
        localQuaternion.fromArray(this._orientation._buffer),
        localVector2.fromArray(this._scale._buffer)
      )
      .toArray(this.matrix);
    localMatrix.getInverse(localMatrix).toArray(this.matrixInverse);
    localMatrix.decompose(localVector, localQuaternion, localVector2);
    localVector.toArray(this._positionInverse._buffer);
    localQuaternion.toArray(this._orientationInverse._buffer);
    localVector2.toArray(this._scaleInverse._buffer);
  };
}
