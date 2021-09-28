import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

import CoolXRMovement from './CoolXRMovement';
import CoolKeyboardMovement from './CoolKeyboardMovement';
import XRContainerReceiver from '../src/XRContainerReceiver';

//scene
const objects = [];
const color = new THREE.Color();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.z = 5;
camera.position.y = 1.6;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.autoClear = false;
renderer.xr.enabled = true;

document.body.appendChild(VRButton.createButton(renderer));

window.addEventListener('resize', onWindowResize);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);

const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
light.position.set(0.5, 1, 0.75);
scene.add(light);

const floorGeometry = new THREE.PlaneGeometry(8, 8, 4, 4);
floorGeometry.rotateX(-Math.PI / 2);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x77aa33 });

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -0.5;
scene.add(floor);
objects.push(floor);

scene.background = new THREE.Color(0x443333);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: color });
const cube = new THREE.Mesh(geometry, material);
cube.position.y += 1;
scene.add(cube);
objects.push(cube);

const dolly = new THREE.Group();
dolly.add(camera);
scene.add(dolly);

const coolXRMovement = new CoolXRMovement(renderer, dolly);
const coolKeyboardMovement = new CoolKeyboardMovement(renderer, camera, dolly);

//receiver
const receiver = new XRContainerReceiver(renderer, scene, camera, 1);

//render
renderer.setAnimationLoop((time, frame) => {
  coolKeyboardMovement.tick(objects);
  coolXRMovement.tick(renderer);

  cube.rotation.z = cube.rotation.z + 0.01;
  cube.rotation.x = cube.rotation.z + 0.01;

  if (renderer.xr.isPresenting === true) {
    coolXRMovement.player.position.x = document.relativePosition.x;
    // coolXRMovement.player.position.y = document.relativePosition.y;
    coolXRMovement.player.position.z = document.relativePosition.z;
  }

  renderer.render(scene, camera);
  receiver.tick();
});
