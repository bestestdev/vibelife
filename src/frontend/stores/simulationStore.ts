import { create } from 'zustand';
import { simulateGeneration, fastForward, createInitialOrganism } from '../../simulation/core';

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
  size: number;
  traits: OrganismTraits;
  energy: number;
  age: number;
  generation: number;
  parentId?: string;
  actions: string[];
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
  
  // Actions
  startSimulation: () => void;
  pauseSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  fastForward: (generations: number) => void;
  startNewSimulation: (initialTraits: InitialOrganismSettings) => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  organisms: [],
  isRunning: false,
  simulationSpeed: 1,
  currentGeneration: 0,
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
  
  startNewSimulation: (initialTraits) => {
    // Stop any running simulation
    get().pauseSimulation();
    
    // Create initial organism using the new function
    const initialOrganism = createInitialOrganism(initialTraits);
    
    set({
      organisms: [initialOrganism],
      currentGeneration: 0
    });
  }
})); 