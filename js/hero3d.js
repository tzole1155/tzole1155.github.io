import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.getElementById('hero-canvas');
const container = document.getElementById('hero-viewer');
const loader_el = document.getElementById('hero-viewer-loader');

if (canvas && container) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 1, 4);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const ambientLight = new THREE.AmbientLight(0x404050, 0.8);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xeee8dd, 1.4);
  keyLight.position.set(3, 4, 2);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x4466aa, 0.5);
  fillLight.position.set(-3, 2, -1);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xf59e0b, 0.6);
  rimLight.position.set(0, 3, -4);
  scene.add(rimLight);

  let mixer = null;
  const clock = new THREE.Clock();

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    'data/ga.glb',
    (gltf) => {
      const model = gltf.scene;

      const box0 = new THREE.Box3().setFromObject(model);
      const size0 = box0.getSize(new THREE.Vector3());
      const maxDim = Math.max(size0.x, size0.y, size0.z);
      const scale = 2.5 / maxDim;
      model.scale.setScalar(scale);
      model.rotation.y = Math.PI / 2;

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      model.position.set(center.x + 0.5, -box.min.y, -center.z);

      scene.add(model);

      const lookY = size.y * 0.45;
      camera.position.set(0, size.y * 0.5, 3.5);
      camera.lookAt(0, lookY, 0);

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        const clip = gltf.animations[0];
        const action = mixer.clipAction(clip);
        action.play();
      }

      if (loader_el) loader_el.classList.add('hidden');
    },
    undefined,
    (err) => {
      console.warn('GLB load failed:', err);
      if (loader_el) loader_el.classList.add('hidden');
      if (container) container.style.display = 'none';
    }
  );

  function resize() {
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  let slowSpin = 0;
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    slowSpin += delta * 0.15;
    scene.rotation.y = Math.sin(slowSpin) * 0.3;

    renderer.render(scene, camera);
  }
  animate();
}
