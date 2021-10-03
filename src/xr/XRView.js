import XRRigidTransform from './XRRigidTransform';

export default class XRView {
  constructor(view) {
    this.eye = view.eye;
    this.projectionMatrix = view.projectionMatrix;
    this.isFirstPersonObserver = view.isFirstPersonObserver;
    this.recommendedViewportScale = view.recommendedViewportScale;
    this.transform = new XRRigidTransform(view.transform);
  }
}
