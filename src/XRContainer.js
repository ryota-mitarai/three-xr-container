import * as THREE from 'three';
import { EventDispatcher } from 'three';

import { fragmentShader, vertexShader } from './shaders';

import {
  event_camera,
  event_canvas,
  event_open,
  event_sessionStarted,
  event_sessionEnded,
  event_childBuffer,
  event_render,
  event_animationFrame,
} from './events';

export default class XRContainer extends EventDispatcher {
  constructor(url, width, height, depth) {
    super();

    this.didTellChildSessionStarted = false;

    window.addEventListener(event_canvas().type, this.handleCanvas);

    {
      //init three
      this.object = new THREE.Group();

      const geometry1 = new THREE.BoxBufferGeometry(width, height, depth);
      const material1 = new THREE.MeshBasicMaterial({
        colorWrite: false,
        side: THREE.DoubleSide,
      });
      this.mesh = new THREE.Mesh(geometry1, material1);
      this.mesh.geometry.computeBoundingSphere();

      this.object.add(this.mesh);

      const geometry2 = new THREE.EdgesGeometry(geometry1);
      const material2 = new THREE.LineBasicMaterial({ color: '#ffffff' });
      const wireframe = new THREE.LineSegments(geometry2, material2);

      this.object.add(wireframe);
    }

    {
      //init iframe
      const div = document.createElement('div');
      div.style.overflow = 'hidden';
      div.style.position = 'relative';

      const iframe = (this.iframe = document.createElement('iframe'));
      iframe.src = url;

      iframe.style.position = 'absolute';
      iframe.style.top = '100%';
      iframe.style.left = '100%';
      iframe.style.visibility = 'hidden';

      div.appendChild(iframe);
      document.body.appendChild(div);

      this.iframe.addEventListener(
        'load',
        () => {
          this.iframe.contentDocument.dispatchEvent(event_open());
        },
        { once: true }
      );
    }

    document.addEventListener(event_childBuffer().type, (event) => {
      this.childBuffer = event.detail;
    });
  }

  handleCanvas = (e) => {
    const canvas = e.detail;

    this.texture = new THREE.CanvasTexture(canvas);
  };

  onCanvasResize = (canvas) => {
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;

    this.iframe.width = canvas.width;
    this.iframe.height = canvas.height;
  };

  render = (renderer, camera, time, frame) => {
    this.iframe.contentDocument.dispatchEvent(event_animationFrame(time, frame));

    const gl = renderer.getContext();

    if (!this.parentBuffer) {
      this.parentBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    }

    if (this.didTellChildSessionStarted === false && renderer.xr.isPresenting === true) {
      this.didTellChildSessionStarted = true;
      this.iframe.contentDocument.dispatchEvent(event_sessionStarted());
    } else if (this.didTellChildSessionStarted === true && renderer.xr.isPresenting === false) {
      this.didTellChildSessionStarted = false;
      this.iframe.contentDocument.dispatchEvent(event_sessionEnded());
    }

    const layer = frame?.session.renderState.baseLayer;

    const resolution = layer
      ? new THREE.Vector2(layer.framebufferWidth, layer.framebufferHeight)
      : renderer.getSize(new THREE.Vector2());

    const texture = new THREE.DataTexture(
      this.childBuffer,
      resolution.x,
      resolution.y,
      THREE.RGBAFormat
    );

    const newMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_resolution: { value: resolution },
        u_texture: { value: texture },
      },

      vertexShader: vertexShader,
      fragmentShader: fragmentShader,

      side: THREE.DoubleSide,
    });

    if (this.mesh.material.uniforms) {
      this.mesh.material.uniforms.u_texture.value.dispose();
    }

    this.mesh.material.dispose();
    this.mesh.material = newMaterial;

    const canvas = renderer.domElement;
    if (this.canvasWidth !== canvas.width || this.canvasHeight !== canvas.height) {
      this.onCanvasResize(canvas);
    }

    const relativePosition = camera.position
      .clone()
      .sub(this.object.getWorldPosition(new THREE.Vector3()));
    this.iframe.contentDocument.dispatchEvent(event_camera(relativePosition, camera.rotation));
  };
}
