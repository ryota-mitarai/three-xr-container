import * as THREE from 'three';
import { EventDispatcher } from 'three';

import { event_camera, event_canvas, event_open } from './events';

export default class XRContainerReciever extends EventDispatcher {
  camera;
  canvas;

  constructor(canvas, camera, heightOffset) {
    super();

    this.canvas = canvas;
    this.camera = camera;
    this.heightOffset = heightOffset;

    document.addEventListener(event_open().type, this.init, { once: true });
  }

  init = () => {
    window.parent.dispatchEvent(event_canvas(this.canvas));

    document.addEventListener(event_camera().type, this.updateCamera);
  };

  updateCamera = (e) => {
    if (!this.camera) return;

    const data = e.detail;
    data.pos.y += this.heightOffset;
    this.camera.position.copy(data.pos);
    this.camera.rotation.copy(data.rot);
  };
}
