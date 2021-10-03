import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export default class CoolKeyboardMovement {
  speed;
  mass;
  friction;
  jumpStrength;

  controls;
  raycaster;

  moveForward;
  moveLeft;
  moveBackward;
  moveRight;

  onObject;
  canJump;

  direction;
  velocity;

  constructor(renderer, camera, player) {
    this.controls = new PointerLockControls(camera, renderer.domElement);
    player.add(this.controls.getObject());

    renderer.domElement.addEventListener('click', () => {
      this.controls.lock();
    });

    this.speed = 1.0;
    this.mass = 10.0;
    this.friction = 10.0;
    this.jumpStrength = 30.0;
    this.height = 1.0;

    this.moveBackward = false;
    this.moveForward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.onObject = false;

    this.raycaster = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1, 0),
      0,
      this.height
    );

    this.direction = new THREE.Vector3();
    this.velocity = new THREE.Vector3();

    this.prevTime = performance.now();

    const onKeyDown = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = true;
          break;

        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = true;
          break;

        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = true;
          break;

        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = true;
          break;

        case 'Space':
          if (this.canJump === true) this.velocity.y += this.jumpStrength;
          this.canJump = false;
          break;
      }
    };

    const onKeyUp = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = false;
          break;

        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = false;
          break;

        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = false;
          break;

        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = false;
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  }

  //to be called every render loop
  //if not provided with solidObjects, jumping / gravity will be disabled
  tick = (solidObjects) => {
    const velocity = this.velocity;

    const time = performance.now();
    const delta = (time - this.prevTime) / 1000;
    this.prevTime = time;

    //jumping
    if (solidObjects) {
      velocity.y -= 9.8 * this.mass * delta;

      this.raycaster.ray.origin.copy(this.controls.getObject().position);
      this.raycaster.ray.origin.y -= this.height;

      const intersections = this.raycaster.intersectObjects(solidObjects);
      this.onObject = intersections.length > 0;

      if (this.controls.getObject().position.y < this.height) {
        velocity.y = 0;
        this.controls.getObject().position.y = this.height;

        this.canJump = true;
      }

      if (this.onObject === true) {
        velocity.y = Math.max(0, velocity.y);
        this.canJump = true;
      }
    }

    //movement
    velocity.x -= velocity.x * this.friction * delta;
    velocity.z -= velocity.z * this.friction * delta;

    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    if (this.moveForward || this.moveBackward) {
      velocity.z -= this.direction.z * 400.0 * delta;
    }
    if (this.moveLeft || this.moveRight) {
      velocity.x -= this.direction.x * 400.0 * delta;
    }

    this.controls.moveRight((-velocity.x * delta * this.speed) / 10.0);
    this.controls.moveForward((-velocity.z * delta * this.speed) / 10.0);
    this.controls.getObject().position.y += velocity.y * delta;
  };
}
