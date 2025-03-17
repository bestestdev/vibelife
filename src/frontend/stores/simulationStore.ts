import { create } from 'zustand';
import { simulateGeneration, fastForward, createInitialOrganism, createInitialPopulation } from '../../simulation/core';

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface OrganismTraits {
  motility: number;
  photosynthesis: number;
  predation: number;
  defense: number;
  sensory: number;
  reproduction: number;
  metabolism: number;
}

export interface Organism {
  id: string;
  position: Position;
  previousPosition: Position; // For interpolation: where the organism was before the current position
  targetPosition: Position;   // For interpolation: where the organism is moving to
  size: number;
  traits: OrganismTraits;
  energy: number;
  age: number;
  generation: number;
  parentId?: string;
  actions: string[];
  isPlayerControlled?: boolean; // Flag to indicate if this organism is being controlled by the player
}

export interface InitialOrganismSettings {
  motility?: number;
  photosynthesis?: number;
  predation?: number;
  defense?: number;
  sensory?: number;
  reproduction?: number;
  metabolism?: number;
  size?: number;
}

interface SimulationState {
  organisms: Organism[];
  isRunning: boolean;
  simulationSpeed: number;
  currentGeneration: number;
  environment: {
    temperature: number;
    lightLevel: number;
    moisture: number;
    resources: {
      organic: number;
      minerals: number;
      light: number;
    }
  };
  simulationInterval: number | null;
  playerControlledOrganism: string | null; // ID of the organism being controlled
  
  // Actions
  startSimulation: () => void;
  pauseSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  fastForward: (generations: number) => void;
  startNewSimulation: (initialTraits: InitialOrganismSettings, initialPopulationCount?: number) => void;
  
  // Player control actions
  takeControlOfOrganism: (organismId: string) => void;
  releaseControlOfOrganism: () => void;
  movePlayerOrganism: (direction: { x: number, y: number, z: number }) => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  organisms: [],
  isRunning: false,
  simulationSpeed: 1,
  currentGeneration: 0,
  playerControlledOrganism: null,
  environment: {
    temperature: 0.5, // Normalized value 0-1
    lightLevel: 0.8,
    moisture: 0.6,
    resources: {
      organic: 100,
      minerals: 100,
      light: 100
    }
  },
  simulationInterval: null,
  
  startSimulation: () => {
    const intervalId = window.setInterval(() => {
      set(state => {
        const nextState = simulateGeneration(state);
        return {
          ...nextState,
          currentGeneration: state.currentGeneration + 1
        };
      });
    }, 1000 / get().simulationSpeed);
    
    set({ isRunning: true, simulationInterval: intervalId });
  },
  
  pauseSimulation: () => {
    if (get().simulationInterval !== null) {
      window.clearInterval(get().simulationInterval as number);
    }
    set({ isRunning: false, simulationInterval: null });
  },
  
  setSimulationSpeed: (speed) => {
    set({ simulationSpeed: speed });
    
    // Restart simulation with new speed if it's running
    if (get().isRunning) {
      get().pauseSimulation();
      get().startSimulation();
    }
  },
  
  fastForward: async (generations) => {
    const isRunningBefore = get().isRunning;
    if (isRunningBefore) {
      get().pauseSimulation();
    }
    
    // Use the new fast-forward function
    const newState = fastForward(get(), generations);
    set(newState);
    
    if (isRunningBefore) {
      get().startSimulation();
    }
  },
  
  startNewSimulation: (initialTraits, initialPopulationCount = 5) => {
    // Stop any running simulation
    get().pauseSimulation();
    
    // Create initial population of organisms
    const initialPopulation = createInitialPopulation(initialTraits, initialPopulationCount);
    
    set({
      organisms: initialPopulation,
      currentGeneration: 0
    });
  },
  
  // Player control methods
  takeControlOfOrganism: (organismId: string) => {
    set(state => {
      const organisms = state.organisms.map(org => {
        if (org.id === organismId) {
          return { ...org, isPlayerControlled: true };
        } else if (org.isPlayerControlled) {
          // Remove control from any other organism
          return { ...org, isPlayerControlled: false };
        }
        return org;
      });
      
      return {
        ...state,
        organisms,
        playerControlledOrganism: organismId
      };
    });
  },
  
  releaseControlOfOrganism: () => {
    set(state => {
      const organisms = state.organisms.map(org => {
        if (org.isPlayerControlled) {
          return { ...org, isPlayerControlled: false };
        }
        return org;
      });
      
      return {
        ...state,
        organisms,
        playerControlledOrganism: null
      };
    });
  },
  
  movePlayerOrganism: (direction: { x: number, y: number, z: number }) => {
    set(state => {
      const { playerControlledOrganism } = state;
      if (!playerControlledOrganism) return state;
      
      const organisms = state.organisms.map(org => {
        if (org.id === playerControlledOrganism) {
          // Calculate new position
          const movementSpeed = org.traits.motility * 3; // Use motility for movement speed
          const newPosition = {
            x: org.position.x + direction.x * movementSpeed,
            y: org.position.y + direction.y * movementSpeed,
            z: org.position.z + direction.z * movementSpeed
          };
          
          // Keep within world bounds (assuming WORLD_SIZE from core.ts)
          const WORLD_SIZE = { x: 100, y: 100, z: 100 };
          newPosition.x = Math.max(-WORLD_SIZE.x/2, Math.min(WORLD_SIZE.x/2, newPosition.x));
          newPosition.y = Math.max(-WORLD_SIZE.y/2, Math.min(WORLD_SIZE.y/2, newPosition.y));
          newPosition.z = Math.max(-WORLD_SIZE.z/2, Math.min(WORLD_SIZE.z/2, newPosition.z));
          
          // Update organism with new position and energy cost
          return {
            ...org,
            previousPosition: org.position,
            position: newPosition,
            targetPosition: newPosition,
            energy: org.energy - (org.traits.motility * 0.3), // Small energy cost for movement
            actions: [...org.actions, 'player_moved']
          };
        }
        return org;
      });
      
      return {
        ...state,
        organisms
      };
    });
  }
})); 