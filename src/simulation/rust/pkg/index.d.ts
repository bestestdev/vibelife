/* TypeScript declarations for the vibelife_sim WebAssembly module */

export function init_panic_hook(): void;

export class Position {
  constructor(x: number, y: number, z: number);
  x: number;
  y: number;
  z: number;
  distance(other: Position): number;
}

export class OrganismTraits {
  constructor(
    motility: number,
    photosynthesis: number,
    predation: number,
    defense: number,
    sensory: number,
    reproduction: number,
    metabolism: number
  );
  motility: number;
  photosynthesis: number;
  predation: number;
  defense: number;
  sensory: number;
  reproduction: number;
  metabolism: number;
}

export class Organism {
  constructor(
    id: string,
    position: Position,
    size: number,
    traits: OrganismTraits,
    energy: number,
    generation: number,
    parent_id: string | null
  );
  id: string;
  position: Position;
  size: number;
  traits: OrganismTraits;
  energy: number;
  age: number;
  generation: number;
  parent_id: string | null;
  get_action_weights(): any;
  get_actions(): string;
}

export class Resources {
  constructor(organic: number, minerals: number, light: number);
  organic: number;
  minerals: number;
  light: number;
}

export class Environment {
  constructor(
    temperature: number,
    light_level: number,
    moisture: number,
    organic: number,
    minerals: number,
    light: number
  );
  temperature: number;
  light_level: number;
  moisture: number;
  resources: Resources;
}

export class Simulation {
  constructor(
    env_temperature: number,
    env_light: number,
    env_moisture: number
  );
  create_initial_organism(
    motility: number,
    photosynthesis: number,
    size: number
  ): Organism;
  simulate_generation(): Array<Organism>;
  fast_forward(generations: number): Array<Organism>;
  get_organism_count(): number;
} 