import { createInitialOrganism, simulateGeneration } from './core';

describe('Simulation Core', () => {
  test('createInitialOrganism creates organism with default traits', () => {
    const organism = createInitialOrganism({});
    
    expect(organism).toBeDefined();
    expect(organism.id).toBeDefined();
    expect(organism.traits).toBeDefined();
    expect(organism.energy).toBeGreaterThan(0);
    expect(organism.age).toBe(0);
    expect(organism.generation).toBe(0);
    expect(organism.actions).toEqual([]);
  });
  
  test('createInitialOrganism respects custom traits', () => {
    const customTraits = {
      motility: 0.8,
      photosynthesis: 0.2,
      size: 2.0
    };
    
    const organism = createInitialOrganism(customTraits);
    
    expect(organism.traits.motility).toBe(0.8);
    expect(organism.traits.photosynthesis).toBe(0.2);
    expect(organism.size).toBe(2.0);
  });
  
  test('simulateGeneration processes organisms correctly', () => {
    const initialOrganism = createInitialOrganism({
      motility: 0.5,
      photosynthesis: 0.5,
      size: 1.0
    });
    
    const state = {
      organisms: [initialOrganism],
      environment: {
        temperature: 0.5,
        lightLevel: 0.8,
        moisture: 0.6,
        resources: {
          organic: 100,
          minerals: 100,
          light: 100
        }
      }
    };
    
    const nextState = simulateGeneration(state);
    
    expect(nextState).toBeDefined();
    expect(nextState.organisms).toBeDefined();
    
    // Organisms should have performed actions
    if (nextState.organisms.length > 0) {
      expect(nextState.organisms[0].actions.length).toBeGreaterThan(0);
      expect(nextState.organisms[0].age).toBe(1);
    }
  });
  
  test('organisms can reproduce when they have enough energy', () => {
    const initialOrganism = createInitialOrganism({
      reproduction: 1.0, // Max reproduction trait
      size: 1.0
    });
    
    // Give the organism lots of energy to ensure reproduction
    initialOrganism.energy = 100;
    
    const state = {
      organisms: [initialOrganism],
      environment: {
        temperature: 0.5,
        lightLevel: 0.8,
        moisture: 0.6,
        resources: {
          organic: 100,
          minerals: 100,
          light: 100
        }
      }
    };
    
    // Run for a few generations to see reproduction
    let currentState = state;
    for (let i = 0; i < 5; i++) {
      currentState = simulateGeneration(currentState);
    }
    
    // Check if population grew
    expect(currentState.organisms.length).toBeGreaterThan(1);
    
    // Find organisms with generation > 0 (offspring)
    const offspring = currentState.organisms.filter(o => o.generation > 0);
    expect(offspring.length).toBeGreaterThan(0);
  });
}); 