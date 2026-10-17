import * as THREE from 'three';
import { GVRM } from 'gvrm';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const IDLE_FBX = 'assets/Idle.fbx';
// Gzipped .gvrm (STOREd zip inside, see tools/optimize_gvrm.py): the browser inflates it
// natively, which is much faster than JSZip inflating each entry in JavaScript.
const GVRM_PATH = 'assets/ga.gvrm.gz';
// Used for the progress estimate when the server omits Content-Length.
const GVRM_EXPECTED_BYTES = 7252803;

const canvas = document.getElementById('hero-canvas');
const container = document.getElementById('hero-viewer');
const loader_el = document.getElementById('hero-viewer-loader');
const hint_el = document.getElementById('hero-viewer-hint');

if (canvas && container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(65, 1, 0.01, 100);
  camera.position.set(1.235, -0.144, 0.972);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setPixelRatio(1);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.screenSpacePanning = true;
  controls.target.set(0.061, -0.024, -0.051);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 0.1;
  controls.maxDistance = 1000;
  controls.update();

  const light = new THREE.DirectionalLight(0xffffff, Math.PI);
  light.position.set(10, 10, 10);
  scene.add(light);

  let gvrm = null;

  // Temporary camera debug helper. Uncomment the listener/log lines below to inspect framing.
  function logCameraState(label) {
    const pos = camera.position;
    const target = controls.target;
    console.log(
      `[hero3d] ${label} camera=(${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)}) ` +
      `target=(${target.x.toFixed(3)}, ${target.y.toFixed(3)}, ${target.z.toFixed(3)})`
    );
  }

  function dismissCameraHint() {
    if (hint_el && !hint_el.classList.contains('is-dismissed')) {
      hint_el.classList.add('is-dismissed');
    }
  }

  controls.addEventListener('start', dismissCameraHint);
  // controls.addEventListener('end', () => logCameraState('controls:end'));
  // logCameraState('initial');

  // Progress is reported to the site loader (js/main.js) as 0..1 over three stages:
  // download 0–0.8, unpack 0.8–0.85, GVRM build 0.85–0.97 (estimated), ready 1.
  function reportProgress(progress, stage, extra) {
    window.dispatchEvent(new CustomEvent('gvrm-progress', {
      detail: { progress, stage, ...extra },
    }));
  }

  async function readWithProgress(res) {
    const lengthHeader = Number(res.headers.get('Content-Length'));
    // If the server inflates the .gz on the fly, Content-Length is the compressed size
    // while the stream yields inflated bytes, so fall back to the received count.
    let total = lengthHeader > 0 ? lengthHeader : GVRM_EXPECTED_BYTES;
    if (!res.body) return res.blob();

    const reader = res.body.getReader();
    const chunks = [];
    let loaded = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      if (loaded > total) total = loaded * 1.1;
      reportProgress(0.8 * Math.min(loaded / total, 1), 'download', { loaded, total });
    }
    return new Blob(chunks);
  }

  async function fetchGvrmUrl(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    let blob = await readWithProgress(res);
    // Some servers send .gz with Content-Encoding: gzip, so the body arrives already
    // inflated; only decompress if it still starts with the gzip magic bytes.
    const magic = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
    if (magic[0] === 0x1f && magic[1] === 0x8b) {
      reportProgress(0.8, 'unpack');
      blob = await new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).blob();
    }
    return URL.createObjectURL(blob);
  }

  // GVRM.load exposes no progress, so ease toward 0.97 while it runs.
  function creepProgress(from, to) {
    let p = from;
    reportProgress(p, 'build');
    const id = setInterval(() => {
      p += (to - p) * 0.05;
      reportProgress(p, 'build');
    }, 120);
    return () => clearInterval(id);
  }

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

    let gvrmUrl = null;
    try {
      reportProgress(0, 'download');
      gvrmUrl = await fetchGvrmUrl(GVRM_PATH);
      const stopCreep = creepProgress(0.85, 0.97);
      try {
        gvrm = await GVRM.load(gvrmUrl, scene, camera, renderer);
      } finally {
        stopCreep();
      }
      reportProgress(1, 'ready');
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
      if (gvrmUrl) URL.revokeObjectURL(gvrmUrl);
      console.warn = originalWarn;
    }
  }
  // Defer the heavy avatar download until the rest of the page has loaded.
  if (document.readyState === 'complete') {
    initGvrm();
  } else {
    window.addEventListener('load', initGvrm, { once: true });
  }

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
