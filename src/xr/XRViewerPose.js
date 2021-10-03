import XRPose from './XRPose';
import XRRigidTransform from './XRRigidTransform';
import XRView from './XRView';

export default class XRViewerPose extends XRPose {
  constructor(viewerPose) {
    super();

    this.emulatedPosition = viewerPose.emulatedPosition;
    this.transform = new XRRigidTransform(viewerPose.transform);

    this.views = viewerPose.views.map((view) => {
      return new XRView(view);
    });
  }
}
