import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  type: 'petal' | 'heart' | 'sparkle';
  opacity: number;
}

export const PetalCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      'rgba(244, 114, 182, 0.65)', // rose-400
      'rgba(251, 113, 133, 0.65)', // rose-500
      'rgba(249, 168, 212, 0.6)',  // pink-300
      'rgba(254, 205, 211, 0.7)',  // rose-200
      'rgba(253, 164, 175, 0.65)', // rose-300
    ];

    const particleCount = Math.min(30, Math.floor(window.innerWidth / 45));
    const particles: Particle[] = [];

    const createParticle = (yPos?: number): Particle => ({
      x: Math.random() * width,
      y: yPos !== undefined ? yPos : Math.random() * height,
      size: Math.random() * 10 + 8,
      speedY: Math.random() * 0.9 + 0.6,
      speedX: (Math.random() - 0.5) * 0.8,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: Math.random() > 0.4 ? 'petal' : Math.random() > 0.5 ? 'heart' : 'sparkle',
      opacity: Math.random() * 0.4 + 0.5,
    });

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    const drawHeart = (c: CanvasRenderingContext2D, x: number, y: number, s: number, color: string, rot: number) => {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.fillStyle = color;
      c.beginPath();
      const topCurveHeight = s * 0.3;
      c.moveTo(0, topCurveHeight);
      c.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, topCurveHeight);
      c.bezierCurveTo(-s / 2, (s + topCurveHeight) / 2, 0, (s + topCurveHeight) / 2, 0, s);
      c.bezierCurveTo(0, (s + topCurveHeight) / 2, s / 2, (s + topCurveHeight) / 2, s / 2, topCurveHeight);
      c.bezierCurveTo(s / 2, 0, 0, 0, 0, topCurveHeight);
      c.closePath();
      c.fill();
      c.restore();
    };

    const drawPetal = (c: CanvasRenderingContext2D, x: number, y: number, s: number, color: string, rot: number) => {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(s * 0.7, -s * 0.3, s, 0);
      c.quadraticCurveTo(s * 0.7, s * 0.3, 0, 0);
      c.fill();
      c.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.01) * 0.6 + p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y > height + 20) {
          particles[idx] = createParticle(-20);
        }

        if (p.type === 'heart') {
          drawHeart(ctx, p.x, p.y, p.size * 0.8, p.color, p.rotation);
        } else if (p.type === 'petal') {
          drawPetal(ctx, p.x, p.y, p.size, p.color, p.rotation);
        } else {
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.25, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    // Spawn hearts on user click
    const handleClick = (e: MouseEvent) => {
      for (let i = 0; i < 5; i++) {
        const burstParticle: Particle = {
          x: e.clientX + (Math.random() - 0.5) * 30,
          y: e.clientY + (Math.random() - 0.5) * 30,
          size: Math.random() * 12 + 10,
          speedY: -(Math.random() * 2 + 1),
          speedX: (Math.random() - 0.5) * 2,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.05,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: 'heart',
          opacity: 0.9,
        };
        particles.push(burstParticle);
        if (particles.length > 50) particles.shift();
      }
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10 h-full w-full opacity-70"
      aria-hidden="true"
    />
  );
};
