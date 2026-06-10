import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Temperature3DProps {
  temperature: number;
}

export default function Temperature3D({ temperature }: Temperature3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Get current container size
    const width = containerRef.current.clientWidth || 300;
    const height = containerRef.current.clientHeight || 300;

    // Create scene, camera, renderer
    const scene = new THREE.Scene();
    scene.background = null; // transparent background for modern dark card overlay

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Clear previous canvas
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Dynamic state based on temperature
    let status = 'Normal';
    let colorHex = 0x10b981; // green
    if (temperature < 25) {
      status = 'Dingin';
      colorHex = 0x3b82f6; // blue
    } else if (temperature >= 25 && temperature <= 30) {
      status = 'Normal';
      colorHex = 0x10b981; // green
    } else if (temperature > 30 && temperature <= 35) {
      status = 'Panas';
      colorHex = 0xf97316; // orange
    } else {
      status = 'Sangat Panas';
      colorHex = 0xef4444; // red
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Emoticon Group
    const emoticonGroup = new THREE.Group();
    scene.add(emoticonGroup);

    // 1. Face Sphere
    const faceGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const faceMaterial = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.2,
      metalness: 0.1,
    });
    const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
    emoticonGroup.add(faceMesh);

    // 2. Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.18, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x111827 }); // dark gray/black

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.5, 0.3, 1.3);
    emoticonGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.5, 0.3, 1.3);
    emoticonGroup.add(rightEye);

    // 3. Mouth depending on condition
    let mouthMesh: THREE.Object3D;
    
    if (status === 'Dingin') {
      // Wavy flat line (represented by small boxes)
      const mouthGroup = new THREE.Group();
      const segmentGeo = new THREE.BoxGeometry(0.2, 0.08, 0.1);
      const segmentMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
      
      for (let i = -2; i <= 2; i++) {
        const seg = new THREE.Mesh(segmentGeo, segmentMat);
        seg.position.set(i * 0.18, -0.4 + (i % 2 === 0 ? 0.05 : -0.05), 1.35);
        mouthGroup.add(seg);
      }
      mouthMesh = mouthGroup;
    } else if (status === 'Normal') {
      // Smile curve using a partial Torus
      const mouthGeometry = new THREE.TorusGeometry(0.4, 0.08, 8, 24, Math.PI);
      const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x111827 });
      mouthMesh = new THREE.Mesh(mouthGeometry, mouthMaterial);
      mouthMesh.position.set(0, -0.2, 1.35);
      mouthMesh.rotation.x = 0;
      mouthMesh.rotation.z = Math.PI; // flip it upside down to make a smile
    } else if (status === 'Panas') {
      // Big open gasp / circle mouth
      const mouthGeometry = new THREE.TorusGeometry(0.25, 0.08, 8, 24);
      const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x111827 });
      mouthMesh = new THREE.Mesh(mouthGeometry, mouthMaterial);
      mouthMesh.position.set(0, -0.4, 1.35);
    } else { // Sangat Panas
      // Wide open screaming mouth / capsule
      const mouthGeometry = new THREE.BoxGeometry(0.6, 0.3, 0.1);
      const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x111827 });
      mouthMesh = new THREE.Mesh(mouthGeometry, mouthMaterial);
      mouthMesh.position.set(0, -0.4, 1.35);
    }
    emoticonGroup.add(mouthMesh);

    // Cold shivering sweat drop, or heat sweat drop
    if (status === 'Panas' || status === 'Sangat Panas') {
      const dropGeo = new THREE.ConeGeometry(0.08, 0.2, 8);
      const dropMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
      const sweatDrop = new THREE.Mesh(dropGeo, dropMat);
      sweatDrop.position.set(0.6, 0.6, 1.3);
      sweatDrop.rotation.z = Math.PI;
      emoticonGroup.add(sweatDrop);
    }

    // 4. Particles surrounding
    const particleCount = 40;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      // Scatter within a sphere of radius 3
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0 + Math.random() * 1.5; // distance from center

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Speed up if hot
      const velocityY = (status === 'Panas' || status === 'Sangat Panas') 
        ? 0.01 + Math.random() * 0.02
        : -0.005 - Math.random() * 0.005; // fall if cold
      velocities.push(velocityY);
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    let particleColor = 0x60a5fa; // cold blue particles
    if (status === 'Normal') {
      particleColor = 0x34d399; // friendly green
    } else if (status === 'Panas') {
      particleColor = 0xfb923c; // orange warm glow
    } else if (status === 'Sangat Panas') {
      particleColor = 0xf87171; // red threat sparks
    }

    const particlesMaterial = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.12,
      transparent: true,
      opacity: 0.8,
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // Interactive Drag Rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      emoticonGroup.rotation.y += deltaMove.x * 0.01;
      emoticonGroup.rotation.x += deltaMove.y * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Auto rotation & status-specific behaviors
      if (status === 'Dingin') {
        // Bergetar pelan
        emoticonGroup.position.x = Math.sin(elapsedTime * 40) * 0.03;
        emoticonGroup.position.y = Math.cos(elapsedTime * 30) * 0.02;
        emoticonGroup.rotation.y += 0.005;
      } else if (status === 'Normal') {
        // Berputar pelan
        emoticonGroup.position.set(0, 0, 0);
        emoticonGroup.rotation.y += 0.01;
      } else if (status === 'Panas') {
        // Berputar lebih cepat
        emoticonGroup.position.set(0, 0, 0);
        emoticonGroup.rotation.y += 0.03;
      } else { // Sangat Panas
        // Bergetar cepat
        emoticonGroup.position.x = Math.sin(elapsedTime * 80) * 0.06;
        emoticonGroup.position.y = Math.cos(elapsedTime * 70) * 0.04;
        emoticonGroup.rotation.y += 0.05;
      }

      // Animate particles
      const positionsAttr = particlesGeometry.attributes.position as THREE.BufferAttribute;
      const count = positionsAttr.count;
      for (let i = 0; i < count; i++) {
        let y = positionsAttr.getY(i);
        y += velocities[i];

        // Reset if out of bounds
        if (velocities[i] > 0 && y > 3) {
          y = -2;
        } else if (velocities[i] < 0 && y < -3) {
          y = 2;
        }
        positionsAttr.setY(i, y);
      }
      positionsAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Responsive Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      domElem.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      renderer.dispose();
    };
  }, [temperature]);

  return (
    <div className="relative w-full h-[280px] flex items-center justify-center overflow-hidden">
      <div ref={containerRef} className="w-full h-full touch-none cursor-grab active:cursor-grabbing" id="three_temp_canvas" />
    </div>
  );
}
