import * as THREE from 'three';

export default class XRContainerReciever {
  constructor(renderer, scene, camera, heightOffset) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.heightOffset = heightOffset;

    this.isPresenting = false;
    this.VRCameraInfo = [{}, {}];

    this.VRCameras = new THREE.ArrayCamera([
      new THREE.PerspectiveCamera(),
      new THREE.PerspectiveCamera(),
    ]);

    onmessage = this.receiveMessage;
  }

  init = () => {};

  receiveMessage = (e) => {
    const message = e.data.message;
    const value = e.data.value;

    switch (message) {
      case 'xrcOpen':
        this.init();
        break;
      case 'xrcSessionStart':
        this.onSessionStarted();
        break;
      case 'xrcSessionEnd':
        this.onSessionEnded();
        break;
      case 'xrcSetCamera':
        this.updateCamera(value);
        break;
      case 'xrcSetResolution':
        this.resolution = value;
        break;
      case 'xrcViewport':
        this.viewports = value.viewports;
        this.framebufferWidth = value.framebufferWidth;
        this.framebufferHeight = value.framebufferHeight;
        break;
      case 'xrcSetArrayCamera':
        this.setArrayCamera(value);
        break;
      case 'xrcSetVRCamera':
        this.setVRCamera(value);
        break;
    }
  };

  setArrayCamera = ({
    fov,
    matrixWorld,
    matrixWorldInverse,
    projectionMatrix,
    projectionMatrixInverse,
    position,
    quaternion,
    offsetPos,
  }) => {
    const camera = this.VRCameras;
    camera.matrixAutoUpdate = false;
    camera.fov = fov;

    matrixWorld[14] += offsetPos[2];
    matrixWorld[13] += offsetPos[1];
    matrixWorld[12] += offsetPos[0];
    camera.matrixWorld.fromArray(matrixWorld);
    camera.matrixWorldInverse.fromArray(matrixWorldInverse);
    camera.projectionMatrix.fromArray(projectionMatrix);
    camera.projectionMatrixInverse.fromArray(projectionMatrixInverse);
    // camera.position.fromArray(position);
    // camera.quaternion.fromArray(quaternion);
    // camera.updateMatrix();
    // camera.updateMatrixWorld();
  };

  setVRCamera = ({
    i,
    fov,
    viewport,
    matrixWorld,
    projectionMatrix,
    projectionMatrixInverse,
    offsetPos,
  }) => {
    const camera = this.VRCameras.cameras[i];
    camera.matrixAutoUpdate = false;
    camera.fov = fov;
    camera.viewport = viewport;

    matrixWorld[14] += offsetPos[2];
    matrixWorld[13] += offsetPos[1];
    matrixWorld[12] += offsetPos[0];
    camera.matrixWorld.fromArray(matrixWorld);
    camera.matrixWorldInverse = camera.matrixWorld.clone().invert();
    camera.projectionMatrix.fromArray(projectionMatrix);
    camera.projectionMatrixInverse.fromArray(projectionMatrixInverse);

    camera.position.fromArray(offsetPos);
  };

  VRRender = (renderer, scene) => {
    renderer.render(scene, this.VRCameras);
  };

  onSessionStarted = () => {
    this.isPresenting = true;
  };

  onSessionEnded = () => {
    this.isPresenting = false;
  };

  updateCamera = ({ pos, rot }) => {
    if (this.isPresenting === true) {
      if (!this.player) return;
      this.player.position.copy(pos);
    } else {
      if (!this.camera) return;
      this.camera.position.copy(pos);
      this.camera.rotation.copy(rot);
    }
  };

  tick = (player, renderer, scene) => {
    this.player = player;
    this.renderer = renderer;

    renderer.clear();
  };

  tock = () => {};
}
