import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

export default class CoolXRMovement {
  constructor(renderer, player) {
    this.player = player;
    this.prevTime = performance.now();

    this.speed = 10.0;
    this.friction = 10.0;

    this.direction = new THREE.Vector3();
    this.velocity = new THREE.Vector3();

    this.controller1 = renderer.xr.getController(0);
    this.player.add(this.controller1);

    this.controller2 = renderer.xr.getController(1);
    this.player.add(this.controller2);

    this.controller1.addEventListener('connected', this.onControllerConnected);
    this.controller2.addEventListener('connected', this.onControllerConnected);

    //controller models
    const controllerModelFactory = new XRControllerModelFactory();

    this.controllerGrip1 = renderer.xr.getControllerGrip(0);
    this.controllerGrip1.add(controllerModelFactory.createControllerModel(this.controllerGrip1));
    this.player.add(this.controllerGrip1);

    this.controllerGrip2 = renderer.xr.getControllerGrip(1);
    this.controllerGrip2.add(controllerModelFactory.createControllerModel(this.controllerGrip2));
    this.player.add(this.controllerGrip2);

    //extend a line out of each controller
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);

    this.line1 = new THREE.Line(geometry);
    this.line1.name = 'line';
    this.line1.scale.z = 5;

    this.line2 = this.line1.clone();

    this.controller1.add(this.line1);
    this.controller2.add(this.line2);
  }

  onControllerConnected = (event) => {
    if (event.data.handedness === 'left') {
      this.gamepad = event.data.gamepad;
    }
    if (event.data.handedness === 'right') {
    }
  };

  showLines = () => {
    this.line1.visible = true;
    this.line2.visible = true;
  };

  hideLines = () => {
    this.line1.visible = false;
    this.line2.visible = false;
  };

  showControllers = () => {
    this.controller1.visible = true;
    this.controller2.visible = true;
  };

  hideControllers = () => {
    this.controller1.visible = false;
    this.controller2.visible = false;
  };

  tick = (renderer) => {
    if (!this.gamepad) return;

    const camera = renderer.xr.getCamera();
    camera.getWorldDirection(this.direction);

    const thumbsickX = this.gamepad.axes[2];
    const thumbsickY = this.gamepad.axes[3];

    const time = performance.now();
    const delta = (time - this.prevTime) / 1000;
    this.prevTime = time;

    const velocity = this.velocity;

    velocity.x -= velocity.x * this.friction * delta;
    velocity.z -= velocity.z * this.friction * delta;

    velocity.x -= velocity.x - thumbsickX * this.speed * delta;
    velocity.z -= velocity.z - thumbsickY * this.speed * delta;

    //idk how to do the math to move in the direction of the camera

    const sinY = Math.sin(camera.rotation.y);
    const cosY = Math.cos(camera.rotation.y);

    this.player.position.z = this.player.position.z + velocity.z;
    this.player.position.x = this.player.position.x + velocity.x;
  };
}
