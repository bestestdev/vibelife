import { Organism, Position, OrganismTraits, InitialOrganismSettings } from '../frontend/stores/simulationStore';

// Constants for simulation
const WORLD_SIZE = { x: 100, y: 100, z: 100 };
const BASE_ENERGY_CONSUMPTION = 0.1;
const MUTATION_RATE = 0.1;
const MUTATION_STRENGTH = 0.1;
const MAX_AGE = 100;
const REPRODUCTION_ENERGY_COST = 10;
const REPRODUCTION_ENERGY_THRESHOLD = 20;

// Utils
/**
 * Generate a random UUID for organism identification
 */
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Calculate Euclidean distance between two positions
 */
const calculateDistance = (pos1: Position, pos2: Position): number => {
  return Math.sqrt(
    Math.pow(pos2.x - pos1.x, 2) + 
    Math.pow(pos2.y - pos1.y, 2) + 
    Math.pow(pos2.z - pos1.z, 2)
  );
};

/**
 * Inherit traits from parent with possible mutations
 */
const inheritTraits = (parentTraits: OrganismTraits): OrganismTraits => {
  const mutateValue = (value: number): number => {
    if (Math.random() < MUTATION_RATE) {
      // Apply mutation
      const mutationAmount = (Math.random() * 2 - 1) * MUTATION_STRENGTH;
      value += mutationAmount;
      // Clamp values between 0 and 1
      value = Math.max(0, Math.min(1, value));
    }
    return value;
  };

  return {
    motility: mutateValue(parentTraits.motility),
    photosynthesis: mutateValue(parentTraits.photosynthesis),
    predation: mutateValue(parentTraits.predation),
    defense: mutateValue(parentTraits.defense),
    sensory: mutateValue(parentTraits.sensory),
    reproduction: mutateValue(parentTraits.reproduction),
    metabolism: mutateValue(parentTraits.metabolism),
  };
};

/**
 * Get random position within world bounds
 */
const getRandomPosition = (): Position => {
  return {
    x: Math.random() * WORLD_SIZE.x - WORLD_SIZE.x / 2,
    y: Math.random() * WORLD_SIZE.y - WORLD_SIZE.y / 2,
    z: Math.random() * WORLD_SIZE.z - WORLD_SIZE.z / 2
  };
};

/**
 * Create a new organism with default traits
 */
export const createInitialOrganism = (initialSettings: InitialOrganismSettings): Organism => {
  return {
    id: generateId(),
    position: getRandomPosition(),
    size: initialSettings.size ?? 1.0,
    traits: {
      motility: initialSettings.motility ?? 0.1,
      photosynthesis: initialSettings.photosynthesis ?? 0.5,
      predation: initialSettings.predation ?? 0.1,
      defense: initialSettings.defense ?? 0.1,
      sensory: initialSettings.sensory ?? 0.1,
      reproduction: initialSettings.reproduction ?? 0.3,
      metabolism: initialSettings.metabolism ?? 0.5
    },
    energy: 10,
    age: 0,
    generation: 0,
    actions: []
  };
};

/**
 * Move organism based on its motility trait
 */
const moveOrganism = (organism: Organism, environment: any): Organism => {
  if (organism.energy <= 0) return organism;

  const motilityFactor = organism.traits.motility;
  const movementCost = motilityFactor * 0.5;
  
  if (organism.energy < movementCost) return organism;

  // Random movement direction
  const angle = Math.random() * Math.PI * 2;
  const distance = motilityFactor * 2; // Max movement distance
  
  const newPosition = {
    x: organism.position.x + Math.cos(angle) * distance,
    y: organism.position.y + Math.sin(angle) * distance,
    z: organism.position.z + (Math.random() - 0.5) * distance
  };
  
  // Keep within world bounds
  newPosition.x = Math.max(-WORLD_SIZE.x/2, Math.min(WORLD_SIZE.x/2, newPosition.x));
  newPosition.y = Math.max(-WORLD_SIZE.y/2, Math.min(WORLD_SIZE.y/2, newPosition.y));
  newPosition.z = Math.max(-WORLD_SIZE.z/2, Math.min(WORLD_SIZE.z/2, newPosition.z));
  
  return {
    ...organism,
    position: newPosition,
    energy: organism.energy - movementCost,
    actions: [...organism.actions, 'moved']
  };
};

