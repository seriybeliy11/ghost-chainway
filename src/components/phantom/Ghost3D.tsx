'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function GhostBody() {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Group>(null);
  const twitchTimer = useRef(0);
  const isTwitching = useRef(false);
  const twitchIntensity = useRef(0);

  const ghostGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 40;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let x: number;
      let y: number;

      if (t < 0.05) {
        const angle = (t / 0.05) * Math.PI * 0.5;
        x = Math.sin(angle) * 0.05;
        y = 1.6 + Math.cos(angle) * 0.15;
      } else if (t < 0.35) {
        const angle = ((t - 0.05) / 0.30) * Math.PI * 0.5;
        x = 0.05 + Math.sin(angle) * 0.65;
        y = 1.6 - (1 - Math.cos(angle)) * 0.5;
      } else if (t < 0.65) {
        const bt = (t - 0.35) / 0.30;
        x = 0.7 - bt * 0.15;
        y = 1.1 - bt * 1.3;
      } else if (t < 0.85) {
        const bt = (t - 0.65) / 0.20;
        x = 0.55 + bt * 0.15;
        y = -0.2 - bt * 0.6;
      } else {
        const bt = (t - 0.85) / 0.15;
        const wave = Math.sin(bt * Math.PI * 3.5) * 0.1;
        x = 0.7 - bt * 0.15 + wave;
        y = -0.8 - bt * 0.25;
      }

      points.push(new THREE.Vector2(Math.max(0.001, x), y));
    }

    const geo = new THREE.LatheGeometry(points, 32);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const py = pos.getY(i);
      const px = pos.getX(i);
      const pz = pos.getZ(i);

      if (py < -0.6) {
        const angle = Math.atan2(pz, px);
        const scallop = Math.sin(angle * 5) * 0.18;
        const distFromCenter = Math.sqrt(px * px + pz * pz);
        const normalizedDist = Math.max(0, (py + 0.8) / -0.9);

        if (distFromCenter > 0.01) {
          const newScale = 1 + scallop * normalizedDist * 1.3;
          pos.setX(i, px * newScale);
          pos.setZ(i, pz * newScale);
        }
        pos.setY(i, py + Math.sin(angle * 6) * 0.09);
      }
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    const flickerChance = Math.random();
    let flickerMult = 1;
    if (flickerChance < 0.01) flickerMult = 1.5;
    else if (flickerChance < 0.025) flickerMult = 0.45;

    twitchTimer.current += 1;
    if (!isTwitching.current && Math.random() < 0.003) {
      isTwitching.current = true;
      twitchTimer.current = 0;
      twitchIntensity.current = 0.09 + Math.random() * 0.16;
    }
    if (isTwitching.current && twitchTimer.current > 7 + Math.random() * 9) {
      isTwitching.current = false;
    }

    const twitchX = isTwitching.current ? Math.sin(twitchTimer.current * 3.5) * twitchIntensity.current : 0;
    const twitchY = isTwitching.current ? Math.cos(twitchTimer.current * 4.2) * twitchIntensity.current * 0.5 : 0;

    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(time * 0.6) * 0.18 + twitchY;
      meshRef.current.position.x = Math.sin(time * 0.3) * 0.04 + twitchX;
      meshRef.current.rotation.z = Math.sin(time * 0.35) * 0.08 + (isTwitching.current ? Math.sin(twitchTimer.current * 5) * 0.05 : 0);
      meshRef.current.rotation.y = Math.sin(time * 0.25) * 0.12;

      const breathScale = 1 + (Math.sin(time * 0.8) * 0.5 + 0.5) * 0.045;
      const jitterScale = 1 + (Math.random() - 0.5) * 0.007;
      meshRef.current.scale.setScalar(breathScale * jitterScale * flickerMult);
    }

    if (materialRef.current) {
      const emissivePulse = 0.3 + Math.sin(time * 1.2) * 0.15 + Math.sin(time * 3.7) * 0.06;
      materialRef.current.emissiveIntensity = emissivePulse * flickerMult;
      materialRef.current.opacity = 0.68 + Math.sin(time * 2.1) * 0.08 + (flickerMult < 1 ? -0.18 : 0);
    }

    if (leftEyeRef.current) {
      const eyeJitterX = Math.sin(time * 1.3) * 0.015 + (isTwitching.current ? Math.sin(twitchTimer.current * 8) * 0.025 : 0);
      leftEyeRef.current.position.x = -0.22 + eyeJitterX;
      leftEyeRef.current.position.y = 1.05 + Math.cos(time * 0.9) * 0.012;
    }
    if (rightEyeRef.current) {
      const eyeJitterX = Math.sin(time * 1.3) * 0.015 + (isTwitching.current ? Math.sin(twitchTimer.current * 8) * 0.025 : 0);
      rightEyeRef.current.position.x = 0.22 + eyeJitterX;
      rightEyeRef.current.position.y = 1.05 + Math.cos(time * 0.9) * 0.012;
    }

    if (mouthRef.current) {
      mouthRef.current.rotation.z = Math.sin(time * 0.9) * 0.08;
      mouthRef.current.position.y = 0.78 + Math.sin(time * 1.6) * 0.02;
      mouthRef.current.scale.setScalar(1 + Math.sin(time * 2.2) * 0.08);
    }
  });

  return (
    <group ref={meshRef}>
      <mesh geometry={ghostGeometry} material={materialRef}>
        <meshStandardMaterial
          ref={materialRef}
          color="#73FFE4"
          emissive="#40BFA8"
          emissiveIntensity={0.3}
          transparent
          opacity={0.68}
          roughness={0.22}
          metalness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial
          color="#73FFE4"
          emissive="#30BFA3"
          emissiveIntensity={0.6}
          transparent
          opacity={0.28}
          roughness={0.5}
        />
      </mesh>

      {/* Left eye - enhanced glow */}
      <group position={[-0.22, 1.05, 0.55]}>
        <mesh ref={leftEyeRef}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color="#0a0a1f"
            emissive="#73FFE4"
            emissiveIntensity={0.4}
            roughness={0.9}
          />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial
            color="#73FFE4"
            emissive="#a0ffeb"
            emissiveIntensity={1.8}
            transparent
            opacity={0.75}
          />
        </mesh>
        <mesh position={[0.025, 0.035, 0.08]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* Right eye - enhanced glow */}
      <group position={[0.22, 1.05, 0.55]}>
        <mesh ref={rightEyeRef}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color="#0a0a1f"
            emissive="#73FFE4"
            emissiveIntensity={0.4}
            roughness={0.9}
          />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial
            color="#73FFE4"
            emissive="#a0ffeb"
            emissiveIntensity={1.8}
            transparent
            opacity={0.75}
          />
        </mesh>
        <mesh position={[0.025, 0.035, 0.08]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* Menacing smile */}
      <group ref={mouthRef} position={[0, 0.78, 0.55]}>
        <mesh>
          <torusGeometry args={[0.18, 0.035, 8, 20, Math.PI * 0.95]} />
          <meshStandardMaterial
            color="#0a0a1f"
            emissive="#73FFE4"
            emissiveIntensity={0.35}
            roughness={0.7}
          />
        </mesh>
        <mesh position={[0, -0.09, 0.03]} rotation={[0.45, 0, 0]}>
          <sphereGeometry args={[0.065, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial
            color="#ff4d4d"
            emissive="#ff1a1a"
            emissiveIntensity={0.6}
            transparent
            opacity={0.75}
          />
        </mesh>
      </group>

      {/* Cheeks */}
      <mesh position={[-0.42, 0.82, 0.45]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color="#73FFE4" emissive="#73FFE4" emissiveIntensity={0.25} transparent opacity={0.3} />
      </mesh>
      <mesh position={[0.42, 0.82, 0.45]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color="#73FFE4" emissive="#73FFE4" emissiveIntensity={0.25} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 45;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        const y = pos.getY(i);
        pos.setY(i, y + 0.003 + Math.sin(time * 0.6 + i) * 0.0015);
        pos.setX(i, pos.getX(i) + Math.sin(time * 0.4 + i * 1.3) * 0.0012);

        if (pos.getY(i) > 3.2) {
          pos.setY(i, -2.8);
          pos.setX(i, (Math.random() - 0.5) * 4.5);
        }
      }
      pos.needsUpdate = true;

      const mat = particlesRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.55 + Math.sin(time * 3) * 0.15;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.038}
        color="#73FFE4"
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
}

function PulsingLight() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (lightRef.current) {
      const base = 1.8 + Math.sin(time * 1.1) * 0.7;
      const flicker = Math.sin(time * 5.2) * 0.4 + Math.sin(time * 8.3) * 0.2;
      const dim = Math.random() < 0.008 ? 0.25 : 1;
      lightRef.current.intensity = (base + flicker) * dim;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 0.6, 2.2]}
      color="#73FFE4"
      intensity={1.8}
      distance={6}
    />
  );
}

export default function Ghost3D() {
  return (
    <div className="w-full h-48 md:h-64 relative">
      <Canvas
        camera={{ position: [0, 0.4, 3.4], fov: 44 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} color="#73FFE4" />
        <directionalLight position={[2, 3, 4]} intensity={0.35} color="#ffffff" />
        <PulsingLight />
        <Float speed={1.1} rotationIntensity={0.18} floatIntensity={0.22}>
          <GhostBody />
        </Float>
        <Particles />
      </Canvas>
    </div>
  );
}