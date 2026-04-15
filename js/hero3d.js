import * as THREE from 'three';
import { GVRM } from 'gvrm';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const canvas = document.getElementById('hero-canvas');
const container = document.getElementById('hero-viewer');
const loader_el = document.getElementById('hero-viewer-loader');
const fbxPath = 'assets/Idle.fbx';

if (canvas && container) {
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(65, 1, 0.01, 100);
  camera.position.set(0, 0.6, 1.6);
  camera.lookAt(0, 0.2, 0);

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

  let gvrm = null;
  const fbxLoader = new FBXLoader();

  async function debugFbx(fbxUrl) {
    try {
      const fbxScene = await fbxLoader.loadAsync(fbxUrl);
      const clips = fbxScene.animations || [];
      const skeletonBones = [];

      fbxScene.traverse((node) => {
        if (node.isBone) skeletonBones.push(node.name);
      });

      console.info(`[FBX debug] file: ${fbxUrl}`);
      console.info(`[FBX debug] clips: ${clips.length}`);
      clips.forEach((clip, idx) => {
        const trackNames = clip.tracks.map((t) => t.name);
        console.info(`[FBX debug] clip ${idx}: "${clip.name}" tracks=${clip.tracks.length}`);
        console.info(`[FBX debug] clip ${idx} first tracks:`, trackNames.slice(0, 300));
      });
      console.info(`[FBX debug] bone count: ${skeletonBones.length}`);
      console.info('[FBX debug] first bones:', skeletonBones.slice(0, 25));
    } catch (error) {
      console.error(`[FBX debug] failed to parse ${fbxUrl}`, error);
    }
  }

  async function initGvrm() {
    const originalWarn = console.warn;
    // Suppress a known upstream deprecation warning from three-vrm internals.
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
      gvrm = await GVRM.load('assets/ga.gvrm', scene, camera, renderer);
      if (loader_el) loader_el.classList.add('hidden');

      // Keep avatar visible even when an external FBX fails to retarget.
      try {
        await debugFbx(fbxPath);
        await gvrm.changeFBX(fbxPath);
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
    renderer.render(scene, camera);
  });
}
