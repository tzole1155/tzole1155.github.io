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
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(65, 1, 0.01, 100);
  camera.position.set(0, 0.8, 1.75);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setPixelRatio(1);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.screenSpacePanning = true;
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 0.1;
  controls.maxDistance = 1000;
  controls.update();

  const light = new THREE.DirectionalLight(0xffffff, Math.PI);
  light.position.set(10, 10, 10);
  scene.add(light);

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
      window.dispatchEvent(new Event('gvrm-ready'));

      try {
        await gvrm.changeFBX(IDLE_FBX);
      } catch (animErr) {
        console.warn('FBX animation load failed, showing static avatar:', animErr);
      }
    } catch (err) {
      console.warn('GVRM load failed:', err);
      if (loader_el) loader_el.classList.add('hidden');
      if (container) container.style.display = 'none';
      window.dispatchEvent(new Event('gvrm-failed'));
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
