import * as THREE from 'three';

import { fragmentShader, vertexShader } from './shaders';

import XRViewport from './xr/XRViewport';
import XRInputSource from './xr/XRInputSource';
import XRReferenceSpace from './xr/XRReferenceSpace';
import XRViewerPose from './xr/XRViewerPose';

export default class XRContainer {
  constructor(url, width, height, depth) {
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
          this.iframe.contentWindow.postMessage({ message: 'xrcOpen' }, '*');
        },
        { once: true }
      );
    }

    window.addEventListener('message', this.receiveMessage);
  }

  receiveMessage = (e) => {
    const message = e.data.message;
    const value = e.data.value;

    switch (message) {
      case 'xrcSetChildBuffer':
        this.buffer = value;
    }
  };

  onCanvasResize = (canvas) => {
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;

    this.iframe.width = canvas.width;
    this.iframe.height = canvas.height;
  };

  tick = (renderer, camera, player, time, frame) => {
    if (this.childIsPresenting !== renderer.xr.isPresenting) {
      this.childIsPresenting = renderer.xr.isPresenting;

      if (renderer.xr.isPresenting === true) {
        this.iframe.contentWindow.postMessage({ message: 'xrcSessionStart' }, '*');
      } else {
        this.iframe.contentWindow.postMessage({ message: 'xrcSessionEnd' }, '*');
      }
    }

    if (frame) {
      const session = frame.session;
      if (!this.referenceSpace) {
        frame?.session.requestReferenceSpace('local-floor').then((ref) => {
          this.referenceSpace = ref;
        });
      }

      if (this.referenceSpace) {
        const ref = this.referenceSpace;

        const viewerPose = frame.getViewerPose(ref);
        if (!viewerPose) return;

        //reference space
        const fakeReferenceSpace = new XRReferenceSpace(session, 'fakeRefS');
        this.iframe.contentWindow.postMessage(
          {
            message: 'xrcReferenceSpace',
            value: fakeReferenceSpace,
          },
          '*'
        );

        //viewer pose
        const fakeViewerPose = new XRViewerPose(viewerPose);
        this.iframe.contentWindow.postMessage(
          {
            message: 'xrcViewerPose',
            value: fakeViewerPose,
          },
          '*'
        );

        //input sources
        const inputSources = session.inputSources;
        const inputSourceList = Object.values(inputSources).map((input) => {
          return new XRInputSource(input, session);
        });

        const fakeInputSources = Object.assign({}, inputSourceList);
        fakeInputSources.length = inputSourceList.length;

        this.iframe.contentWindow.postMessage(
          {
            message: 'xrcInputSources',
            value: fakeInputSources,
          },
          '*'
        );

        //viewport
        const baseLayer = session.renderState.baseLayer;

        const framebufferWidth = baseLayer.framebufferWidth;
        const framebufferHeight = baseLayer.framebufferHeight;

        const viewports = viewerPose.views.map((view) => {
          return new XRViewport(baseLayer.getViewport(view), view.eye);
        });

        this.iframe.contentWindow.postMessage(
          {
            message: 'xrcViewport',
            value: { viewports, framebufferWidth, framebufferHeight },
          },
          '*'
        );
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

    this.iframe.contentWindow.postMessage(
      {
        message: 'xrcSetCamera',
        value: { pos: offsetPos, rot: camera.rotation.clone() },
      },
      '*'
    );

    this.iframe.contentWindow.postMessage(
      {
        message: 'xrcAnimationFrame',
        value: { time },
      },
      '*'
    );

    const layer = frame?.session.renderState.baseLayer;
    const resolution = layer
      ? new THREE.Vector2(layer.framebufferWidth, layer.framebufferHeight)
      : renderer.getSize(new THREE.Vector2());

    if (this.buffer?.length !== resolution.x * resolution.y * 4) {
      this.buffer = new Uint8Array(resolution.x * resolution.y * 4);
    }

    const texture = new THREE.DataTexture(
      this.buffer,
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
