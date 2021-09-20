import XRSession from "./XRSession";

export default class XR extends EventTarget {
  constructor() {
    super();
  }

  isSessionSupported(mode) {
    return true;
  }

  requestSession = async (mode, options) => {
    if (!this.session) {
      const session = new XRSession(mode, options);

      session.addEventListener("end", () => (this.session = null), {
        once: true,
      });

      this.session = session;
    }
    return this.session;
  };
}
