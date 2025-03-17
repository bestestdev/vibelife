use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use rand::{Rng, SeedableRng};
use rand::rngs::SmallRng;
use js_sys::Math;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// Initialize panic hook for better error messages
#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

// Position in 3D space
#[wasm_bindgen]
#[derive(Clone, Copy, Serialize, Deserialize)]
pub struct Position {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[wasm_bindgen]
impl Position {
    #[wasm_bindgen(constructor)]
    pub fn new(x: f32, y: f32, z: f32) -> Position {
        Position { x, y, z }
    }
    
    pub fn distance(&self, other: &Position) -> f32 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        let dz = self.z - other.z;
        (dx*dx + dy*dy + dz*dz).sqrt()
    }
}

// Organism traits that determine capabilities
#[wasm_bindgen]
#[derive(Clone, Serialize, Deserialize)]
pub struct OrganismTraits {
    pub motility: f32,
    pub photosynthesis: f32,
    pub predation: f32,
    pub defense: f32,
    pub sensory: f32,
    pub reproduction: f32,
    pub metabolism: f32,
}

#[wasm_bindgen]
impl OrganismTraits {
    #[wasm_bindgen(constructor)]
    pub fn new(
        motility: f32, 
        photosynthesis: f32, 
        predation: f32, 
        defense: f32, 
        sensory: f32, 
        reproduction: f32, 
        metabolism: f32
    ) -> OrganismTraits {
        OrganismTraits {
            motility: clamp(motility, 0.0, 1.0),
            photosynthesis: clamp(photosynthesis, 0.0, 1.0),
            predation: clamp(predation, 0.0, 1.0),
            defense: clamp(defense, 0.0, 1.0),
            sensory: clamp(sensory, 0.0, 1.0),
            reproduction: clamp(reproduction, 0.0, 1.0),
            metabolism: clamp(metabolism, 0.0, 1.0),
        }
    }
    
    // Create a copy with random mutations
    pub fn mutate(&self, rng: &mut SmallRng, action_weights: &HashMap<String, f32>) -> OrganismTraits {
        let mut traits = self.clone();
        
        // Base random mutations
        traits.motility = mutate_trait(traits.motility, rng, action_weights.get("motility").unwrap_or(&0.0));
        traits.photosynthesis = mutate_trait(traits.photosynthesis, rng, action_weights.get("photosynthesis").unwrap_or(&0.0));
        traits.predation = mutate_trait(traits.predation, rng, action_weights.get("predation").unwrap_or(&0.0));
        traits.defense = mutate_trait(traits.defense, rng, action_weights.get("defense").unwrap_or(&0.0));
        traits.sensory = mutate_trait(traits.sensory, rng, action_weights.get("sensory").unwrap_or(&0.0));
        traits.reproduction = mutate_trait(traits.reproduction, rng, action_weights.get("reproduction").unwrap_or(&0.0));
        traits.metabolism = mutate_trait(traits.metabolism, rng, action_weights.get("metabolism").unwrap_or(&0.0));
        
        traits
    }
}

// Helper function to mutate a trait based on random chance and action weights
fn mutate_trait(value: f32, rng: &mut SmallRng, action_weight: &f32) -> f32 {
    // Base mutation amount is small and random
    let mutation_amount = (rng.gen::<f32>() - 0.5) * 0.1;
    
    // Apply additional bias based on action weight
    let biased_amount = mutation_amount + (action_weight * 0.05 * rng.gen::<f32>());
    
    // Ensure the result stays within valid range
    clamp(value + biased_amount, 0.0, 1.0)
}

// Helper to clamp values between min and max
fn clamp(value: f32, min: f32, max: f32) -> f32 {
    if value < min { min } 
    else if value > max { max } 
    else { value }
}

// Organism entity
#[wasm_bindgen]
#[derive(Clone, Serialize, Deserialize)]
pub struct Organism {
    pub id: String,
    pub position: Position,
    pub size: f32,
    pub traits: OrganismTraits,
    pub energy: f32,
    pub age: u32,
    pub generation: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_id: Option<String>,
    #[serde(skip)]
    action_records: Vec<String>,
    #[serde(skip)]
    action_weights: HashMap<String, f32>,
}

