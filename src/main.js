import * as THREE from 'three';

const viewer = document.getElementById('viewer');
const welcomeScreen = document.getElementById('welcomeScreen');
const fileInput = document.getElementById('fileInput');
const loadBtn = document.getElementById('loadBtn');
const resetBtn = document.getElementById('resetBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const controlsPanel = document.getElementById('controlsPanel');
const loadingIndicator = document.getElementById('loadingIndicator');
const toast = document.getElementById('toast');

const EQUIRECTANGULAR_WARNING =
  'La imagen no parece ser equirectangular. Debe tener proporción aproximada 2:1.';

let renderer;
let scene;
let camera;
let sphereMesh;
let animationFrame;

// Estado de cámara tipo "look around".
const state = {
  lon: 0,
  lat: 0,
  phi: 0,
  theta: 0,
  pointerDown: false,
  pointerX: 0,
  pointerY: 0,
  lonOnPointerDown: 0,
  latOnPointerDown: 0,
  fov: 75,
};

initScene();
bindEvents();
animate();

function initScene() {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(state.fov, window.innerWidth / window.innerHeight, 1, 1100);

  // Esfera invertida: se escala en X negativo para mirar desde dentro.
  const geometry = new THREE.SphereGeometry(500, 64, 40);
  geometry.scale(-1, 1, 1);

  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  sphereMesh = new THREE.Mesh(geometry, material);
  scene.add(sphereMesh);

  viewer.appendChild(renderer.domElement);
}

function bindEvents() {
  // Cargar desde pantalla inicial y barra de controles.
  fileInput.addEventListener('change', handleFileSelection);
  loadBtn.addEventListener('click', () => fileInput.click());

  resetBtn.addEventListener('click', resetView);
  fullscreenBtn.addEventListener('click', toggleFullscreen);

  // Pointer Events cubren mouse y táctil para arrastre.
  viewer.addEventListener('pointerdown', onPointerDown);
  viewer.addEventListener('pointermove', onPointerMove);
  viewer.addEventListener('pointerup', onPointerUp);
  viewer.addEventListener('pointercancel', onPointerUp);

  // Zoom con rueda de mouse.
  viewer.addEventListener('wheel', onWheelZoom, { passive: false });

  // Pinch zoom en táctil (2 dedos) si está disponible.
  let previousPinchDistance = null;
  viewer.addEventListener(
    'touchmove',
    (event) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        const [a, b] = event.touches;
        const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (previousPinchDistance !== null) {
          const delta = distance - previousPinchDistance;
          state.fov = THREE.MathUtils.clamp(state.fov - delta * 0.06, 30, 95);
          camera.fov = state.fov;
          camera.updateProjectionMatrix();
        }
        previousPinchDistance = distance;
      }
    },
    { passive: false },
  );
  viewer.addEventListener('touchend', () => {
    previousPinchDistance = null;
  });

  window.addEventListener('resize', onWindowResize);
}

function handleFileSelection(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    showToast('Formato no compatible. Usa JPG, PNG o WebP.');
    return;
  }

  showLoading(true);

  // FileReader asíncrono para evitar bloquear interfaz al leer archivos grandes.
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = async () => {
      const ratio = image.width / image.height;
      const isCloseToTwoByOne = ratio > 1.9 && ratio < 2.1;

      if (!isCloseToTwoByOne) {
        const shouldContinue = window.confirm(
          `${EQUIRECTANGULAR_WARNING}\n\n¿Deseas visualizarla de todas formas?`,
        );
        showToast(EQUIRECTANGULAR_WARNING);
        if (!shouldContinue) {
          showLoading(false);
          return;
        }
      }

      try {
        await applyPanoramaTexture(reader.result);
        welcomeScreen.classList.add('hidden');
        controlsPanel.classList.remove('hidden');
      } catch {
        showToast('No se pudo cargar la imagen. Intenta con otro archivo.');
      } finally {
        showLoading(false);
        fileInput.value = '';
      }
    };

    image.onerror = () => {
      showLoading(false);
      showToast('Archivo inválido. No se pudo interpretar como imagen.');
    };

    image.src = reader.result;
  };

  reader.onerror = () => {
    showLoading(false);
    showToast('Error al leer el archivo local.');
  };

  reader.readAsDataURL(file);
}

async function applyPanoramaTexture(dataUrl) {
  const loader = new THREE.TextureLoader();

  const texture = await new Promise((resolve, reject) => {
    loader.load(
      dataUrl,
      (loadedTexture) => resolve(loadedTexture),
      undefined,
      (error) => reject(error),
    );
  });

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  if (sphereMesh.material.map) {
    sphereMesh.material.map.dispose();
  }

  sphereMesh.material.map = texture;
  sphereMesh.material.needsUpdate = true;
}

function onPointerDown(event) {
  state.pointerDown = true;
  state.pointerX = event.clientX;
  state.pointerY = event.clientY;
  state.lonOnPointerDown = state.lon;
  state.latOnPointerDown = state.lat;
  viewer.setPointerCapture(event.pointerId);
}

function onPointerMove(event) {
  if (!state.pointerDown) return;

  const deltaX = state.pointerX - event.clientX;
  const deltaY = event.clientY - state.pointerY;

  state.lon = state.lonOnPointerDown + deltaX * 0.12;
  state.lat = state.latOnPointerDown + deltaY * 0.12;
}

function onPointerUp(event) {
  if (!state.pointerDown) return;
  state.pointerDown = false;
  if (viewer.hasPointerCapture(event.pointerId)) {
    viewer.releasePointerCapture(event.pointerId);
  }
}

function onWheelZoom(event) {
  event.preventDefault();
  state.fov = THREE.MathUtils.clamp(state.fov + event.deltaY * 0.05, 30, 95);
  camera.fov = state.fov;
  camera.updateProjectionMatrix();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function resetView() {
  state.lon = 0;
  state.lat = 0;
  state.fov = 75;
  camera.fov = state.fov;
  camera.updateProjectionMatrix();
}

function toggleFullscreen() {
  const root = document.documentElement;
  if (!document.fullscreenElement) {
    root.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function showLoading(isVisible) {
  loadingIndicator.classList.toggle('hidden', !isVisible);
}

let toastTimeout;
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 4800);
}

function animate() {
  animationFrame = requestAnimationFrame(animate);

  state.lat = THREE.MathUtils.clamp(state.lat, -85, 85);
  state.phi = THREE.MathUtils.degToRad(90 - state.lat);
  state.theta = THREE.MathUtils.degToRad(state.lon);

  const x = 500 * Math.sin(state.phi) * Math.cos(state.theta);
  const y = 500 * Math.cos(state.phi);
  const z = 500 * Math.sin(state.phi) * Math.sin(state.theta);

  camera.lookAt(x, y, z);
  renderer.render(scene, camera);
}

window.addEventListener('beforeunload', () => {
  cancelAnimationFrame(animationFrame);
  renderer.dispose();
  sphereMesh.geometry.dispose();
  if (sphereMesh.material.map) {
    sphereMesh.material.map.dispose();
  }
  sphereMesh.material.dispose();
});
