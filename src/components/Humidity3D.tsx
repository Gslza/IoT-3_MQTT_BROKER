import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Humidity3DProps {
  humidity: number;
}

export default function Humidity3D({ humidity }: Humidity3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Get current container size
    const width = containerRef.current.clientWidth || 300;
    const height = containerRef.current.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = null; // transparent

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Color and state selection
    let status = 'Normal';
    let colorHex = 0x10b981; // green
    if (humidity < 40) {
      status = 'Kering';
      colorHex = 0xeab308; // yellow / dry
    } else if (humidity >= 40 && humidity <= 70) {
      status = 'Normal';
      colorHex = 0x10b981; // green
    } else {
      status = 'Lembap';
      colorHex = 0x06b6d4; // light blue / cyan / humid
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // Main Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Face Sphere
    const faceGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const faceMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.15,
      metalness: 0.1,
    });
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    mainGroup.add(faceMesh);

    // 2. Eyes
    const eyeGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111827 });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.5, 0.3, 1.3);
    mainGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.5, 0.3, 1.3);
    mainGroup.add(rightEye);

    // 3. Mouth depending on humidity status
    let mouthMesh: THREE.Object3D;
    if (status === 'Kering') {
      // Unhappy flat or small wavy mouth
      const mouthGeo = new THREE.BoxGeometry(0.6, 0.08, 0.1);
      const mouthMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
      mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
      mouthMesh.position.set(0, -0.3, 1.35);
    } else if (status === 'Normal') {
      // Contented cute smile
      const mouthGeo = new THREE.TorusGeometry(0.4, 0.08, 8, 24, Math.PI);
      const mouthMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
      mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
      mouthMesh.position.set(0, -0.2, 1.35);
      mouthMesh.rotation.z = Math.PI; // Smile direction
    } else { // Lembap
      // Satisfied round gasp mouth with a droplet
      const mouthGeo = new THREE.TorusGeometry(0.2, 0.08, 8, 24);
      const mouthMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
      mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
      mouthMesh.position.set(0, -0.3, 1.35);
    }
    mainGroup.add(mouthMesh);

    // Adding multiple 3D droplet geometries floating/falling downwards or sticking to the side
    const dropletGroup = new THREE.Group();
    mainGroup.add(dropletGroup);

    // Helper to create a cute 3D teardrop/droplet
    const createWaterDroplet = (scale: number, pos: THREE.Vector3) => {
      const dropGroup = new THREE.Group();
      
      // Bottom sphere
      const sphereGeo = new THREE.SphereGeometry(0.15, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9,
      });
      const bottom = new THREE.Mesh(sphereGeo, sphereMat);
      dropGroup.add(bottom);

      // Top cone
      const coneGeo = new THREE.ConeGeometry(0.15, 0.3, 16);
      const cone = new THREE.Mesh(coneGeo, sphereMat);
      cone.position.y = 0.15;
      dropGroup.add(cone);

      dropGroup.position.copy(pos);
      dropGroup.scale.set(scale, scale, scale);
      return dropGroup;
    };

    if (status === 'Lembap') {
      // Multi water droplets sliding off face
      const d1 = createWaterDroplet(1, new THREE.Vector3(-0.7, 0.5, 1.3));
      const d2 = createWaterDroplet(0.8, new THREE.Vector3(0.8, -0.2, 1.25));
      dropletGroup.add(d1);
      dropletGroup.add(d2);
    }

    // 4. Mist/humidity particles (rising/hovering water particles)
    const particleCount = 50;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 3;
      const y = (Math.random() - 0.5) * 3;
      const z = (Math.random() - 0.5) * 3;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      speeds.push(0.005 + Math.random() * 0.015);
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleColor = status === 'Kering' ? 0xfef08a : 0x67e8f9; // sand yellow or sky blue mist
    const particlesMat = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.1,
      transparent: true,
      opacity: status === 'Lembap' ? 0.85 : 0.4,
    });

    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Drag-rotation variables
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      mainGroup.rotation.y += deltaX * 0.01;
      mainGroup.rotation.x += deltaY * 0.01;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const canvasDom = renderer.domElement;
    canvasDom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation frames loop
    let animeFrameId: number;
    const appClock = new THREE.Clock();

    const animateScene = () => {
      animeFrameId = requestAnimationFrame(animateScene);

      const elapsed = appClock.getElapsedTime();

      // Idle levitation wave animation (gelombang naik turun)
      if (status === 'Lembap') {
        mainGroup.position.y = Math.sin(elapsed * 2.5) * 0.25;
        mainGroup.rotation.y += 0.015;
      } else if (status === 'Normal') {
        mainGroup.position.y = Math.sin(elapsed * 1.5) * 0.12;
        mainGroup.rotation.y += 0.01;
      } else { // Kering
        mainGroup.position.y = Math.sin(elapsed * 0.8) * 0.05;
        mainGroup.rotation.y += 0.005; // slow
      }

      // Animate water particles (spray effect upwards)
      const posAttr = particlesGeo.attributes.position as THREE.BufferAttribute;
      const numPoints = posAttr.count;
      for (let i = 0; i < numPoints; i++) {
        let pY = posAttr.getY(i);
        pY += speeds[i];
        if (pY > 2.5) {
          pY = -2.5; // cycle
        }
        posAttr.setY(i, pY);
      }
      posAttr.needsUpdate = true;

      // Make droplets shimmer/vibrate a bit if humid
      if (status === 'Lembap') {
        const dropletCount = dropletGroup.children.length;
        for (let idx = 0; idx < dropletCount; idx++) {
          const drop = dropletGroup.children[idx];
          // slide down animation
          drop.position.y -= 0.005;
          if (drop.position.y < -1.4) {
            drop.position.y = 0.5 + Math.random() * 0.5;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animateScene();

    const resizeHandler = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resObserver = new ResizeObserver(resizeHandler);
    resObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animeFrameId);
      resObserver.disconnect();
      canvasDom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    };
  }, [humidity]);

  return (
    <div className="relative w-full h-[280px] flex items-center justify-center overflow-hidden">
      <div ref={containerRef} className="w-full h-full touch-none cursor-grab active:cursor-grabbing" id="three_humidity_canvas" />
    </div>
  );
}
