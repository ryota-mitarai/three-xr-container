import * as THREE from 'three';

import { fragmentShader, fragmentShaderVR, vertexShader } from './shaders';

import XRViewport from './xr/XRViewport';
import XRInputSource from './xr/XRInputSource';
import XRReferenceSpace from './xr/XRReferenceSpace';
import XRViewerPose from './xr/XRViewerPose';

export default class XRContainer {
  constructor(url, containerWidth, containerHeight, containerDepth) {
    this.childIsPresenting = false;

    this.containerHeight = containerHeight;

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.worker = new Worker(new URL('./child.js', import.meta.url), { type: 'module' });

    window.addEventListener('message', this.receiveMessage);
    {
      const canvas = document.querySelector('#LEFT');
      canvas.width = width;
      canvas.height = height;
      canvas.style.position = 'absolute';
      canvas.style.top = '-1000%';
      canvas.style.left = '-1000%';
      this.childTexture = new THREE.CanvasTexture(canvas);
      this.offscreenCanvas = canvas.transferControlToOffscreen();

      this.worker.postMessage(
        {
          message: 'init',
          value: { canvas: this.offscreenCanvas },
        },
        [this.offscreenCanvas]
      );
    }

    {
      //init three
      this.object = new THREE.Group();

      const geometry1 = new THREE.BoxBufferGeometry(
        containerWidth,
        containerHeight,
        containerDepth
      );
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

      this.orthoCamera = new THREE.OrthographicCamera(
        width / -2,
        width / 2,
        height / 2,
        height / -2,
        1,
        100
      );
      this.orthoCamera.position.z = 5;
    }
  }

  receiveMessage = (e) => {
    const message = e.data.message;
    const value = e.data.value;
  };

  onCanvasResize = (canvas) => {
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
  };

  tick = (renderer, camera, player, time, frame) => {
    if (this.childIsPresenting !== renderer.xr.isPresenting) {
      this.childIsPresenting = renderer.xr.isPresenting;

      if (renderer.xr.isPresenting === true) {
        this.worker.postMessage({ message: 'xrcSessionStart' });
      } else {
        this.worker.postMessage({ message: 'xrcSessionEnd' });
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
        this.worker.postMessage({
          message: 'xrcReferenceSpace',
          value: fakeReferenceSpace,
        });

        //viewer pose
        const fakeViewerPose = new XRViewerPose(viewerPose);
        this.worker.postMessage({
          message: 'xrcViewerPose',
          value: fakeViewerPose,
        });

        //input sources
        const inputSources = session.inputSources;
        const inputSourceList = Object.values(inputSources).map((input) => {
          return new XRInputSource(input, session);
        });

        const fakeInputSources = Object.assign({}, inputSourceList);
        fakeInputSources.length = inputSourceList.length;

        this.worker.postMessage({
          message: 'xrcInputSources',
          value: fakeInputSources,
        });

        //viewport
        const baseLayer = session.renderState.baseLayer;

        const framebufferWidth = baseLayer.framebufferWidth;
        const framebufferHeight = baseLayer.framebufferHeight;

        const viewports = viewerPose.views.map((view) => {
          return new XRViewport(baseLayer.getViewport(view), view.eye);
        });

        this.worker.postMessage({
          message: 'xrcViewport',
          value: { viewports, framebufferWidth, framebufferHeight },
        });
      }
    }

    const user = this.childIsPresenting === true ? player : camera;
    const userPos = user.getWorldPosition(new THREE.Vector3());
    const containerPos = this.object.getWorldPosition(new THREE.Vector3());

    const offsetPos = new THREE.Vector3(
      userPos.x - containerPos.x,
      userPos.y - (containerPos.y - this.containerHeight / 2),
      userPos.z - containerPos.z
    );

    const offsetPosVR = new THREE.Vector3(
      -containerPos.x,
      userPos.y - (containerPos.y - this.containerHeight / 2),
      -containerPos.z
    );

    this.worker.postMessage({
      message: 'xrcSetCamera',
      value: { pos: offsetPos, rot: camera.rotation.clone() },
    });

    if (this.childIsPresenting === true) {
      {
        const {
          fov,
          projectionMatrix,
          projectionMatrixInverse,
          matrixWorld,
          matrixWorldInverse,
          position,
          quaternion,
        } = renderer.xr.getCamera();

        this.worker.postMessage({
          message: 'xrcSetArrayCamera',
          value: {
            fov,
            matrixWorld: matrixWorld.toArray(),
            matrixWorldInverse: matrixWorldInverse.toArray(),
            projectionMatrix: projectionMatrix.toArray(),
            projectionMatrixInverse: projectionMatrixInverse.toArray(),
            position: position.toArray(),
            quaternion: quaternion.toArray(),
            offsetPos: offsetPosVR.toArray(),
          },
        });
      }

      renderer.xr.getCamera().cameras.forEach((camera, i) => {
        const {
          fov,
          viewport,
          matrixWorld,
          matrixWorldInverse,
          projectionMatrix,
          projectionMatrixInverse,
        } = camera;

        this.worker.postMessage({
          message: 'xrcSetVRCamera',
          value: {
            i,
            fov,
            viewport,
            matrixWorld: matrixWorld.toArray(),
            matrixWorldInverse: matrixWorldInverse.toArray(),
            projectionMatrix: projectionMatrix.toArray(),
            projectionMatrixInverse: projectionMatrixInverse.toArray(),
            offsetPos: offsetPosVR.toArray(),
          },
        });
      });
    }

    this.worker.postMessage({
      message: 'xrcAnimationFrame',
      value: { time },
    });

    const layer = frame?.session.renderState.baseLayer;
    const resolution = layer
      ? new THREE.Vector2(layer.framebufferWidth, layer.framebufferHeight)
      : renderer.getSize(new THREE.Vector2());

    this.resolution = resolution;

    if (this.buffer?.length !== resolution.x * resolution.y * 4) {
      this.buffer = new Uint8Array(resolution.x * resolution.y * 4);
    }

    const canvas = renderer.domElement;
    if (this.canvasWidth !== canvas.width || this.canvasHeight !== canvas.height) {
      this.onCanvasResize(canvas);
    }
  };

  tock = (renderer, camera) => {
    this.childTexture.needsUpdate = true;

    if (this.childIsPresenting === false) {
      const newMaterial = new THREE.ShaderMaterial({
        uniforms: {
          u_resolution: { value: this.resolution },
          u_texture: { value: this.childTexture },
        },

        vertexShader: vertexShader,
        fragmentShader: fragmentShader,

        transparent: true,
        side: THREE.DoubleSide,
      });

      this.mesh.material.uniforms?.u_texture.value.dispose();
      this.mesh.material.dispose();
      this.mesh.material = newMaterial;
    } else {
      const newMaterial = new THREE.ShaderMaterial({
        uniforms: {
          u_resolution: { value: this.resolution },
          u_texture: { value: this.childTexture },
        },

        vertexShader: vertexShader,
        fragmentShader: fragmentShader,

        transparent: true,
        side: THREE.DoubleSide,
      });

      this.mesh.material.uniforms?.u_texture.value.dispose();
      this.mesh.material.dispose();
      this.mesh.material = newMaterial;
    }
  };
}
