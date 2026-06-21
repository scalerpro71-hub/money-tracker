import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function Orb({ pct }) {
  const ref = useRef(null);
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useFrame((_, delta) => {
    if (reduceMotion || !ref.current) return;
    ref.current.rotation.y += delta * 0.18;
    ref.current.rotation.x += delta * 0.06;
  });

  const color = pct > 100 ? '#ff7d7d' : pct > 85 ? '#f2b53b' : '#34e0a8';

  return (
    <mesh ref={ref} position={[1.7, 0.1, 0]}>
      <icosahedronGeometry args={[1.05, 1]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.35} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
}

/**
 * One signature 3D moment for the dashboard hero - a budget-health orb,
 * not decoration for its own sake. Lazy-loaded by the caller so three.js
 * never enters the main bundle for users who never see it. Built on
 * @react-three/fiber's <Canvas> (declarative scene/camera/renderer
 * lifecycle, handled by React) rather than hand-rolled WebGL - a previous
 * attempt at a hero 3D scene in this app manually managed a raw
 * THREE.WebGLRenderer/ResizeObserver and was later removed.
 */
export default function HeroOrb({ budgetPct = 0 }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 35 }} gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 3, 5]} intensity={1.6} />
      <Orb pct={budgetPct} />
    </Canvas>
  );
}
