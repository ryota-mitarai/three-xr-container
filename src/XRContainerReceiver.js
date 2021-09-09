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
import XR from './xr/child/XR';
import XRWebGLLayer from './xr/child/XRWebGLLayer';

export default class XRContainerReciever extends EventDispatcher {
  renderer;
  scene;
  camera;
  heightOffset;

  isPresenting;

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

    document.addEventListener(event_childBuffer().type, this.onChildBuffer);

    const xr = new XR();
    delete navigator.xr;
    Object.defineProperty(navigator, 'xr', {
      get() {
        return xr;
      },
    });

    const gl = this.renderer.getContext('webgl');

    class modifiedXRWebGLLayer extends XRWebGLLayer {
      constructor(session, context, options) {
        super(session, context, options);

        this.xrFramebuffer = gl.createFramebuffer();

        window.childFrameBuffer = this.xrFramebuffer;
      }
    }

    window.XRWebGLLayer = modifiedXRWebGLLayer;
  };

  onChildBuffer = (e) => {
    this.framebuffer = e.detail;
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
    const gl = this.renderer.getContext('webgl');

    // if (!this.framebuffer) return;
    // gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

    const { x, y } = this.renderer.getSize(new THREE.Vector2());
    const buffer = new Uint8Array(x * y * 4);
    gl.readPixels(0, 0, x, y, gl.RGBA, gl.UNSIGNED_BYTE, buffer);

    parent.document.dispatchEvent(event_childBuffer(buffer));
  };
}
