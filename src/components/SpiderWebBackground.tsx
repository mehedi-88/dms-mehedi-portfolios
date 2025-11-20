'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface SpiderWebNode {
  x: number;
  y: number;
  id: string;
}

interface SpiderWebLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  id: string;
}

export function SpiderWebBackground() {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Responsive sizing
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (svgRef.current) {
        svgRef.current.setAttribute('width', String(width));
        svgRef.current.setAttribute('height', String(height));
      }

      // Regenerate grid on resize
      generateWebMesh();
    };

    const generateWebMesh = () => {
      if (!svgRef.current) return;

      // Clear previous content
      while (svgRef.current.firstChild) {
        svgRef.current.removeChild(svgRef.current.firstChild);
      }

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Define grid spacing based on screen size
      const spacing = width < 768 ? 120 : width < 1024 ? 140 : 160;
      const offsetX = (width % spacing) / 2;
      const offsetY = (height % spacing) / 2;

      // Create nodes
      const nodes: SpiderWebNode[] = [];
      for (let x = offsetX; x < width; x += spacing) {
        for (let y = offsetY; y < height; y += spacing) {
          // Add slight randomness for organic feel
          const jitterX = (Math.random() - 0.5) * 20;
          const jitterY = (Math.random() - 0.5) * 20;
          nodes.push({
            x: x + jitterX,
            y: y + jitterY,
            id: `node-${nodes.length}`,
          });
        }
      }

      // Create defs for gradients and filters
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      
      // Radial gradient for nodes
      const radialGradient = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'radialGradient'
      );
      radialGradient.setAttribute('id', 'nodeGradient');
      radialGradient.setAttribute('cx', '50%');
      radialGradient.setAttribute('cy', '50%');
      radialGradient.setAttribute('r', '50%');

      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', '#00C4FF');
      stop1.setAttribute('stop-opacity', '0.8');

      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', '#1254FF');
      stop2.setAttribute('stop-opacity', '0.2');

      radialGradient.appendChild(stop1);
      radialGradient.appendChild(stop2);

      // Glow filter
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.setAttribute('id', 'glow');
      filter.setAttribute('x', '-50%');
      filter.setAttribute('y', '-50%');
      filter.setAttribute('width', '200%');
      filter.setAttribute('height', '200%');

      const feGaussianBlur = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'feGaussianBlur'
      );
      feGaussianBlur.setAttribute('stdDeviation', '3');
      feGaussianBlur.setAttribute('result', 'coloredBlur');

      const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
      const feMergeNode1 = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'feMergeNode'
      );
      feMergeNode1.setAttribute('in', 'coloredBlur');
      const feMergeNode2 = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'feMergeNode'
      );
      feMergeNode2.setAttribute('in', 'SourceGraphic');

      feMerge.appendChild(feMergeNode1);
      feMerge.appendChild(feMergeNode2);
      filter.appendChild(feGaussianBlur);
      filter.appendChild(feMerge);

      defs.appendChild(radialGradient);
      defs.appendChild(filter);
      svgRef.current.appendChild(defs);

      // Create lines connecting nearby nodes
      const lines: SpiderWebLine[] = [];
      const maxDistance = spacing * 1.5;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance && Math.random() > 0.3) {
            lines.push({
              x1: nodes[i].x,
              y1: nodes[i].y,
              x2: nodes[j].x,
              y2: nodes[j].y,
              id: `line-${lines.length}`,
            });
          }
        }
      }

      // Draw lines
      const lineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      lineGroup.setAttribute('class', 'web-lines');
      lineGroup.setAttribute('stroke', '#00C4FF');
      lineGroup.setAttribute('stroke-width', '0.8');
      lineGroup.setAttribute('opacity', '0.25');
      lineGroup.setAttribute('stroke-dasharray', '100');
      lineGroup.setAttribute('stroke-dashoffset', '100');

      lines.forEach((line) => {
        const lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        lineElement.setAttribute('x1', String(line.x1));
        lineElement.setAttribute('y1', String(line.y1));
        lineElement.setAttribute('x2', String(line.x2));
        lineElement.setAttribute('y2', String(line.y2));
        lineElement.setAttribute('class', `web-line ${line.id}`);
        lineGroup.appendChild(lineElement);
      });

      svgRef.current.appendChild(lineGroup);

      // Draw nodes
      const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeGroup.setAttribute('class', 'web-nodes');

      nodes.forEach((node) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', String(node.x));
        circle.setAttribute('cy', String(node.y));
        circle.setAttribute('r', '2.5');
        circle.setAttribute('fill', 'url(#nodeGradient)');
        circle.setAttribute('class', `web-node ${node.id}`);
        circle.setAttribute('filter', 'url(#glow)');
        circle.setAttribute('opacity', '0.6');
        nodeGroup.appendChild(circle);
      });

      svgRef.current.appendChild(nodeGroup);

      // Animate
      animateWeb();
    };

    const animateWeb = () => {
      // Kill previous animation if exists
      if (animationRef.current) {
        animationRef.current.kill();
      }

      // Create new timeline
      const tl = gsap.timeline({ repeat: -1 });

      // Animate lines: draw/undraw
      tl.to('.web-lines line', {
        strokeDashoffset: (i: number) => -100 - i * 2,
        duration: 8,
        ease: 'power1.inOut',
        stagger: 0.05,
      }, 0);

      // Animate nodes: pulse and fade
      tl.to(
        '.web-nodes circle',
        {
          opacity: (i: number) => 0.2 + Math.sin(i) * 0.4,
          duration: 2,
          ease: 'sine.inOut',
          stagger: 0.08,
        },
        0
      );

      // Subtle color shift
      tl.to(
        '.web-lines',
        {
          stroke: '#1254FF',
          duration: 4,
          ease: 'sine.inOut',
        },
        2
      );

      tl.to(
        '.web-lines',
        {
          stroke: '#00C4FF',
          duration: 4,
          ease: 'sine.inOut',
        },
        6
      );

      animationRef.current = tl;
    };

    // Initial setup
    generateWebMesh();

    // Handle resize
    const resizeHandler = () => {
      updateDimensions();
    };

    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="fixed inset-0 pointer-events-none z-0 w-screen h-screen"
      style={{
        filter: 'drop-shadow(0 0 20px rgba(0, 196, 255, 0.1))',
      }}
    />
  );
}

export default SpiderWebBackground;
