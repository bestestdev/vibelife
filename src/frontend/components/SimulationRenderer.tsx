import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useSimulationStore } from '../stores/simulationStore';
import { Organism } from '../stores/simulationStore';

interface OrganismMesh {
  id: string;
  mesh: THREE.Mesh;
  organism: Organism;
}

const SimulationRenderer: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const organismMeshesRef = useRef<OrganismMesh[]>([]);
  const lastTickTimeRef = useRef<number>(Date.now());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  
  // Get organisms and simulation state
  const { 
    organisms, 
    isRunning, 
    simulationSpeed, 
    playerControlledOrganism,
    takeControlOfOrganism,
    releaseControlOfOrganism,
    movePlayerOrganism
  } = useSimulationStore(state => ({
    organisms: state.organisms,
    isRunning: state.isRunning,
    simulationSpeed: state.simulationSpeed,
    playerControlledOrganism: state.playerControlledOrganism,
    takeControlOfOrganism: state.takeControlOfOrganism,
    releaseControlOfOrganism: state.releaseControlOfOrganism,
    movePlayerOrganism: state.movePlayerOrganism
  }));
  
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
    
    // Add click handler to select organisms
    const handleClick = (event: MouseEvent) => {
      if (!canvasRef.current || !sceneRef.current || !cameraRef.current) return;
      
      // Calculate mouse position in normalized device coordinates
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Update the picking ray with the camera and mouse position
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      
      // Calculate objects intersecting the picking ray
      const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children);
      
      // Check if we clicked on an organism
      for (let i = 0; i < intersects.length; i++) {
        const userData = intersects[i].object.userData;
        if (userData.type === 'organism') {
          // Take control of the clicked organism
          takeControlOfOrganism(userData.id);
          return;
        }
      }
      
      // If clicked elsewhere, release control
      if (playerControlledOrganism) {
        releaseControlOfOrganism();
      }
    };
    
    // Add keyboard controls for movement
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!playerControlledOrganism) return;
      
      const direction = { x: 0, y: 0, z: 0 };
      
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          direction.y = 1;
          break;
        case 'ArrowDown':
        case 's':
          direction.y = -1;
          break;
        case 'ArrowLeft':
        case 'a':
          direction.x = -1;
          break;
        case 'ArrowRight':
        case 'd':
          direction.x = 1;
          break;
        case 'q': // Up in z-axis
          direction.z = 1;
          break;
        case 'e': // Down in z-axis
          direction.z = -1;
          break;
      }
      
      // Only move if a direction key was pressed
      if (direction.x !== 0 || direction.y !== 0 || direction.z !== 0) {
        movePlayerOrganism(direction);
        event.preventDefault();
      }
    };
    
    canvasRef.current.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    
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
      canvasRef.current?.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current && canvasRef.current) {
        canvasRef.current.removeChild(rendererRef.current.domElement);
      }
      
      rendererRef.current?.dispose();
    };
  }, [takeControlOfOrganism, releaseControlOfOrganism, movePlayerOrganism, playerControlledOrganism]);
  
  // Update meshes with organisms from the simulation state
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Remove meshes for organisms that no longer exist
    const currentIds = organisms.map(org => org.id);
    organismMeshesRef.current = organismMeshesRef.current.filter(item => {
      if (!currentIds.includes(item.id)) {
        sceneRef.current?.remove(item.mesh);
        return false;
      }
      return true;
    });
    
    // Add or update meshes for current organisms
    organisms.forEach(organism => {
      // Check if we already have a mesh for this organism
      let meshItem = organismMeshesRef.current.find(item => item.id === organism.id);
      
      if (!meshItem) {
        // Create new mesh for this organism
        const geometry = new THREE.SphereGeometry(organism.size, 16, 16);
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(
            organism.traits.photosynthesis ? 0.3 : 0.0, 
            0.8, 
            0.5
          ),
        });
        const mesh = new THREE.Mesh(geometry, material);
        // Set initial position
        mesh.position.set(
          organism.position.x,
          organism.position.y,
          organism.position.z
        );
        mesh.userData = { type: 'organism', id: organism.id };
        sceneRef.current?.add(mesh);
        
        // Add to our tracking array
        meshItem = { id: organism.id, mesh, organism };
        organismMeshesRef.current.push(meshItem);
      } else {
        // Update the stored organism reference
        meshItem.organism = organism;
      }
    });
    
    // Reset the last tick time when organisms change
    lastTickTimeRef.current = Date.now();
  }, [organisms]);
  
  // Animation loop for smooth movement
  useEffect(() => {
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // Calculate interpolation factor based on time
      const now = Date.now();
      const tickDuration = 1000 / simulationSpeed; // Duration between simulation ticks
      const timeSinceLastTick = now - lastTickTimeRef.current;
      const interpolationFactor = Math.min(timeSinceLastTick / tickDuration, 1);
      
      // Update organism positions with interpolation
      organismMeshesRef.current.forEach(({ mesh, organism }) => {
        if (organism.isPlayerControlled) {
          // For player-controlled organisms, we directly set position without interpolation
          mesh.position.set(
            organism.position.x,
            organism.position.y,
            organism.position.z
          );
        } else if (isRunning) {
          // For AI-controlled organisms, interpolate between positions
          mesh.position.set(
            organism.position.x + (organism.targetPosition.x - organism.position.x) * interpolationFactor,
            organism.position.y + (organism.targetPosition.y - organism.position.y) * interpolationFactor,
            organism.position.z + (organism.targetPosition.z - organism.position.z) * interpolationFactor
          );
        }
      });
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // This is a persistent animation loop, no need for cleanup
  }, [isRunning, simulationSpeed]);
  
  return (
    <div className="simulation-container">
      <div ref={canvasRef} className="canvas-container" />
      {playerControlledOrganism && (
        <div className="controls-overlay">
          <p>Controlling organism: {playerControlledOrganism.substring(0, 8)}...</p>
          <p>Use arrow keys or WASD to move, Q/E for up/down</p>
          <button onClick={releaseControlOfOrganism}>Release Control</button>
        </div>
      )}
    </div>
  );
};

export default SimulationRenderer; 