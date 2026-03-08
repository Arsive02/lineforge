"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

interface ModelPreviewProps {
  glbUrl: string;
}

export default function ModelPreview({ glbUrl }: ModelPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !glbUrl) return;

    // Proxy external URLs through our API to avoid CORS issues
    const loadUrl = glbUrl.startsWith("/")
      ? glbUrl
      : `/api/proxy-glb?url=${encodeURIComponent(glbUrl)}`;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 400;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1628);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3, 2, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Controls — drag to rotate, scroll to zoom, right-click to pan
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2;
    controls.minDistance = 1;
    controls.maxDistance = 15;

    // Stop auto-rotate when user interacts, resume after idle
    let idleTimer: ReturnType<typeof setTimeout>;
    controls.addEventListener("start", () => {
      controls.autoRotate = false;
      clearTimeout(idleTimer);
    });
    controls.addEventListener("end", () => {
      idleTimer = setTimeout(() => {
        controls.autoRotate = true;
      }, 3000);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Grid helper with blueprint styling
    const gridHelper = new THREE.GridHelper(10, 20, 0x3b82f6, 0x1e3a5f);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Load GLB model
    const loader = new GLTFLoader();
    loader.load(
      loadUrl,
      (gltf) => {
        const model = gltf.scene;

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;

        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        model.position.y += size.y * scale * 0.5;

        scene.add(model);
      },
      undefined,
      (error) => {
        console.error("Error loading GLB:", error);
      }
    );

    // Animation loop
    let animationId: number;
    function animate() {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    const handleResize = () => {
      const newWidth = container.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      clearTimeout(idleTimer);
      renderer.dispose();
      controls.dispose();
    };
  }, [glbUrl]);

  return (
    <div className="border border-bp-border">
      <div className="p-3 border-b border-bp-border/50 flex items-center gap-2">
        <span className="text-bp-accent text-xs tracking-widest">03</span>
        <span className="text-bp-text text-sm tracking-wide">3D PREVIEW</span>
        <span className="text-[10px] text-bp-text-muted ml-auto">LEFT-DRAG: ROTATE · SCROLL: ZOOM · RIGHT-DRAG: PAN</span>
      </div>
      <div ref={containerRef} className="w-full" style={{ height: 400 }} />
    </div>
  );
}
