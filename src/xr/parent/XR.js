import { XRWebGLLayer } from 'three';
import XRSession from './XRSession';

export default class XR extends EventTarget {
  constructor() {
    super();

    this.xr = navigator.xr;
    this.counter = 0;
  }

  isSessionSupported = (mode) => {
    return this.xr.isSessionSupported(mode);
  };

  requestSession = async (mode, options) => {
    if (!this.session) {
      const session = await this.xr.requestSession(mode, options);

      const oldRequestAnimationFrame = session.requestAnimationFrame.bind(session);

      let queuedFns = [];

      session.requestAnimationFrame = (fn) => {
        queuedFns.push(fn);

        const id = oldRequestAnimationFrame(handleAnimationFrame);

        return id;
      };

      const handleAnimationFrame = (time, frame) => {
        const length = queuedFns.length;

        console.log('animation frame 😶', length);

        for (let i = 0; i < length; i++) {
          const fn = queuedFns[i];
          fn(time, frame);
        }

        for (let i = 0; i < length; i++) {
          queuedFns.shift();
        }
      };

      session.addEventListener('end', () => (this.session = null), {
        once: true,
      });
      this.session = session;
    }
    return this.session;
  };

  addRequestAnimationFrame = (fn) => {
    const id = this.counter++;
    this.queuedFns.push({ id: id, fn: fn });
    return id;
  };
}
