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

  const createParticle = useCallback((width: number, height: number): Particle => {
    const colors = [220, 265, 170, 290]; // blue, purple, cyan, violet
    const direction = Math.random();
    let x: number, y: number, sx: number, sy: number;

    if (direction < 0.5) {
      // From bottom
      x = Math.random() * width;
      y = height + 30;
      sx = (Math.random() - 0.5) * 1.8;
      sy = -(Math.random() * 1.2 + 0.3);
    } else if (direction < 0.75) {
      // From left
      x = -30;
      y = Math.random() * height;
      sx = Math.random() * 1.5 + 0.3;
      sy = (Math.random() - 0.5) * 1.0;
    } else {
      // From right
      x = width + 30;
      y = Math.random() * height;
      sx = -(Math.random() * 1.5 + 0.3);
      sy = (Math.random() - 0.5) * 1.0;
    }

    return {
      x, y,
      size: Math.random() * 4 + 2,
      speedX: sx,
      speedY: sy,
      wobbleSpeed: Math.random() * 0.04 + 0.01,
      wobbleAmp: Math.random() * 2.5 + 1,
      wobbleOffset: Math.random() * Math.PI * 2,
      hue: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: Math.random() * 500 + 300,
      brightness: Math.random() * 0.3 + 0.7,
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

    for (let i = 0; i < 30; i++) {
      const p = createParticle(canvas.width, canvas.height);
      p.life = Math.floor(Math.random() * p.maxLife * 0.5);
      particlesRef.current.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        // Chaotic movement with wobble
        const wobble = Math.sin(p.life * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp;
        const wobble2 = Math.cos(p.life * p.wobbleSpeed * 0.7 + p.wobbleOffset * 1.3) * p.wobbleAmp * 0.6;

        p.x += p.speedX + wobble * 0.08;
        p.y += p.speedY + wobble2 * 0.06;

        // Random direction changes
        if (Math.random() < 0.005) {
          p.speedX += (Math.random() - 0.5) * 0.8;
          p.speedY += (Math.random() - 0.5) * 0.8;
        }

        // Opacity curve
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

        // Large soft glow
        const glowRadius = p.size * 8;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        gradient.addColorStop(0, `hsla(${p.hue}, 85%, 70%, ${opacity * 0.5})`);
        gradient.addColorStop(0.2, `hsla(${p.hue}, 80%, 60%, ${opacity * 0.25})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, 75%, 55%, ${opacity * 0.08})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 70%, 50%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 85%, ${opacity * 0.9})`;
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
      className="fixed inset-0 pointer-events-none z-[5]"
      style={{ opacity: 0.9 }}
    />
  );
}