/**
 * Process photosynthesis for an organism
 */
const processPhotosynthesis = (organism: Organism, environment: any): Organism => {
  if (organism.traits.photosynthesis <= 0) return organism;
  
  // Light level diminishes with depth (z axis)
  const depthFactor = 1 - Math.abs(organism.position.z / (WORLD_SIZE.z / 2));
  const lightAvailability = environment.lightLevel * depthFactor;
  
  // Calculate energy gained from photosynthesis
  const energyGain = organism.traits.photosynthesis * lightAvailability * environment.resources.light / 100;
  
  return {
    ...organism,
    energy: organism.energy + energyGain,
    actions: [...organism.actions, 'photosynthesis']
  };
};

/**
 * Process predation behavior for an organism
 */
const processPredation = (organism: Organism, organisms: Organism[]): [Organism, Organism[]] => {
  if (organism.traits.predation <= 0 || organism.energy <= 0) {
    return [organism, organisms];
  }
  
  // Find nearby prey
  const sensoryRange = organism.traits.sensory * 10;
  const potentialPrey = organisms.filter(other => 
    other.id !== organism.id && 
    calculateDistance(organism.position, other.position) <= sensoryRange &&
    other.size < organism.size * 1.2 // Can only prey on smaller or similar sized organisms
  );
  
  if (potentialPrey.length === 0) return [organism, organisms];
  
  // Sort by proximity and vulnerability (inverse of defense)
  potentialPrey.sort((a, b) => {
    const distA = calculateDistance(organism.position, a.position);
    const distB = calculateDistance(organism.position, b.position);
    const vulnA = (1 - a.traits.defense) / distA;
    const vulnB = (1 - b.traits.defense) / distB;
    return vulnB - vulnA;
  });
  
  // Attempt to prey on the most vulnerable organism
  const prey = potentialPrey[0];
  const preyDistance = calculateDistance(organism.position, prey.position);
  const predationSuccess = organism.traits.predation > prey.traits.defense && 
                          Math.random() < (organism.traits.predation - prey.traits.defense + 0.2);
  
  // Predation is successful
  if (predationSuccess) {
    // Energy gained is proportional to prey's energy and size
    const energyGained = prey.energy * 0.7 + prey.size * 3;
    
    // Remove the prey from the organisms list
    const updatedOrganisms = organisms.filter(o => o.id !== prey.id);
    
    return [
      {
        ...organism,
        energy: organism.energy + energyGained,
        actions: [...organism.actions, 'predation']
      },
      updatedOrganisms
    ];
  }
  
  // Predation attempt failed, both organisms lose some energy
  const predatorEnergyLoss = organism.traits.predation * 0.5;
  const preyEnergyLoss = prey.traits.defense * 0.3;
  
  const updatedPrey = {
    ...prey,
    energy: prey.energy - preyEnergyLoss,
    actions: [...prey.actions, 'defended']
  };
  
  const updatedOrganisms = organisms.map(o => 
    o.id === prey.id ? updatedPrey : o
  );
  
  return [
    {
      ...organism,
      energy: organism.energy - predatorEnergyLoss,
      actions: [...organism.actions, 'failed_predation']
    },
    updatedOrganisms
  ];
};

/**
 * Process reproduction for an organism
 */
