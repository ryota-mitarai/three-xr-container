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

    // this.orthoCamera = new THREE.OrthographicCamera(
    //   canvas.width / -2,
    //   canvas.width / 2,
    //   canvas.height / 2,
    //   canvas.height / -2,
    //   1,
    //   1000
    // );
    // this.orthoCamera.position.z = 5;

    // const geometry = new THREE.PlaneGeometry(canvas.width, canvas.height);
    // const material = new THREE.MeshBasicMaterial({
    //   transparent: true,
    //   map: this.texture,
    // });
    // this.renderingPlane = new THREE.Mesh(geometry, material);
  };

  render = (renderer, camera, time, frame) => {
    // if (!this.texture) return;

    // console.log(frame);

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

    const resolution = renderer.getSize(new THREE.Vector2());
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

    //render

    const canvas = renderer.domElement;
    if (this.canvasWidth !== canvas.width || this.canvasHeight !== canvas.height) {
      this.onCanvasResize(canvas);
    }

    // this.texture.needsUpdate = true;

    //render mesh into stencil buffer
    // gl.enable(gl.STENCIL_TEST);
    // gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
    // gl.stencilFunc(gl.ALWAYS, 1, 0xff);
    // gl.stencilMask(0xff);

    // this.mesh.visible = true;
    // renderer.render(this.mesh, camera);
    // this.mesh.visible = false;

    //render the child site into the area marked by the stencil buffer
    // renderer.clearDepth();
    // gl.stencilFunc(gl.EQUAL, 1, 0xff);
    // gl.stencilMask(0x00);

    if (renderer.xr.isPresenting === false) {
      //desktop mode
      // renderer.render(this.renderingPlane, this.orthoCamera);
    } else if (renderer.xr.isPresenting === true) {
      this.iframe.contentDocument.dispatchEvent(event_render());
    }

    // gl.stencilMask(0xff);
    // gl.disable(gl.STENCIL_TEST);

    const relativePosition = camera.position
      .clone()
      .sub(this.object.getWorldPosition(new THREE.Vector3()));
    this.iframe.contentDocument.dispatchEvent(event_camera(relativePosition, camera.rotation));
  };
}
