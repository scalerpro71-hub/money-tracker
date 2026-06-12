import { useEffect, useRef } from 'react';

function makeTextTexture(THREE, label) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(128, 128, 108, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(56,212,156,0.82)';
  ctx.lineWidth = 12;
  ctx.stroke();
  ctx.fillStyle = '#0f3d31';
  ctx.font = '800 62px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeCoin(THREE, label, radius, depth, accent) {
  const coin = new THREE.Group();
  const texture = makeTextTexture(THREE, label);
  const faceMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    map: texture,
    side: THREE.DoubleSide,
  });
  const rimMaterial = new THREE.MeshBasicMaterial({
    color: accent,
    side: THREE.DoubleSide,
  });
  const geometry = new THREE.CylinderGeometry(radius, radius, depth, 72);
  const mesh = new THREE.Mesh(geometry, [rimMaterial, faceMaterial, faceMaterial]);
  mesh.rotation.x = Math.PI / 2;
  coin.add(mesh);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.02, radius * 0.025, 12, 72),
    new THREE.MeshBasicMaterial({
      color: '#eafff6',
      transparent: true,
      opacity: 0.72,
    })
  );
  coin.add(ring);
  return coin;
}

export function HeroMoneyScene({ budgetPct = 0, savingsRate = 0 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let renderer;
    let scene;
    let frameId = 0;
    let resizeObserver;

    function resize(camera) {
      if (!renderer) return;
      const rect = mount.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / Math.max(rect.height, 1);
      camera.updateProjectionMatrix();
    }

    import('three').then(THREE => {
      if (disposed) return;

      scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.set(0, 0, 7);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const keyLight = new THREE.DirectionalLight('#ffffff', 2.2);
      keyLight.position.set(2.8, 3, 5);
      scene.add(keyLight);
      scene.add(new THREE.AmbientLight('#c7ffee', 1.45));

      const primaryCoin = makeCoin(THREE, 'INR', 1.05, 0.12, '#38d49c');
      primaryCoin.position.set(1.75, 0.08, 0);
      primaryCoin.rotation.y = -0.45;
      group.add(primaryCoin);

      const secondaryCoin = makeCoin(THREE, '%', 0.58, 0.08, '#92f2c6');
      secondaryCoin.position.set(0.45, -0.85, -0.55);
      secondaryCoin.rotation.y = 0.75;
      secondaryCoin.scale.setScalar(0.86);
      group.add(secondaryCoin);

      const progressRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.65, 0.025, 16, 128, Math.PI * 2 * Math.max(0.12, Math.min(budgetPct, 140) / 100)),
        new THREE.MeshBasicMaterial({
          color: savingsRate >= 20 ? '#71f0c2' : '#ffd47d',
          transparent: true,
          opacity: 0.76,
        })
      );
      progressRing.position.set(1.72, 0.05, -0.15);
      progressRing.rotation.z = -Math.PI / 2;
      group.add(progressRing);

      const bars = new THREE.Group();
      const barMaterial = new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.42,
      });
      [0.52, 0.82, 0.62, 1.08].forEach((height, index) => {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.12, height, 0.12), barMaterial);
        bar.position.set(-0.95 + index * 0.26, -0.7 + height / 2, -0.75);
        bar.rotation.z = -0.08;
        bars.add(bar);
      });
      group.add(bars);

      const startedAt = performance.now();

      function renderFrame() {
        const t = (performance.now() - startedAt) / 1000;
        if (!reduceMotion) {
          primaryCoin.rotation.y = -0.45 + Math.sin(t * 0.65) * 0.22;
          primaryCoin.rotation.z = Math.sin(t * 0.45) * 0.05;
          secondaryCoin.rotation.y = 0.75 - t * 0.18;
          secondaryCoin.position.y = -0.85 + Math.sin(t * 0.9) * 0.08;
          progressRing.rotation.y = Math.sin(t * 0.5) * 0.08;
          bars.children.forEach((bar, index) => {
            bar.scale.y = 0.86 + Math.sin(t * 1.15 + index) * 0.12;
          });
          group.rotation.y = Math.sin(t * 0.35) * 0.08;
        }
        renderer.render(scene, camera);
        if (!reduceMotion) frameId = requestAnimationFrame(renderFrame);
      }

      resize(camera);
      renderFrame();

      resizeObserver = new ResizeObserver(() => resize(camera));
      resizeObserver.observe(mount);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      if (renderer?.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      renderer?.dispose();
      scene?.traverse(object => {
        if (!object.isMesh) return;
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => {
          material.map?.dispose();
          material.dispose();
        });
      });
    };
  }, [budgetPct, savingsRate]);

  return <div ref={mountRef} className="hero-money-scene" aria-hidden="true" />;
}
