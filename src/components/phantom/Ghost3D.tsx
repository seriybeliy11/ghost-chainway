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
  const flickerRef = useRef(0);
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
        const wave = Math.sin(bt * Math.PI * 3) * 0.08;
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

      if (py < -0.7) {
        const angle = Math.atan2(pz, px);
        const scallop = Math.sin(angle * 4) * 0.12;
        const distFromCenter = Math.sqrt(px * px + pz * pz);
        const normalizedDist = py / -1.05;

        if (distFromCenter > 0.01) {
          const newScale = 1 + scallop * normalizedDist;
          pos.setX(i, px * newScale);
          pos.setZ(i, pz * newScale);
        }
        pos.setY(i, py + Math.sin(angle * 4) * 0.06);
      }
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Creepy flicker effect
    flickerRef.current += 1;
    const flickerChance = Math.random();
    let flickerMult = 1;
    if (flickerChance < 0.008) {
      // Sudden bright flash
      flickerMult = 1.4;
    } else if (flickerChance < 0.02) {
      // Dim moment
      flickerMult = 0.5;
    }

    // Random twitch
    twitchTimer.current += 1;
    if (!isTwitching.current && Math.random() < 0.003) {
      isTwitching.current = true;
      twitchTimer.current = 0;
      twitchIntensity.current = 0.08 + Math.random() * 0.15;
    }
    if (isTwitching.current) {
      if (twitchTimer.current > 6 + Math.random() * 8) {
        isTwitching.current = false;
      }
    }

    const twitchX = isTwitching.current
      ? Math.sin(twitchTimer.current * 3.5) * twitchIntensity.current
      : 0;
    const twitchY = isTwitching.current
      ? Math.cos(twitchTimer.current * 4.2) * twitchIntensity.current * 0.5
      : 0;

    if (meshRef.current) {
      // Smooth float with subtle creepy sway
      meshRef.current.position.y = Math.sin(time * 0.6) * 0.18 + twitchY;
      meshRef.current.position.x = Math.sin(time * 0.3) * 0.04 + twitchX;

      // Slow eerie rotation
      meshRef.current.rotation.z = Math.sin(time * 0.35) * 0.08 + (isTwitching.current ? Math.sin(twitchTimer.current * 5) * 0.05 : 0);
      meshRef.current.rotation.y = Math.sin(time * 0.25) * 0.12;

      // Creepy pulse - irregular breathing
      const breathPhase = Math.sin(time * 0.8) * 0.5 + 0.5;
      const breathScale = 1 + breathPhase * 0.04;
      const jitterScale = 1 + (Math.random() - 0.5) * 0.006;
      meshRef.current.scale.setScalar(breathScale * jitterScale * flickerMult);
    }

    if (materialRef.current) {
      // Eerie pulsing glow
      const emissivePulse = 0.25 + Math.sin(time * 1.2) * 0.12 + Math.sin(time * 3.7) * 0.05;
      materialRef.current.emissiveIntensity = emissivePulse * flickerMult;
      // Subtle opacity flicker
      materialRef.current.opacity = 0.65 + Math.sin(time * 2.1) * 0.08 + (flickerMult < 1 ? -0.15 : 0);
    }

    // Eye jitter - looking around creepily
    if (leftEyeRef.current) {
      const eyeJitterX = Math.sin(time * 1.3) * 0.015 + (isTwitching.current ? Math.sin(twitchTimer.current * 8) * 0.02 : 0);
      const eyeJitterY = Math.cos(time * 0.9) * 0.01;
      leftEyeRef.current.position.x = -0.22 + eyeJitterX;
      leftEyeRef.current.position.y = 1.05 + eyeJitterY;
    }
    if (rightEyeRef.current) {
      const eyeJitterX = Math.sin(time * 1.3) * 0.015 + (isTwitching.current ? Math.sin(twitchTimer.current * 8) * 0.02 : 0);
      const eyeJitterY = Math.cos(time * 0.9) * 0.01;
      rightEyeRef.current.position.x = 0.22 + eyeJitterX;
      rightEyeRef.current.position.y = 1.05 + eyeJitterY;
    }

    // Mouth creepy movement
    if (mouthRef.current) {
      mouthRef.current.rotation.z = Math.sin(time * 0.7) * 0.05;
      mouthRef.current.position.y = 0.8 + Math.sin(time * 1.8) * 0.015;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Ghost body - #73FFE4 color */}
      <mesh geometry={ghostGeometry} material={materialRef}>
        <meshStandardMaterial
          ref={materialRef}
          color="#73FFE4"
          emissive="#40BFA8"
          emissiveIntensity={0.25}
          transparent
          opacity={0.65}
          roughness={0.25}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner glow sphere */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial
          color="#73FFE4"
          emissive="#30BFA3"
          emissiveIntensity={0.5}
          transparent
          opacity={0.25}
          roughness={0.5}
        />
      </mesh>

      {/* Left eye - creepy hollow look */}
      <group position={[-0.22, 1.05, 0.55]}>
        <mesh ref={leftEyeRef} position={[0, 0, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color="#070714"
            emissive="#73FFE4"
            emissiveIntensity={0.15}
            roughness={0.8}
          />
        </mesh>
        {/* Creepy eye glow */}
        <mesh position={[0, 0, 0.03]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial
            color="#73FFE4"
            emissive="#73FFE4"
            emissiveIntensity={0.9}
            transparent
            opacity={0.7}
          />
        </mesh>
        {/* Eye highlight */}
        <mesh position={[0.02, 0.03, 0.06]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      {/* Right eye - creepy hollow look */}
      <group position={[0.22, 1.05, 0.55]}>
        <mesh ref={rightEyeRef} position={[0, 0, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color="#070714"
            emissive="#73FFE4"
            emissiveIntensity={0.15}
            roughness={0.8}
          />
        </mesh>
        {/* Creepy eye glow */}
        <mesh position={[0, 0, 0.03]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial
            color="#73FFE4"
            emissive="#73FFE4"
            emissiveIntensity={0.9}
            transparent
            opacity={0.7}
          />
        </mesh>
        {/* Eye highlight */}
        <mesh position={[0.02, 0.03, 0.06]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      {/* Creepy smile */}
      <group ref={mouthRef} position={[0, 0.8, 0.55]}>
        <mesh>
          <torusGeometry args={[0.15, 0.03, 8, 16, Math.PI]} />
          <meshStandardMaterial
            color="#070714"
            emissive="#73FFE4"
            emissiveIntensity={0.2}
            roughness={0.8}
          />
        </mesh>
        {/* Tongue */}
        <mesh position={[0, -0.08, 0.02]} rotation={[0.3, 0, 0]}>
          <sphereGeometry args={[0.06, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial
            color="#73FFE4"
            emissive="#40BFA8"
            emissiveIntensity={0.3}
            roughness={0.6}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* Ghostly cheeks */}
      <mesh position={[-0.4, 0.85, 0.4]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial
          color="#73FFE4"
          emissive="#73FFE4"
          emissiveIntensity={0.15}
          transparent
          opacity={0.25}
          roughness={0.8}
        />
      </mesh>
      <mesh position={[0.4, 0.85, 0.4]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial
          color="#73FFE4"
          emissive="#73FFE4"
          emissiveIntensity={0.15}
          transparent
          opacity={0.25}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}

function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 40;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        const y = pos.getY(i);
        const x = pos.getX(i);
        // Creepy floating - irregular speeds
        const speed = 0.002 + Math.sin(time * 0.5 + i * 0.7) * 0.001;
        pos.setY(i, y + speed + Math.sin(time + i) * 0.001);
        pos.setX(i, x + Math.sin(time * 0.3 + i * 1.5) * 0.001);
        if (pos.getY(i) > 3) {
          pos.setY(i, -2.5);
          pos.setX(i, (Math.random() - 0.5) * 4);
        }
      }
      pos.needsUpdate = true;

      // Particle opacity flicker
      const mat = particlesRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.4 + Math.sin(time * 3) * 0.15 + Math.sin(time * 7.3) * 0.05;
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
        size={0.035}
        color="#73FFE4"
        transparent
        opacity={0.5}
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
      // Creepy irregular pulsing
      const base = 1.5 + Math.sin(time * 1.0) * 0.6;
      const flicker = Math.sin(time * 4.7) * 0.3 + Math.sin(time * 7.1) * 0.15;
      const dim = Math.random() < 0.01 ? 0.3 : 1;
      lightRef.current.intensity = (base + flicker) * dim;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 0.5, 2]}
      color="#73FFE4"
      intensity={1.5}
      distance={5}
    />
  );
}

export default function Ghost3D() {
  return (
    <div className="w-full h-48 md:h-64 relative">
      <Canvas
        camera={{ position: [0, 0.3, 3.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.25} color="#73FFE4" />
        <directionalLight position={[2, 3, 4]} intensity={0.4} color="#FFFFFF" />
        <PulsingLight />
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.2}>
          <GhostBody />
        </Float>
        <Particles />
      </Canvas>
    </div>
  );
}