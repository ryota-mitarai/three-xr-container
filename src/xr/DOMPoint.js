export default class DOMPoint {
  constructor(x, y, z, w) {
    if (typeof x === 'object') {
      this._buffer = x;
    } else {
      if (x === undefined) {
        x = 0;
      }
      if (y === undefined) {
        y = 0;
      }
      if (z === undefined) {
        z = 0;
      }
      if (w === undefined) {
        w = 1;
      }
      this._buffer = Float32Array.from([x, y, z, w]);
    }
  }

  get x() {
    return this._buffer[0];
  }
  set x(x) {
    this._buffer[0] = x;
  }
  get y() {
    return this._buffer[1];
  }
  set y(y) {
    this._buffer[1] = y;
  }
  get z() {
    return this._buffer[2];
  }
  set z(z) {
    this._buffer[2] = z;
  }
  get w() {
    return this._buffer[3];
  }
  set w(w) {
    this._buffer[3] = w;
  }

  fromPoint(p) {
    return new DOMPoint(p.x, p.y, p.z, p.w);
  }
}