const processReproduction = (organism: Organism): [Organism, Organism | null] => {
  // Check if organism has enough energy to reproduce
  if (organism.energy < REPRODUCTION_ENERGY_THRESHOLD || 
      Math.random() > organism.traits.reproduction) {
    return [organism, null];
  }
  
  // Create offspring with inherited traits
  const offspring: Organism = {
    id: generateId(),
    position: {
      x: organism.position.x + (Math.random() - 0.5) * 2,
      y: organism.position.y + (Math.random() - 0.5) * 2,
      z: organism.position.z + (Math.random() - 0.5) * 2
    },
    size: organism.size * (0.8 + Math.random() * 0.4), // Slight variation in size
    traits: inheritTraits(organism.traits),
    energy: REPRODUCTION_ENERGY_COST * 0.7, // Offspring gets part of the energy invested
    age: 0,
    generation: organism.generation + 1,
    parentId: organism.id,
    actions: ['born']
  };
  
  // Parent loses energy from reproduction
  const updatedOrganism = {
    ...organism,
    energy: organism.energy - REPRODUCTION_ENERGY_COST,
    actions: [...organism.actions, 'reproduction']
  };
  
  return [updatedOrganism, offspring];
};

/**
 * Apply metabolism energy cost and aging
 */
const processMetabolism = (organism: Organism): Organism => {
  // Base metabolism cost plus scaling with size and traits
  const metabolismCost = BASE_ENERGY_CONSUMPTION * 
                        (1 + organism.traits.metabolism) * 
                        (1 + organism.size * 0.5);
  
  // Increment age
  const newAge = organism.age + 1;
  
  // Energy decreases with age past a certain point
  const ageDegeneration = newAge > MAX_AGE * 0.7 ? 
                         (newAge - MAX_AGE * 0.7) * 0.01 : 0;
  
  return {
    ...organism,
    energy: organism.energy - metabolismCost - ageDegeneration,
    age: newAge,
    actions: [...organism.actions, 'metabolism']
  };
};

/**
 * Simulate a generation for all organisms
 */
export const simulateGeneration = (state: any): any => {
  let { organisms, environment } = state;
  let newOrganisms: Organism[] = [];
  
  // Process each organism
  for (const organism of organisms) {
    // Clear previous actions
    let updatedOrganism: Organism = { ...organism, actions: [] };
    
    // Skip dead organisms
    if (updatedOrganism.energy <= 0 || updatedOrganism.age >= MAX_AGE) {
      continue;
    }
    
    // Apply metabolism and aging
    updatedOrganism = processMetabolism(updatedOrganism);
    
    // Skip if organism died from metabolism
    if (updatedOrganism.energy <= 0) {
      continue;
    }
    
    // Process movement
    updatedOrganism = moveOrganism(updatedOrganism, environment);
    
    // Process photosynthesis
    updatedOrganism = processPhotosynthesis(updatedOrganism, environment);
    
    // Process predation
    let remainingOrganisms = [...newOrganisms];
    [updatedOrganism, remainingOrganisms] = processPredation(updatedOrganism, remainingOrganisms);
    newOrganisms = remainingOrganisms;
    
    // Process reproduction
    let offspring: Organism | null = null;
    [updatedOrganism, offspring] = processReproduction(updatedOrganism);
    
    // Add the updated organism to the new list
    newOrganisms.push(updatedOrganism);
    
    // Add offspring if reproduction occurred
    if (offspring) {
      newOrganisms.push(offspring);
    }
  }
  
  // Update environment - simple model with some resource regeneration
  const updatedEnvironment = {
    ...environment,
    resources: {
      organic: Math.min(100, environment.resources.organic + 0.5),
      minerals: Math.min(100, environment.resources.minerals + 0.2),
      light: 100 // Light is constant
    }
  };
  
  // Return updated state
  return {
    ...state,
    organisms: newOrganisms,
    environment: updatedEnvironment
  };
};

/**
 * Fast forward simulation by multiple generations
 */
export const fastForward = (state: any, generations: number): any => {
  let currentState = { ...state };
  
  for (let i = 0; i < generations; i++) {
    currentState = simulateGeneration(currentState);
  }
  
  return {
    ...currentState,
    currentGeneration: state.currentGeneration + generations
  };
};

/**
 * Initialize the simulation
 */
export const initSimulation = async (): Promise<void> => {
  console.log('Initializing TypeScript simulation engine');
  // Nothing to initialize for the TypeScript version
  return Promise.resolve();
}; 