#[wasm_bindgen]
impl Organism {
    #[wasm_bindgen(constructor)]
    pub fn new(
        id: String, 
        position: Position, 
        size: f32, 
        traits: OrganismTraits, 
        energy: f32, 
        generation: u32, 
        parent_id: Option<String>
    ) -> Organism {
        Organism {
            id,
            position,
            size: size.max(0.1),
            traits,
            energy,
            age: 0,
            generation,
            parent_id,
            action_records: Vec::new(),
            action_weights: HashMap::new(),
        }
    }
    
    pub fn record_action(&mut self, action: String) {
        self.action_records.push(action.clone());
        
        // Update action weights
        let count = self.action_weights.entry(action).or_insert(0.0);
        *count += 1.0;
        
        // Keep only the last 20 actions
        if self.action_records.len() > 20 {
            let removed = self.action_records.remove(0);
            if let Some(count) = self.action_weights.get_mut(&removed) {
                *count -= 1.0;
                if *count <= 0.0 {
                    self.action_weights.remove(&removed);
                }
            }
        }
    }
    
    // Calculate movement based on motility
    pub fn move_organism(&mut self, rng: &mut SmallRng) {
        if self.traits.motility < 0.05 {
            return; // Too little motility to move
        }
        
        // Calculate movement distance
        let move_distance = self.traits.motility * (1.0 / self.size) * 0.5;
        
        // Random direction
        let angle = rng.gen::<f32>() * std::f32::consts::PI * 2.0;
        self.position.x += angle.cos() * move_distance;
        self.position.z += angle.sin() * move_distance;
        
        // Energy cost for movement
        let energy_cost = move_distance * self.size * 2.0;
        self.energy -= energy_cost;
        
        self.record_action("moved".to_string());
    }
    
    // Process photosynthesis based on environment
    pub fn process_photosynthesis(&mut self, light_level: f32) {
        if self.traits.photosynthesis < 0.05 {
            return; // Not photosynthetic enough
        }
        
        let energy_gain = self.traits.photosynthesis * light_level * self.size * 5.0;
        self.energy += energy_gain;
        
        self.record_action("photosynthesis".to_string());
    }
    
    // Check if organism can reproduce
    pub fn can_reproduce(&self) -> bool {
        self.energy >= 50.0 && self.traits.reproduction >= 0.2
    }
    
    // Calculate reproduction chance
    pub fn reproduction_chance(&self) -> f32 {
        self.traits.reproduction * (self.energy / 200.0)
    }
    
    // Get action weights as serializable object
    pub fn get_action_weights(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.action_weights).unwrap()
    }
    
    // Get a vector of recorded actions
    pub fn get_actions(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.action_records).unwrap()
    }
}

// Environment state
#[wasm_bindgen]
#[derive(Clone, Serialize, Deserialize)]
pub struct Environment {
    pub temperature: f32,
    pub light_level: f32,
    pub moisture: f32,
    pub resources: Resources,
}

#[wasm_bindgen]
#[derive(Clone, Serialize, Deserialize)]
pub struct Resources {
    pub organic: f32,
    pub minerals: f32,
    pub light: f32,
}

#[wasm_bindgen]
impl Environment {
    #[wasm_bindgen(constructor)]
    pub fn new(temperature: f32, light_level: f32, moisture: f32, 
               organic: f32, minerals: f32, light: f32) -> Environment {
        Environment {
            temperature: clamp(temperature, 0.0, 1.0),
            light_level: clamp(light_level, 0.0, 1.0),
            moisture: clamp(moisture, 0.0, 1.0),
            resources: Resources {
                organic,
                minerals,
                light,
            }
        }
    }
}

// Simulation state
#[wasm_bindgen]
pub struct Simulation {
    organisms: Vec<Organism>,
    environment: Environment,
    rng: SmallRng,
    next_id: u32,
}

