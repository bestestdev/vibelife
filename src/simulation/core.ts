import { Organism, Position, OrganismTraits, InitialOrganismSettings } from '../frontend/stores/simulationStore';

// Define the expected types from the WebAssembly module
interface WasmModule {
  init_panic_hook: () => void;
  Simulation: {
    new (temperature: number, light: number, moisture: number): any;
  };
}

// Reference to the WASM module and simulation instance
let wasmModule: WasmModule | null = null;
let simulation: any = null;
let isInitialized = false;

/**
 * Ensure that the simulation has been initialized
 * @throws Error if the simulation has not been initialized
 */
const ensureInitialized = (): void => {
  if (!isInitialized || !simulation) {
    throw new Error(
      'Simulation has not been initialized. Make sure the WebAssembly module ' +
      'has been built (run npm run build:wasm) and initSimulation() has been called.'
    );
  }
};

/**
 * Initialize the simulation engine by loading the WebAssembly module
 * @throws Error if WebAssembly module cannot be loaded
 */
export const initSimulation = async (): Promise<void> => {
  console.log('Initializing WebAssembly simulation engine');
  
  if (isInitialized) {
    console.log('Simulation already initialized');
    return;
  }
  
  try {
    // Import the WebAssembly module using dynamic import
    // Webpack will handle this differently in development vs. production
    const module = await import('./rust/pkg');
    wasmModule = module as unknown as WasmModule;
    
    if (!wasmModule) {
      throw new Error('WebAssembly module failed to load');
    }
    
    console.log('WebAssembly module loaded successfully');
    wasmModule.init_panic_hook();
    
    // Create the simulation with default environment values
    simulation = new wasmModule.Simulation(0.5, 0.8, 0.6);
    console.log('Simulation engine initialized');
    
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize WebAssembly simulation engine:', error);
    throw new Error(
      'Simulation engine initialization failed. Make sure you have built the ' +
      'WebAssembly module (run npm run build:wasm) and that your browser supports WebAssembly.'
    );
  }
};

// Helper function to generate a unique ID
const generateId = (): string => {
  return 'organism-' + Math.random().toString(36).substr(2, 9);
};

