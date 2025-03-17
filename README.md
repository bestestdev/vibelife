# VibeLife: Evolutionary Life Simulator

## Overview
VibeLife is an immersive life simulation game where players can observe and influence the evolution of organisms in a dynamic ecosystem. Rather than categorizing creatures into rigid classifications like "plants" or "animals," VibeLife focuses on the development and inheritance of specific traits through a unique evolutionary system that combines randomness with behavior-based adaptation.

## Core Concepts

### Trait-Based Evolution
Organisms in VibeLife are defined by their traits rather than species classifications. Examples of traits include:

- **Motility**: The ability to move around the environment
- **Photosynthesis**: The ability to generate energy from light
- **Predation**: The ability to consume other organisms
- **Defense**: Mechanisms to avoid being consumed (shells, spines, etc.)
- **Sensory**: Abilities to detect food, predators, or environmental conditions
- **Reproduction**: Different methods of creating offspring
- **Metabolism**: How efficiently organisms process energy
- **Size**: Physical dimensions affecting various other traits
- **Lifespan**: How long organisms naturally live

### Adaptive Evolution Mechanics
Evolution in VibeLife is driven by a hybrid system:

1. **Behavior-Influenced Mutations**: An organism's actions during its lifetime influence the probability of specific mutations in its offspring. For example:
   - An organism that frequently consumes others has a higher chance of developing enhanced predatory traits (teeth, speed, etc.)
   - An organism that remains stationary in sunlight has an increased chance of developing photosynthetic capabilities
   - An organism that survives multiple predator encounters might develop better defensive traits

2. **Environmental Pressures**: The ecosystem itself shapes evolution through:
   - Resource availability affecting population sizes and competition
   - Climate conditions favoring certain traits
   - Predator-prey relationships creating evolutionary arms races

3. **Random Mutations**: A baseline of random genetic variation ensures diversity and unpredictable evolutionary paths

### Simulation Initialization
VibeLife simulations begin with a single, simple organism and rapidly simulate thousands of generations to develop a diverse ecosystem:

- **First Organism Design**: Players customize the traits of the initial organism that will become the common ancestor of all life in the simulation
- **Rapid Evolution Phase**: The system quickly simulates thousands of generations, allowing natural selection and mutation to create diverse species
- **Time-Lapse Visualization**: Players can watch the accelerated evolution process with visual representations of emerging traits and branching species
- **Intervention Points**: During rapid simulation, players can pause at interesting evolutionary moments to observe or influence development
- **Emergent Ecosystem**: This approach creates truly unique ecosystems each time, with all species sharing evolutionary history and relationships

This single-ancestor approach creates more scientifically accurate and emergent ecosystems, giving players deeper insight into evolutionary processes and more meaningful influence over the simulation's development.

### Player Interaction
Players can:

- **Organism Control**: Take direct control of any organism in the simulation at will
- **Guided Evolution**: Influence an organism's evolution by directing its behavior and activities
- **Ecosystem Manipulation**: Alter environmental conditions to create new evolutionary pressures
- **Observation**: Study the complex interactions between organisms and track evolutionary lineages

## Environmental Conditions

The world of VibeLife features diverse environmental factors that influence evolution and survival:

### Climate Zones
- **Temperate**: Balanced conditions with moderate resources and seasonal changes
- **Tropical**: Abundant resources but high competition and predation
- **Arctic/Desert**: Harsh conditions requiring specialized adaptations
- **Aquatic**: Water-based environments with unique challenges and opportunities
- **Volcanic**: Extreme conditions with specialized resource opportunities

### Environmental Factors
- **Temperature**: Affects metabolism, activity levels, and energy requirements
- **Light Levels**: Influences photosynthesis efficiency and visibility
- **Moisture**: Determines water availability and affects mobility
- **Terrain**: Varied landscapes (mountains, valleys, plains) affecting movement and shelter
- **Resource Distribution**: Patchy vs. uniform distribution of food and materials

### Dynamic Events
- **Weather Patterns**: Rain, drought, storms affecting resource availability
- **Natural Disasters**: Volcanic eruptions, floods, or meteor impacts creating evolutionary bottlenecks
- **Seasonal Changes**: Cyclical variations in conditions requiring adaptation or migration
- **Day/Night Cycles**: Different opportunities and threats based on time

