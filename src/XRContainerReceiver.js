import * as THREE from 'three';

import XR from './xr/XR';
import XRWebGLLayer from './xr/XRWebGLLayer';

export default class XRContainerReciever {
  constructor(renderer, scene, camera, heightOffset) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.heightOffset = heightOffset;

    this.isPresenting = false;

    window.addEventListener('message', this.receiveMessage);
  }

  init = () => {
    const xr = new XR();
    delete navigator.xr;
    Object.defineProperty(navigator, 'xr', {
      get() {
        return xr;
      },
    });

    window.XRWebGLLayer = XRWebGLLayer;
  };

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
    }
  };

  onSessionStarted = async () => {
    const session = await navigator.xr.requestSession();
    await this.renderer.xr.setSession(session);
    this.isPresenting = true;
  };

  onSessionEnded = async () => {
    this.isPresenting = false;
  };

  updateCamera = (value) => {
    if (this.isPresenting === true) {
      if (!this.player) return;
      this.player.position.copy(value.pos);
    } else {
      if (!this.camera) return;
      this.camera.position.copy(value.pos);
      this.camera.rotation.copy(value.rot);
    }
  };

  tick = (player) => {
    this.player = player;

    this.renderer.clear();
  };

  tock = () => {
    if (this.isPresenting === true && !this.resolution) return;

    const { x, y } = this.resolution ?? this.renderer.getSize(new THREE.Vector2());

    if (this.x !== x || this.y !== y) {
      this.buffer = new Uint8Array(x * y * 4);
      this.x = x;
      this.y = y;

      this.renderTarget = new THREE.WebGLRenderTarget(this.x, this.y);
      this.renderer.setRenderTarget(this.renderTarget);
    }

    this.renderer.readRenderTargetPixels(this.renderTarget, 0, 0, this.x, this.y, this.buffer);
    window.parent.postMessage({ message: 'xrcSetChildBuffer', value: this.buffer }, '*');
  };
}
