'use client';

import { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  className?: string;
}

export function AnimatedBackground({ className = '' }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initial resize
    resizeCanvas();

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);

    // Define dots and lines
    const dots: { x: number; y: number; size: number; color: string }[] = [];
    const lines: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];

    // Create dots
    const createDots = () => {
      dots.length = 0;
      
      // Corner dots
      const cornerPositions = [
        { x: 100, y: 100 },
        { x: canvas.width - 100, y: 100 },
        { x: 100, y: canvas.height - 100 },
        { x: canvas.width - 100, y: canvas.height - 100 },
      ];
      
      // Middle edge dots
      const middlePositions = [
        { x: 230, y: 230 },
        { x: canvas.width - 230, y: 230 },
        { x: 230, y: canvas.height - 230 },
        { x: canvas.width - 230, y: canvas.height - 230 },
      ];
      
      // Center dots
      const centerPositions = [
        { x: 360, y: 360 },
        { x: canvas.width - 360, y: 360 },
        { x: 360, y: canvas.height - 360 },
        { x: canvas.width - 360, y: canvas.height - 360 },
      ];
      
      // Bottom dots
      const bottomPositions = [
        { x: 180, y: canvas.height - 50 },
        { x: canvas.width - 180, y: canvas.height - 50 },
      ];

      // Add all dots with different colors
      cornerPositions.forEach(pos => {
        dots.push({ ...pos, size: 8, color: 'rgba(255, 255, 255, 0.7)' });
      });
      
      middlePositions.forEach(pos => {
        dots.push({ ...pos, size: 6, color: 'rgba(255, 220, 220, 0.6)' });
      });
      
      centerPositions.forEach(pos => {
        dots.push({ ...pos, size: 8, color: 'rgba(255, 255, 255, 0.7)' });
      });
      
      bottomPositions.forEach(pos => {
        dots.push({ ...pos, size: 8, color: 'rgba(255, 200, 100, 0.8)' });
      });
    };

    // Create lines
    const createLines = () => {
      lines.length = 0;
      
      // Top left lines
      lines.push({ 
        x1: 120, y1: 90, 
        x2: 200, y2: 120, 
        color: 'rgba(255, 255, 255, 0.6)' 
      });
      
      // Top right lines
      lines.push({ 
        x1: canvas.width - 120, y1: 90, 
        x2: canvas.width - 200, y2: 120, 
        color: 'rgba(255, 255, 255, 0.6)' 
      });
      
      // Middle left lines
      lines.push({ 
        x1: 180, y1: 270, 
        x2: 230, y2: 320, 
        color: 'rgba(255, 255, 200, 0.6)' 
      });
      
      // Middle right lines
      lines.push({ 
        x1: canvas.width - 180, y1: 270, 
        x2: canvas.width - 230, y2: 320, 
        color: 'rgba(255, 255, 200, 0.6)' 
      });
      
      // Bottom left lines
      lines.push({ 
        x1: 220, y1: canvas.height - 90, 
        x2: 280, y2: canvas.height - 120, 
        color: 'rgba(255, 255, 255, 0.6)' 
      });
      
      // Bottom right lines
      lines.push({ 
        x1: canvas.width - 220, y1: canvas.height - 90, 
        x2: canvas.width - 280, y2: canvas.height - 120, 
        color: 'rgba(255, 255, 255, 0.6)' 
      });
    };

    // Draw function
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw lines
      lines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 3;
        ctx.stroke();
      });
      
      // Draw dots
      dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
      });
    };

    // Initialize
    createDots();
    createLines();
    draw();

    // Handle resize
    window.addEventListener('resize', () => {
      resizeCanvas();
      createDots();
      createLines();
      draw();
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-[#4ECDC4]" />
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
} 