// Helper function to calculate distance between two positions
const calculateDistance = (pos1: Position, pos2: Position): number => {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

// Helper function to mix traits from parent to offspring with mutation
const inheritTraits = (parentTraits: OrganismTraits, actions: string[]): OrganismTraits => {
  // Create a base inheritance from parent
  const traits: OrganismTraits = { ...parentTraits };
  
  // Apply random mutations (small changes to trait values)
  Object.keys(traits).forEach(key => {
    const traitKey = key as keyof OrganismTraits;
    
    // Base random mutation
    const mutationAmount = (Math.random() - 0.5) * 0.1; // +/- 0.05 maximum change
    traits[traitKey] = Math.max(0, Math.min(1, traits[traitKey] + mutationAmount));
    
    // Behavior-influenced mutations
    // Increase chance of mutation in specific traits based on action history
    if (actions.includes('moved') && traitKey === 'motility') {
      const boost = Math.random() * 0.05; // Up to +0.05 bonus
      traits.motility = Math.min(1, traits.motility + boost);
    }
    
    if (actions.includes('photosynthesis') && traitKey === 'photosynthesis') {
      const boost = Math.random() * 0.05;
      traits.photosynthesis = Math.min(1, traits.photosynthesis + boost);
    }
    
    if (actions.includes('consumed') && traitKey === 'predation') {
      const boost = Math.random() * 0.05;
      traits.predation = Math.min(1, traits.predation + boost);
    }
    
    if (actions.includes('escaped') && traitKey === 'defense') {
      const boost = Math.random() * 0.05;
      traits.defense = Math.min(1, traits.defense + boost);
    }
    
    if (actions.includes('detected') && traitKey === 'sensory') {
      const boost = Math.random() * 0.05;
      traits.sensory = Math.min(1, traits.sensory + boost);
    }
  });
  
  return traits;
};

// Function to process organism movement based on motility
const moveOrganism = (organism: Organism, environment: any): Organism => {
  if (organism.traits.motility < 0.05) return organism; // Too little motility to move
  
  // Calculate movement distance based on motility and size
  // Larger organisms move slower relative to their motility
  const moveDistance = organism.traits.motility * (1 / organism.size) * 0.5;
  
  // Random direction for now - could be influenced by resources, other organisms, etc.
  const angle = Math.random() * Math.PI * 2;
  const newPosition: Position = {
    x: organism.position.x + Math.cos(angle) * moveDistance,
    y: organism.position.y, // Keep on the ground for now
    z: organism.position.z + Math.sin(angle) * moveDistance,
  };
  
  // Consume energy based on movement - more for larger or faster moving organisms
  const energyCost = moveDistance * organism.size * 2;
  
  return {
    ...organism,
    position: newPosition,
    energy: organism.energy - energyCost,
    actions: [...organism.actions, 'moved']
  };
};

// Function to process photosynthesis based on light level and photosynthesis trait
const processPhotosynthesis = (organism: Organism, environment: any): Organism => {
  if (organism.traits.photosynthesis < 0.05) return organism; // Too little photosynthesis capability
  
  // Calculate energy gained from photosynthesis
  // Affected by:
  // - Photosynthesis trait level
  // - Environmental light level
  // - Organism size (larger = more surface area)
  const energyGain = 
    organism.traits.photosynthesis * 
    environment.lightLevel * 
    organism.size * 
    5; // Base multiplier
  
  return {
    ...organism,
    energy: organism.energy + energyGain,
    actions: [...organism.actions, 'photosynthesis']
  };
};

// Process reproduction for an organism
const processReproduction = (organism: Organism): [Organism, Organism | null] => {
  // Check if organism has enough energy and reproduction trait to reproduce
  if (organism.energy < 50 || organism.traits.reproduction < 0.2) {
    return [organism, null];
  }
  
  // Chance to reproduce based on reproduction trait and energy level
  const reproductionChance = organism.traits.reproduction * (organism.energy / 200);
  if (Math.random() > reproductionChance) {
    return [organism, null];
  }
  
  // Create offspring
  const offspring: Organism = {
    id: generateId(),
    position: { ...organism.position },
    size: organism.size * (0.8 + Math.random() * 0.4), // Size variation
    traits: inheritTraits(organism.traits, organism.actions.slice(-20)), // Pass last 20 actions
    energy: organism.energy * 0.3, // Transfer some energy to offspring
    age: 0,
    generation: organism.generation + 1,
    parentId: organism.id,
    actions: []
  };
  
  // Update parent after reproduction
  const updatedParent = {
    ...organism,
    energy: organism.energy * 0.7, // Parent loses energy transferred to offspring
    actions: [...organism.actions, 'reproduced']
  };
  
  return [updatedParent, offspring];
};

/**
 * Convert a WASM organism to a TypeScript organism
 */
const convertWasmOrganism = (wasmOrganism: any): Organism => {
  return {
    id: wasmOrganism.id,
    position: {
      x: wasmOrganism.position.x,
      y: wasmOrganism.position.y,
      z: wasmOrganism.position.z
    },
    size: wasmOrganism.size,
    traits: {
      motility: wasmOrganism.traits.motility,
      photosynthesis: wasmOrganism.traits.photosynthesis,
      predation: wasmOrganism.traits.predation,
      defense: wasmOrganism.traits.defense,
      sensory: wasmOrganism.traits.sensory,
      reproduction: wasmOrganism.traits.reproduction,
      metabolism: wasmOrganism.traits.metabolism
    },
    energy: wasmOrganism.energy,
    age: wasmOrganism.age,
    generation: wasmOrganism.generation,
    parentId: wasmOrganism.parent_id,
    actions: JSON.parse(wasmOrganism.get_actions())
  };
};

/**
 * Create a new organism with specified traits
 * @throws Error if the simulation is not initialized
 */
export const createInitialOrganism = (initialSettings: InitialOrganismSettings): Organism => {
  ensureInitialized();
  
  const wasmOrganism = simulation.create_initial_organism(
    initialSettings.motility || 0.1,
    initialSettings.photosynthesis || 0.5,
    initialSettings.size || 1.0
  );
  
  return convertWasmOrganism(wasmOrganism);
};

/**
 * Process one generation of the simulation
 * @throws Error if the simulation is not initialized
 */
export const simulateGeneration = (state: any): any => {
  ensureInitialized();
  
  const wasmOrganisms = simulation.simulate_generation();
  const organisms = Array.from(wasmOrganisms).map(convertWasmOrganism);
  
  return {
    ...state,
    organisms
  };
};

/**
 * Fast forward the simulation by multiple generations
 * @throws Error if the simulation is not initialized
 */
export const fastForward = (state: any, generations: number): any => {
  ensureInitialized();
  
  const wasmOrganisms = simulation.fast_forward(generations);
  const organisms = Array.from(wasmOrganisms).map(convertWasmOrganism);
  
  return {
    ...state,
    organisms,
    currentGeneration: state.currentGeneration + generations
  };
}; 