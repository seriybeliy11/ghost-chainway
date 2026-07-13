'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  wobbleOffset: number;
  hue: number;
  life: number;
  maxLife: number;
  brightness: number;
}

export default function GhostParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  const createParticle = useCallback((width: number, height: number): Particle => {
    const colors = [185, 195, 175];
    const direction = Math.random();
    let x: number, y: number, sx: number, sy: number;

    if (direction < 0.5) {
      x = Math.random() * width;
      y = height + 30;
      sx = (Math.random() - 0.5) * 1.2;
      sy = -(Math.random() * 0.8 + 0.2);
    } else if (direction < 0.75) {
      x = -30;
      y = Math.random() * height;
      sx = Math.random() * 1.0 + 0.2;
      sy = (Math.random() - 0.5) * 0.6;
    } else {
      x = width + 30;
      y = Math.random() * height;
      sx = -(Math.random() * 1.0 + 0.2);
      sy = (Math.random() - 0.5) * 0.6;
    }

    return {
      x, y,
      size: Math.random() * 3 + 1.5,
      speedX: sx,
      speedY: sy,
      wobbleSpeed: Math.random() * 0.03 + 0.008,
      wobbleAmp: Math.random() * 1.8 + 0.8,
      wobbleOffset: Math.random() * Math.PI * 2,
      hue: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: Math.random() * 400 + 250,
      brightness: Math.random() * 0.25 + 0.6,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    particlesRef.current = [];
    const count = 14;

    for (let i = 0; i < count; i++) {
      const p = createParticle(canvas.width, canvas.height);
      p.life = Math.floor(Math.random() * p.maxLife * 0.5);
      particlesRef.current.push(p);
    }

    const animate = () => {
      frameCountRef.current++;

      // Skip every other frame for 30fps feel
      if (frameCountRef.current % 2 === 0) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const sat = 85;
      const lightBase = 70;
      const coreLightness = 85;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        const wobble = Math.sin(p.life * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp;

        p.x += p.speedX + wobble * 0.06;
        p.y += p.speedY;

        const lifeRatio = p.life / p.maxLife;
        let opacity: number;
        if (lifeRatio < 0.15) {
          opacity = lifeRatio / 0.15;
        } else if (lifeRatio > 0.6) {
          opacity = (1 - lifeRatio) / 0.4;
        } else {
          opacity = 1;
        }
        opacity *= p.brightness;

        if (p.y < -50 || p.y > canvas.height + 50 || p.x < -50 || p.x > canvas.width + 50 || p.life >= p.maxLife) {
          particles[i] = createParticle(canvas.width, canvas.height);
          continue;
        }

        // Simplified glow: 2-stop gradient instead of 4
        const glowRadius = p.size * 5;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        gradient.addColorStop(0, `hsla(${p.hue}, ${sat}%, ${lightBase}%, ${opacity * 0.4})`);
        gradient.addColorStop(1, `hsla(${p.hue}, ${sat}%, ${lightBase}%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, ${coreLightness}%, ${opacity * 0.8})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ opacity: 0.8 }}
    />
  );
}