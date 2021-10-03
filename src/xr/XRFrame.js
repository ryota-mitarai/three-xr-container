export default class XRFrame {
  constructor(fakeViewerPose, session) {
    this.session = session;

    this._viewerpose = fakeViewerPose;
  }

  getViewerPose(referenceSpace) {
    return this._viewerpose;
  }

  getPose(sourceSpace, destinationSpace) {
    return sourceSpace._pose;
  }

  getJointPose(sourceSpace, destinationSpace) {
    return sourceSpace._pose;
  }
}
