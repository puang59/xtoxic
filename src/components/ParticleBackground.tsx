"use client";
import { useEffect, useRef } from "react";

class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;

  constructor(canvas: HTMLCanvasElement) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3;
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5;
    this.color = `hsla(${Math.random() * 30 + 200}, 70%, 70%, 0.3)`;
  }

  update(canvas: HTMLCanvasElement): void {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x > canvas.width) this.x = 0;
    if (this.x < 0) this.x = canvas.width;
    if (this.y > canvas.height) this.y = 0;
    if (this.y < 0) this.y = canvas.height;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const safeCanvas = canvas;
    const safeCtx = ctx;

    let particles: Particle[] = [];
    let animationFrameId: number;

    function init() {
      particles = [];
      const numberOfParticles = Math.floor(
        (safeCanvas.width * safeCanvas.height) / 15000
      );
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle(safeCanvas));
      }
    }

    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            safeCtx.beginPath();
            safeCtx.strokeStyle = `hsla(270, 70%, 70%, ${
              0.2 * (1 - distance / 100)
            })`;
            safeCtx.lineWidth = 0.5;
            safeCtx.moveTo(particles[i].x, particles[i].y);
            safeCtx.lineTo(particles[j].x, particles[j].y);
            safeCtx.stroke();
          }
        }
      }
    }

    function animate() {
      safeCtx.clearRect(0, 0, safeCanvas.width, safeCanvas.height);
      particles.forEach((particle) => {
        particle.update(safeCanvas);
        particle.draw(safeCtx);
      });
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    }

    function resizeCanvas() {
      safeCanvas.width = window.innerWidth;
      safeCanvas.height = window.innerHeight;
      init();
    }

    resizeCanvas();
    animate();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 bg-gradient-to-br from-black via-blue-950 to-slate-950"
    />
  );
}
