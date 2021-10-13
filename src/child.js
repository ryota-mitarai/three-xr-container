import * as THREE from 'three';

import XRContainerReceiver from './XRContainerReceiver';

var isPresenting = false;

addEventListener('message', (e) => {
  const message = e.data.message;
  const value = e.data.value;

  switch (message) {
    case 'init':
      init(value);
      break;
    case 'xrcSessionStart':
      isPresenting = true;
      break;
    case 'xrcSessionEnd':
      isPresenting = false;
      break;
  }
});

function init({ canvas }) {
  const width = canvas.width;
  const height = canvas.height;

  //scene
  const objects = [];
  const color = new THREE.Color();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 1000);
  camera.position.x = 5;
  camera.position.y = 1.5;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
  renderer.autoClear = false;
  renderer.xr.enabled = true;

  // window.addEventListener('resize', onWindowResize);

  // function onWindowResize() {
  //   camera.aspect = width / height;
  //   camera.updateProjectionMatrix();

  //   renderer.setSize(width, height);
  // }

  color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);

  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  const floorGeometry = new THREE.PlaneGeometry(8, 8, 4, 4);
  floorGeometry.rotateX(-Math.PI / 2);
  const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x77aa33 });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  scene.add(floor);
  objects.push(floor);

  // scene.background = new THREE.Color(0x443333);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.y += 1;
  scene.add(cube);
  objects.push(cube);

  const dolly = new THREE.Group();
  dolly.add(camera);
  scene.add(dolly);

  //receiver
  const receiver = new XRContainerReceiver(renderer, scene, camera, 1);

  function animate(time) {
    cube.rotation.z = cube.rotation.z + 0.01;
    cube.rotation.x = cube.rotation.z + 0.01;

    receiver.tick(dolly, renderer, scene);

    const width = 4936;
    const height = 2740;

    if (isPresenting) {
      renderer.setSize(width, height, false);
    }

    if (!isPresenting) {
      renderer.render(scene, camera);
    } else {
      receiver.VRRender(renderer, scene, width, height);
    }

    receiver.tock();

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
