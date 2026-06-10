import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface VoiceSpectrum3DProps {
  isActive: boolean;
  intensity?: number; // optional external amplitude logic
}

export default function VoiceSpectrum3D({ isActive, intensity = 0 }: VoiceSpectrum3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 300;
    const height = containerRef.current.clientHeight || 250;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Dynamic Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f5ff, 2, 50);
    pointLight.position.set(0, 5, 2);
    scene.add(pointLight);

    const dirLight = new THREE.DirectionalLight(0x3b82f6, 1.2);
    dirLight.position.set(2, 6, 4);
    scene.add(dirLight);

    // Create a circular arrangement of 3D bars
    const barCount = 32;
    const barsGroup = new THREE.Group();
    scene.add(barsGroup);

    const barWidth = 0.12;
    const barDepth = 0.12;
    const defaultHeight = 0.05;
    const radius = 2.0;

    const bars: THREE.Mesh[] = [];
    const barGlows: THREE.Mesh[] = [];

    const barGeo = new THREE.BoxGeometry(barWidth, defaultHeight, barDepth);
    
    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      
      // Material with gradient glow or modern tech color
      // Shift colors around the wheel (cyan to magenta)
      const color = new THREE.Color().setHSL(i / barCount, 1.0, 0.5);
      const barMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.2,
        roughness: 0.1,
        metalness: 0.1,
      });

      const barMesh = new THREE.Mesh(barGeo, barMat);
      
      // Position on the ring
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      
      barMesh.position.set(x, 0, z);
      
      // Rotate bar to face outwards
      barMesh.rotation.y = -angle;

      barsGroup.add(barMesh);
      bars.push(barMesh);
    }

    // Floating micro-particles that rise up from the center
    const particleCount = 60;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleSpeeds: number[] = [];
    const particleRads: number[] = [];
    const particleAngles: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      positions[i * 3] = r * Math.cos(ang);
      positions[i * 3 + 1] = Math.random() * 2; // initial Y
      positions[i * 3 + 2] = r * Math.sin(ang);

      particleSpeeds.push(0.01 + Math.random() * 0.02);
      particleRads.push(r);
      particleAngles.push(ang);
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMat = new THREE.PointsMaterial({
      color: 0x22d3ee, // cyan glow
      size: 0.08,
      transparent: true,
      opacity: 0.65,
    });

    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Micro interactive controls: drag to rotate ring
    let isDragging = false;
    let prevMouseX = 0;
    const canvasDom = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      barsGroup.rotation.y += deltaX * 0.01;
      prevMouseX = e.clientX;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    canvasDom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation Loop
    let animeId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animeId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Rotate group slowly
      barsGroup.rotation.y += 0.005;

      // Pulse emissive color of point light
      pointLight.intensity = isActive ? 2 + Math.sin(elapsed * 10) * 1.5 : 0.5;

      // Animate Bar Heights
      for (let i = 0; i < barCount; i++) {
        const bar = bars[i];
        
        let targetScaleY = 1.0;
        if (isActive) {
          // Generate wave simulation based on math & index
          // Wave pattern combined with active speech intensity or noise
          const wave = Math.sin(i * 0.5 + elapsed * 15) * Math.cos(i * 0.3 - elapsed * 10);
          const noise = Math.random() * 0.5;
          const speechMultiplier = intensity > 0 ? intensity * 8 : 4;
          targetScaleY = Math.max(1, (wave + 1) * speechMultiplier + noise);
        } else {
          // Quiet, low-freq organic idle breathe
          targetScaleY = 1 + (Math.sin(i * 0.3 + elapsed * 2) + 1) * 0.25;
        }

        // Smooth interpolation towards target scale
        bar.scale.y += (targetScaleY - bar.scale.y) * 0.2;
        
        // Position y is set so the scale expands upwards from base (origin is center)
        bar.position.y = (bar.scale.y * defaultHeight) / 2;
        
        // Dynamic color changes based on height scaling
        const mat = bar.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = isActive ? 0.3 + (bar.scale.y / 10) : 0.15;
      }

      // Animate Particles
      const posAttr = particlesGeo.attributes.position as THREE.BufferAttribute;
      const count = posAttr.count;

      for (let i = 0; i < count; i++) {
        let pY = posAttr.getY(i);
        
        // speed depends on active state
        const lift = isActive ? particleSpeeds[i] * 2.5 : particleSpeeds[i] * 0.5;
        pY += lift;

        // Reset particle position if it goes high
        if (pY > 3) {
          pY = 0;
          const ang = Math.random() * Math.PI * 2;
          const r = Math.random() * radius;
          posAttr.setX(i, r * Math.cos(ang));
          posAttr.setZ(i, r * Math.sin(ang));
        }

        // Add small vortex swirl
        let pX = posAttr.getX(i);
        let pZ = posAttr.getZ(i);
        const swirlAngle = (isActive ? 0.03 : 0.01);
        const cosSA = Math.cos(swirlAngle);
        const sinSA = Math.sin(swirlAngle);
        
        const newX = pX * cosSA - pZ * sinSA;
        const newZ = pX * sinSA + pZ * cosSA;
        
        posAttr.setX(i, newX);
        posAttr.setY(i, pY);
        posAttr.setZ(i, newZ);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const resizeHandler = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const robserver = new ResizeObserver(resizeHandler);
    robserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animeId);
      robserver.disconnect();
      canvasDom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    };
  }, [isActive, intensity]);

  return (
    <div className="relative w-full h-[250px] flex items-center justify-center overflow-hidden">
      <div ref={containerRef} className="w-full h-full touch-none cursor-grab active:cursor-grabbing" id="three_spectrum_canvas" />
    </div>
  );
}
