'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function GhostBody() {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const ghostGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 28;

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

    const geo = new THREE.LatheGeometry(points, 24);
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
    if (!meshRef.current) return;

    // Simple float + subtle sway — no random/twitch
    meshRef.current.position.y = Math.sin(time * 0.6) * 0.15;
    meshRef.current.position.x = Math.sin(time * 0.3) * 0.03;
    meshRef.current.rotation.z = Math.sin(time * 0.35) * 0.06;
    meshRef.current.rotation.y = Math.sin(time * 0.25) * 0.1;

    // Gentle breath only
    const breathScale = 1 + Math.sin(time * 0.8) * 0.02;
    meshRef.current.scale.setScalar(breathScale);

    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.3 + Math.sin(time * 1.2) * 0.12;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh geometry={ghostGeometry} material={materialRef}>
        <meshStandardMaterial
          ref={materialRef}
          color="#39AECF"
          emissive="#216477"
          emissiveIntensity={0.3}
          transparent
          opacity={0.68}
          roughness={0.22}
          metalness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner glow sphere */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.45, 12, 12]} />
        <meshStandardMaterial
          color="#39AECF"
          emissive="#1D7373"
          emissiveIntensity={0.5}
          transparent
          opacity={0.25}
          roughness={0.5}
        />
      </mesh>

      {/* Left eye */}
      <group position={[-0.22, 1.05, 0.55]}>
        <mesh>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial
            color="#0A1628"
            emissive="#39AECF"
            emissiveIntensity={0.4}
            roughness={0.9}
          />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color="#39AECF"
            emissive="#61B7CF"
            emissiveIntensity={1.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* Right eye */}
      <group position={[0.22, 1.05, 0.55]}>
        <mesh>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial
            color="#0A1628"
            emissive="#39AECF"
            emissiveIntensity={0.4}
            roughness={0.9}
          />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color="#39AECF"
            emissive="#61B7CF"
            emissiveIntensity={1.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* Mouth */}
      <group position={[0, 0.78, 0.55]}>
        <mesh>
          <torusGeometry args={[0.18, 0.035, 6, 16, Math.PI * 0.95]} />
          <meshStandardMaterial
            color="#0A1628"
            emissive="#39AECF"
            emissiveIntensity={0.35}
            roughness={0.7}
          />
        </mesh>
        <mesh position={[0, -0.09, 0.03]} rotation={[0.45, 0, 0]}>
          <sphereGeometry args={[0.065, 6, 6, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial
            color="#ff4d4d"
            emissive="#ff1a1a"
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* Cheeks */}
      <mesh position={[-0.42, 0.82, 0.45]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#39AECF" emissive="#39AECF" emissiveIntensity={0.2} transparent opacity={0.25} />
      </mesh>
      <mesh position={[0.42, 0.82, 0.45]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#39AECF" emissive="#39AECF" emissiveIntensity={0.2} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 15;

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
      spd[i] = 0.002 + Math.random() * 0.003;
    }
    return [pos, spd];
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const time = state.clock.getElapsedTime();
    const pos = particlesRef.current.geometry.attributes.position;

    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + speeds[i];
      if (y > 2.8) {
        y = -2.8;
        pos.setX(i, (Math.random() - 0.5) * 4);
      }
      pos.setY(i, y);
      pos.setX(i, pos.getX(i) + Math.sin(time * 0.4 + i * 1.3) * 0.0008);
    }
    pos.needsUpdate = true;
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
        size={0.035}
        color="#39AECF"
        transparent
        opacity={0.45}
        sizeAttenuation
      />
    </points>
  );
}

export default function Ghost3D() {
  return (
    <div className="w-full h-48 md:h-64 relative">
      <Canvas
        camera={{ position: [0, 0.4, 3.4], fov: 44 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} color="#39AECF" />
        <directionalLight position={[2, 3, 4]} intensity={0.35} color="#ffffff" />
        <pointLight position={[0, 0.6, 2.2]} color="#39AECF" intensity={2} distance={6} />
        <Float speed={0.8} rotationIntensity={0.12} floatIntensity={0.15}>
          <GhostBody />
        </Float>
        <Particles />
      </Canvas>
    </div>
  );
}