#[wasm_bindgen]
impl Simulation {
    #[wasm_bindgen(constructor)]
    pub fn new(env_temperature: f32, env_light: f32, env_moisture: f32) -> Simulation {
        let env = Environment::new(
            env_temperature, 
            env_light, 
            env_moisture,
            100.0, // organic
            100.0, // minerals
            100.0, // light
        );
        
        Simulation {
            organisms: Vec::new(),
            environment: env,
            rng: SmallRng::seed_from_u64(Math::random() as u64 * 9999999.0 as u64),
            next_id: 0,
        }
    }
    
    // Create initial organism
    pub fn create_initial_organism(&mut self, 
                                 motility: f32, 
                                 photosynthesis: f32,
                                 size: f32) -> JsValue {
        let traits = OrganismTraits::new(
            motility,
            photosynthesis,
            0.1, // predation
            0.1, // defense
            0.1, // sensory
            0.5, // reproduction
            0.5, // metabolism
        );
        
        let id = format!("organism-{}", self.next_id);
        self.next_id += 1;
        
        let organism = Organism::new(
            id,
            Position::new(0.0, 0.0, 0.0),
            size,
            traits,
            100.0, // initial energy
            0,     // generation
            None,  // no parent
        );
        
        self.organisms.push(organism.clone());
        
        serde_wasm_bindgen::to_value(&organism).unwrap()
    }
    
    // Process one generation of evolution
    pub fn simulate_generation(&mut self) -> JsValue {
        let mut next_organisms: Vec<Organism> = Vec::new();
        
        for organism in &mut self.organisms {
            // Skip dead organisms
            if organism.energy <= 0.0 {
                continue;
            }
            
            // Increase age
            organism.age += 1;
            
            // Apply base metabolism cost
            organism.energy -= organism.traits.metabolism * organism.size;
            if organism.energy <= 0.0 {
                continue; // Organism died from metabolism
            }
            
            // Movement
            organism.move_organism(&mut self.rng);
            if organism.energy <= 0.0 {
                continue; // Organism died from movement
            }
            
            // Photosynthesis
            organism.process_photosynthesis(self.environment.light_level);
            
            // TODO: Predation and consumption
            
            // Check for reproduction
            if organism.can_reproduce() && self.rng.gen::<f32>() < organism.reproduction_chance() {
                // Create offspring with mutations
                let offspring_id = format!("organism-{}", self.next_id);
                self.next_id += 1;
                
                // Create map of action weights
                let mut action_weights = HashMap::new();
                for action in &organism.action_records {
                    *action_weights.entry(action.clone()).or_insert(0.0) += 1.0;
                }
                
                // Normalize weights
                let record_count = organism.action_records.len() as f32;
                if record_count > 0.0 {
                    for weight in action_weights.values_mut() {
                        *weight /= record_count;
                    }
                }
                
                // Mutate traits based on actions
                let mutated_traits = organism.traits.mutate(&mut self.rng, &action_weights);
                
                // Create offspring
                let offspring = Organism::new(
                    offspring_id,
                    Position::new(
                        organism.position.x + (self.rng.gen::<f32>() - 0.5) * 0.5, 
                        organism.position.y,
                        organism.position.z + (self.rng.gen::<f32>() - 0.5) * 0.5
                    ),
                    organism.size * (0.8 + self.rng.gen::<f32>() * 0.4), // Size variation
                    mutated_traits,
                    organism.energy * 0.3, // Transfer energy to offspring
                    organism.generation + 1,
                    Some(organism.id.clone()),
                );
                
                // Update parent energy and record reproduction
                organism.energy *= 0.7;
                organism.record_action("reproduced".to_string());
                
                // Add both to next generation
                next_organisms.push(offspring);
            }
            
            // Add updated organism to next generation
            next_organisms.push(organism.clone());
        }
        
        // Replace current organisms with next generation
        self.organisms = next_organisms;
        
        // Return serialized organisms
        serde_wasm_bindgen::to_value(&self.organisms).unwrap()
    }
    
    // Simulate multiple generations quickly
    pub fn fast_forward(&mut self, generations: u32) -> JsValue {
        for _ in 0..generations {
            self.simulate_generation();
        }
        
        serde_wasm_bindgen::to_value(&self.organisms).unwrap()
    }
    
    // Get the current number of organisms
    pub fn get_organism_count(&self) -> usize {
        self.organisms.len()
    }
} 