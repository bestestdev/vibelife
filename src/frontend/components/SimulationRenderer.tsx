import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useSimulationStore } from '../stores/simulationStore';

const SimulationRenderer: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  const organismEntities = useSimulationStore(state => state.organisms);
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    sceneRef.current = scene;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      canvasRef.current.clientWidth / canvasRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 50;
    cameraRef.current = camera;
    
    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;
    
    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x111122,
      wireframe: true,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current && canvasRef.current) {
        canvasRef.current.removeChild(rendererRef.current.domElement);
      }
      
      rendererRef.current?.dispose();
    };
  }, []);
  
  // Update organisms in the scene when the simulation state changes
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Clear previous organisms
    sceneRef.current.children = sceneRef.current.children.filter(
      child => child.userData.type !== 'organism'
    );
    
    // Add organisms from the simulation state
    organismEntities.forEach(organism => {
      const geometry = new THREE.SphereGeometry(organism.size, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(
          organism.traits.photosynthesis ? 0.3 : 0.0, 
          0.8, 
          0.5
        ),
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(organism.position.x, organism.position.y, organism.position.z);
      mesh.userData = { type: 'organism', id: organism.id };
      sceneRef.current?.add(mesh);
    });
    
  }, [organismEntities]);
  
  return (
    <div className="simulation-container">
      <div ref={canvasRef} className="canvas-container" />
    </div>
  );
};

export default SimulationRenderer; 