### Resource Types
- **Organic Matter**: Dead organisms that can be consumed
- **Minerals**: Essential elements for specific biological functions
- **Light Energy**: Primary resource for photosynthetic organisms
- **Heat Sources**: Thermal vents or volcanic activity providing alternative energy
- **Shelter**: Protected areas reducing predation risk or environmental exposure

### Biomes
- **Forests**: Dense vegetation with vertical stratification
- **Grasslands**: Open areas with high visibility and movement potential
- **Wetlands**: Resource-rich transition zones between aquatic and terrestrial
- **Deep Water**: Low light conditions with pressure adaptations
- **Subterranean**: Cave systems with unique sensory challenges

## Gameplay Features

### Simulation Modes
- **Natural Evolution**: Observe the ecosystem evolve with minimal intervention
- **Guided Evolution**: Take control of organisms to influence evolutionary paths
- **Scenario Challenges**: Specific evolutionary challenges with defined goals
- **Sandbox**: Customize all parameters of the simulation

### Visualization Tools
- **Trait Mapping**: Visual representation of trait distribution across populations
- **Evolutionary Trees**: Track the lineage and development of traits over generations
- **Ecosystem Analytics**: Data on population dynamics, resource distribution, and environmental conditions

### Advanced Features
- **Genetic Engineering**: Unlock tools to directly influence genetic traits (advanced gameplay)
- **Ecosystem Design**: Create custom environments with specific conditions
- **Time Controls**: Speed up, slow down, or pause the simulation to observe at different timescales

## Technical Architecture

### Frontend (Game Interface)
- **Three.js**: JavaScript-based rendering library for creating interactive 3D graphics in the browser
- **React**: Component-based UI framework for building the game interface and controls
- **TypeScript**: Strongly-typed JavaScript for more maintainable code and better developer experience
- **WebGL**: Hardware-accelerated graphics rendering in the browser
- **Zustand**: State management for maintaining simulation state
- **Responsive Design**: Adaptive interface that works across desktop and tablet devices

### Simulation Engine
- **TypeScript**: The entire simulation engine is written in TypeScript for easy integration with the frontend
- **Object-Oriented Design**: Clear separation of organisms, traits, and simulation logic
- **Functional Programming**: Immutable data structures for predictable state management
- **Event-Driven Architecture**: Organisms respond to environmental changes and interactions

### Data Architecture
- **Object-Based**: Efficient implementation of organisms and their traits
- **Spatial Awareness**: Organisms are aware of their surroundings and other nearby entities
- **Trait Inheritance**: Genetic algorithm inspired inheritance with mutations
- **Serialization**: JSON-based format for saving/loading simulation states

### Optimization Strategies
- **Batched Updates**: Processing organisms in generations to maximize efficiency
- **Simple Physics**: Lightweight collision detection and movement systems
- **Adaptive Simulation Rate**: Dynamic time scaling for smooth visualization

### Deployment Model
- **Progressive Web App**: Primary deployment as a browser-based application
- **Local Storage**: Save simulations to browser storage

This architecture prioritizes simplicity, maintainability, and performance, allowing VibeLife to handle complex simulations with hundreds of organisms in the browser.

## Development Roadmap
1. Core simulation engine with basic trait inheritance
2. Environmental systems and resource dynamics
3. Player control and interaction mechanisms
4. Advanced evolutionary systems with behavior-based adaptation
5. Ecosystem analytics and visualization tools
6. Scenario challenges and gameplay objectives

## Development Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/vibelife.git
cd vibelife

# Install JavaScript dependencies
npm install
# or
yarn install

# Configure environment (optional)
cp .env.example .env
# Edit .env file to change PORT or other settings
```

### Development
```bash
# Start the development server
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3031`.

### Building for Production
```bash
# Build the application
npm run build
# or
yarn build
```

The compiled files will be in the `dist` directory.

### Running Tests
```bash
# Run the test suite
npm test
# or
yarn test
```

### Project Structure
- `src/frontend`: React components and UI code
- `src/simulation`: Core simulation engine
  - `src/simulation/core.ts`: TypeScript implementation of simulation logic
- `src/frontend/stores`: State management with Zustand

---

Join us in exploring the fascinating world of evolution through gameplay in VibeLife, where every action can shape the future of life itself!