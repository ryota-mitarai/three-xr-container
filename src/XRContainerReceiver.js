import * as THREE from 'three';
import { EventDispatcher } from 'three';

import {
  event_camera,
  event_canvas,
  event_open,
  event_sessionStarted,
  event_sessionEnded,
  event_childBuffer,
  event_resolution,
} from './events';

import XR from './xr/XR';
import XRWebGLLayer from './xr/XRWebGLLayer';

export default class XRContainerReciever extends EventDispatcher {
  constructor(renderer, scene, camera, heightOffset) {
    super();

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.heightOffset = heightOffset;

    this.isPresenting = false;

    document.addEventListener(event_open().type, this.init, { once: true });
  }

  init = () => {
    parent.dispatchEvent(event_canvas(this.renderer.domElement));

    document.addEventListener(event_camera().type, this.updateCamera);

    document.addEventListener(event_sessionStarted().type, this.onSessionStarted);
    document.addEventListener(event_sessionEnded().type, this.onSessionEnded);

    document.addEventListener(event_resolution().type, (e) => {
      this.resolution = e.detail;
    });

    const xr = new XR();
    delete navigator.xr;
    Object.defineProperty(navigator, 'xr', {
      get() {
        return xr;
      },
    });

    window.XRWebGLLayer = XRWebGLLayer;
  };

  onSessionStarted = async () => {
    const session = await navigator.xr.requestSession();
    this.renderer.xr.setSession(session);
    this.isPresenting = true;
  };

  onSessionEnded = async () => {
    this.isPresenting = false;
  };

  updateCamera = (e) => {
    if (!this.camera) return;

    this.renderer.clear();

    const data = e.detail;
    data.pos.y += this.heightOffset;
    this.camera.position.copy(data.pos);
    this.camera.rotation.copy(data.rot);
  };

  tick = () => {
    const { x, y } = this.resolution ? this.resolution : this.renderer.getSize(new THREE.Vector2());

    if (this.x !== x || this.y !== y) {
      this.buffer = new Uint8Array(x * y * 4);
      this.x = x;
      this.y = y;

      this.renderTarget = new THREE.WebGLRenderTarget(this.x, this.y);
      this.renderer.setRenderTarget(this.renderTarget);
    }

    this.renderer.readRenderTargetPixels(this.renderTarget, 0, 0, this.x, this.y, this.buffer);

    parent.document.dispatchEvent(event_childBuffer(this.buffer));
  };
}
