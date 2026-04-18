import * as THREE from 'three';
import { GVRM } from 'gvrm';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const IDLE_FBX = 'assets/Idle.fbx';
const GVRM_PATH = 'assets/ga.gvrm';

const canvas = document.getElementById('hero-canvas');
const container = document.getElementById('hero-viewer');
const loader_el = document.getElementById('hero-viewer-loader');
const hint_el = document.getElementById('hero-viewer-hint');

if (canvas && container) {
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(65, 1, 0.01, 100);
  camera.position.set(0, 0.6, 1.6);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.2, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 0.8;
  controls.maxDistance = 4;
  controls.maxPolarAngle = Math.PI * 0.55;
  controls.update();

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

  let gvrm = null;

  function dismissCameraHint() {
    if (hint_el && !hint_el.classList.contains('is-dismissed')) {
      hint_el.classList.add('is-dismissed');
    }
  }

  controls.addEventListener('start', dismissCameraHint);

  async function initGvrm() {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const message = args[0];
      if (
        typeof message === 'string' &&
        message.includes('VRMUtils.removeUnnecessaryJoints')
      ) {
        return;
      }
      originalWarn(...args);
    };

    try {
      gvrm = await GVRM.load(GVRM_PATH, scene, camera, renderer);
      if (loader_el) loader_el.classList.add('hidden');

      try {
        await gvrm.changeFBX(IDLE_FBX);
      } catch (animErr) {
        console.warn('FBX animation load failed, showing static avatar:', animErr);
      }
    } catch (err) {
      console.warn('GVRM load failed:', err);
      if (loader_el) loader_el.classList.add('hidden');
      if (container) container.style.display = 'none';
    } finally {
      console.warn = originalWarn;
    }
  }
  initGvrm();

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

  renderer.setAnimationLoop(() => {
    if (gvrm) gvrm.update();
    controls.update();
    renderer.render(scene, camera);
  });
}
