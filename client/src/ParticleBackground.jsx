import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let waves = [];
    let mouseX = 0;
    let mouseY = 0;
    let time = 0;
    let isMobile = window.innerWidth < 768;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      isMobile = window.innerWidth < 768;
    };

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * (isMobile ? 2 : 3) + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = Math.random() > 0.5 ? '139, 92, 246' : '59, 130, 246';
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (!isMobile) {
          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const angle = Math.atan2(dy, dx);
            const force = (100 - distance) / 100;
            this.x -= Math.cos(angle) * force * 2;
            this.y -= Math.sin(angle) * force * 2;
          }
        }

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        if (!isMobile) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = `rgba(${this.color}, ${this.opacity})`;
        }
      }
    }

    class Wave {
      constructor(y, speed, amplitude, color) {
        this.y = y;
        this.speed = speed;
        this.amplitude = amplitude;
        this.color = color;
        this.offset = Math.random() * Math.PI * 2;
      }

      draw() {
        ctx.beginPath();
        ctx.moveTo(0, this.y);

        for (let x = 0; x < canvas.width; x += (isMobile ? 10 : 5)) {
          const y = this.y + Math.sin(x * 0.01 + time * this.speed + this.offset) * this.amplitude;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, this.y - 100, 0, canvas.height);
        gradient.addColorStop(0, this.color + '00');
        gradient.addColorStop(1, this.color + (isMobile ? '15' : '20'));
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    class Grid {
      draw() {
        if (isMobile) return; // Skip grid on mobile for performance
        
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 50;
        
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }
    }

    const init = () => {
      particles = [];
      const particleCount = isMobile 
        ? Math.min(50, Math.floor((canvas.width * canvas.height) / 20000))
        : Math.min(150, Math.floor((canvas.width * canvas.height) / 10000));
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }

      waves = [
        new Wave(canvas.height * 0.7, 0.02, isMobile ? 20 : 30, 'rgba(139, 92, 246, '),
        new Wave(canvas.height * 0.75, 0.015, isMobile ? 30 : 40, 'rgba(59, 130, 246, '),
        new Wave(canvas.height * 0.8, 0.01, isMobile ? 40 : 50, 'rgba(236, 72, 153, '),
      ];
    };

    const grid = new Grid();

    const animate = () => {
      time += 0.01;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      grid.draw();
      waves.forEach(wave => wave.draw());

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      ctx.shadowBlur = 0;
      
      // Draw connections only on desktop or reduce on mobile
      const connectionDistance = isMobile ? 100 : 150;
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * (isMobile ? 0.2 : 0.3);
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      // Draw glowing orbs (smaller on mobile)
      const orbSize = isMobile ? 100 : 150;
      drawGlowingOrb(canvas.width * 0.2, canvas.height * 0.3, orbSize, 'rgba(139, 92, 246, 0.1)');
      drawGlowingOrb(canvas.width * 0.8, canvas.height * 0.6, orbSize * 1.3, 'rgba(59, 130, 246, 0.1)');
      drawGlowingOrb(canvas.width * 0.5, canvas.height * 0.8, orbSize * 1.2, 'rgba(236, 72, 153, 0.1)');

      animationFrameId = requestAnimationFrame(animate);
    };

    const drawGlowingOrb = (x, y, radius, color) => {
      const wobbleX = Math.sin(time * 0.5) * (isMobile ? 15 : 30);
      const wobbleY = Math.cos(time * 0.3) * (isMobile ? 10 : 20);
      
      const gradient = ctx.createRadialGradient(
        x + wobbleX, y + wobbleY, 0,
        x + wobbleX, y + wobbleY, radius
      );
      gradient.addColorStop(0, color.replace('0.1', '0.3'));
      gradient.addColorStop(0.5, color);
      gradient.addColorStop(1, color.replace('0.1', '0'));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x + wobbleX, y + wobbleY, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const handleMouseMove = (e) => {
      if (!isMobile) {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }
    };

    const handleResize = () => {
      resizeCanvas();
      init();
    };

    resizeCanvas();
    init();
    animate();

    window.addEventListener('resize', handleResize);
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/30 to-blue-900/20" />
      
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-blue-600/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-pink-600/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
    </div>
  );
}
