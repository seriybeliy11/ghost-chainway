'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function GhostBody() {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const ghostGeometry = useMemo(() => {
    // Create ghost profile for LatheGeometry
    const points: THREE.Vector2[] = [];
    const segments = 40;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let x: number;
      let y: number;

      if (t < 0.05) {
        // Top of head - dome peak
        const angle = (t / 0.05) * Math.PI * 0.5;
        x = Math.sin(angle) * 0.05;
        y = 1.6 + Math.cos(angle) * 0.15;
      } else if (t < 0.35) {
        // Head dome
        const angle = ((t - 0.05) / 0.30) * Math.PI * 0.5;
        x = 0.05 + Math.sin(angle) * 0.65;
        y = 1.6 - (1 - Math.cos(angle)) * 0.5;
      } else if (t < 0.65) {
        // Body - slight taper
        const bt = (t - 0.35) / 0.30;
        x = 0.7 - bt * 0.15;
        y = 1.1 - bt * 1.3;
      } else if (t < 0.85) {
        // Lower body - slight flare
        const bt = (t - 0.65) / 0.20;
        x = 0.55 + bt * 0.15;
        y = -0.2 - bt * 0.6;
      } else {
        // Bottom with wave
        const bt = (t - 0.85) / 0.15;
        const wave = Math.sin(bt * Math.PI * 3) * 0.08;
        x = 0.7 - bt * 0.15 + wave;
        y = -0.8 - bt * 0.25;
      }

      points.push(new THREE.Vector2(Math.max(0.001, x), y));
    }

    const geo = new THREE.LatheGeometry(points, 32);
    
    // Modify bottom vertices for scallop effect
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
    
    if (meshRef.current) {
      // Gentle float
      meshRef.current.position.y = Math.sin(time * 0.8) * 0.15;
      // Subtle rotation
      meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.05;
      // Pulse scale
      const pulse = 1 + Math.sin(time * 1.5) * 0.03;
      meshRef.current.scale.setScalar(pulse);
    }
    
    if (materialRef.current) {
      // Pulse emissive intensity
      const emissivePulse = 0.3 + Math.sin(time * 1.5) * 0.15;
      materialRef.current.emissiveIntensity = emissivePulse;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Ghost body */}
      <mesh geometry={ghostGeometry} material={materialRef}>
        <meshStandardMaterial
          ref={materialRef}
          color="#406CFF"
          emissive="#3051BF"
          emissiveIntensity={0.3}
          transparent
          opacity={0.7}
          roughness={0.3}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner glow sphere */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial
          color="#7393FF"
          emissive="#406CFF"
          emissiveIntensity={0.6}
          transparent
          opacity={0.3}
          roughness={0.5}
        />
      </mesh>

      {/* Left eye - happy squint */}
      <group position={[-0.22, 1.05, 0.55]}>
        <mesh>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color="#070714"
            emissive="#003BFF"
            emissiveIntensity={0.2}
            roughness={0.8}
          />
        </mesh>
        {/* Eye highlight */}
        <mesh position={[0.02, 0.03, 0.04]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* Right eye - happy squint */}
      <group position={[0.22, 1.05, 0.55]}>
        <mesh>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial
            color="#070714"
            emissive="#003BFF"
            emissiveIntensity={0.2}
            roughness={0.8}
          />
        </mesh>
        {/* Eye highlight */}
        <mesh position={[0.02, 0.03, 0.04]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* Laughing mouth - open smile */}
      <group position={[0, 0.8, 0.55]} rotation={[0, 0, 0]}>
        {/* Mouth shape using a torus segment */}
        <mesh>
          <torusGeometry args={[0.15, 0.035, 8, 16, Math.PI]} />
          <meshStandardMaterial
            color="#070714"
            emissive="#0027A6"
            emissiveIntensity={0.3}
            roughness={0.8}
          />
        </mesh>
        {/* Tongue hint */}
        <mesh position={[0, -0.08, 0.02]} rotation={[0.3, 0, 0]}>
          <sphereGeometry args={[0.07, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial
            color="#8F40FF"
            emissive="#6A00FF"
            emissiveIntensity={0.3}
            roughness={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* Rosy cheeks */}
      <mesh position={[-0.4, 0.85, 0.4]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color="#8F40FF"
          emissive="#8F40FF"
          emissiveIntensity={0.2}
          transparent
          opacity={0.4}
          roughness={0.8}
        />
      </mesh>
      <mesh position={[0.4, 0.85, 0.4]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color="#8F40FF"
          emissive="#8F40FF"
          emissiveIntensity={0.2}
          transparent
          opacity={0.4}
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
        pos.setY(i, y + 0.003 + Math.sin(time + i) * 0.002);
        if (pos.getY(i) > 3) {
          pos.setY(i, -2.5);
        }
      }
      pos.needsUpdate = true;
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
        size={0.03}
        color="#7393FF"
        transparent
        opacity={0.6}
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
      lightRef.current.intensity = 1.5 + Math.sin(time * 1.5) * 0.8;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 0.5, 2]}
      color="#406CFF"
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
        <ambientLight intensity={0.3} color="#7393FF" />
        <directionalLight position={[2, 3, 4]} intensity={0.5} color="#FFFFFF" />
        <PulsingLight />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
          <GhostBody />
        </Float>
        <Particles />
      </Canvas>
    </div>
  );
}