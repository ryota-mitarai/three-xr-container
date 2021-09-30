import * as THREE from 'three';
import { EventDispatcher } from 'three';

import { fragmentShader, vertexShader } from './shaders';
import {
  event_camera,
  event_open,
  event_sessionStarted,
  event_sessionEnded,
  event_childBuffer,
  event_animationFrame,
} from './events';

export default class XRContainer extends EventDispatcher {
  constructor(url, width, height, depth) {
    super();

    this.childIsPresenting = false;

    this.width = width;
    this.height = height;
    this.depth = depth;

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
  }

  onCanvasResize = (canvas) => {
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;

    this.iframe.width = canvas.width;
    this.iframe.height = canvas.height;
  };

  render = (renderer, camera, time, frame, player) => {
    if (this.childIsPresenting !== renderer.xr.isPresenting) {
      this.childIsPresenting = renderer.xr.isPresenting;

      if (renderer.xr.isPresenting === true) {
        this.iframe.contentDocument.dispatchEvent(event_sessionStarted());
      } else {
        this.iframe.contentDocument.dispatchEvent(event_sessionEnded());
      }
    }

    const user = this.childIsPresenting === true ? player : camera;

    const userPos = user.getWorldPosition(new THREE.Vector3());
    const containerPos = this.object.getWorldPosition(new THREE.Vector3());

    const offsetPos = new THREE.Vector3(
      userPos.x - containerPos.x,
      userPos.y - (containerPos.y - this.height / 2),
      userPos.z - containerPos.z
    );

    this.iframe.contentDocument.dispatchEvent(event_camera(offsetPos, camera.rotation));
    this.iframe.contentDocument.dispatchEvent(event_animationFrame(time, frame));

    const childBuffer = this.iframe.contentDocument.childBuffer;
    const layer = frame?.session.renderState.baseLayer;
    const resolution = layer
      ? new THREE.Vector2(layer.framebufferWidth, layer.framebufferHeight)
      : renderer.getSize(new THREE.Vector2());

    const texture = new THREE.DataTexture(
      childBuffer,
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

      transparent: true,
      side: THREE.DoubleSide,
    });

    this.mesh.material.uniforms?.u_texture.value.dispose();
    this.mesh.material.dispose();
    this.mesh.material = newMaterial;

    const canvas = renderer.domElement;
    if (this.canvasWidth !== canvas.width || this.canvasHeight !== canvas.height) {
      this.onCanvasResize(canvas);
    }
  };
}
