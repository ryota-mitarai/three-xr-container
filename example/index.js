import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

import CoolXRMovement from './CoolXRMovement';
import XRContainer from '../src/XRContainer';
import CoolKeyboardMovement from './CoolKeyboardMovement';

//scene
let prevTime = performance.now();
const objects = [];

const color = new THREE.Color();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
camera.position.z = 10;
camera.position.y = 20;

const renderer = new THREE.WebGLRenderer();
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

const floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
floorGeometry.rotateX(-Math.PI / 2);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x65982 });

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
scene.add(floor);
objects.push(floor);

const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
light.position.set(0.5, 1, 0.75);
scene.add(light);

scene.background = new THREE.Color(0x333333);
scene.fog = new THREE.Fog(0xaaaaaa, 0, 750);

const dolly = new THREE.Group();
dolly.add(camera);
scene.add(dolly);

const coolXRMovement = new CoolXRMovement(renderer, dolly);
const coolKeyboardMovement = new CoolKeyboardMovement(renderer, camera, dolly);

//container
const container = new XRContainer(
  'http://localhost:1234/child.html',
  100,
  60,
  100
);
container.object.position.y = 30.1;
container.object.position.z = -100;
scene.add(container.object);

//render
renderer.setAnimationLoop(() => {
  const time = performance.now();
  const delta = (time - prevTime) / 1000;
  prevTime = time;

  coolKeyboardMovement.tick(objects);
  coolXRMovement.tick(renderer);

  renderer.clear(true, true, true);
  renderer.render(scene, camera);
  container.render(renderer, camera);
});
