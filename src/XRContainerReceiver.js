import * as THREE from 'three';
import { EventDispatcher } from 'three';

import { event_childBuffer } from './events';

import {
  event_camera,
  event_canvas,
  event_open,
  event_sessionStarted,
  event_sessionEnded,
  event_render,
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

    document.addEventListener(event_render().type, this.render);

    const xr = new XR();
    delete navigator.xr;
    Object.defineProperty(navigator, 'xr', {
      get() {
        return xr;
      },
    });

    // const gl = this.renderer.getContext('webgl');

    // class modifiedXRWebGLLayer extends XRWebGLLayer {
    //   constructor(session, context, options) {
    //     super(session, context, options);

    //     this.xrFramebuffer = gl.createFramebuffer();

    //     window.childFrameBuffer = this.xrFramebuffer;
    //   }
    // }

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

  render = () => {
    this.renderer.render(this.scene, this.camera);
  };

  tick = () => {
    const { x, y } = this.renderer.getSize(new THREE.Vector2());
    if (this.x !== x || this.y !== y) {
      this.buffer = new Uint8Array(x * y * 4);
      this.x = x;
      this.y = y;
    }

    const gl = this.renderer.getContext('webgl');

    //TODO: this.x and this.y are not the correct coordinates to read from in XR
    //maybe just read the viewport from XRWebGLLayer

    gl.readPixels(0, 0, this.x, this.y, gl.RGBA, gl.UNSIGNED_BYTE, this.buffer);

    parent.document.dispatchEvent(event_childBuffer(this.buffer));
  };
}
