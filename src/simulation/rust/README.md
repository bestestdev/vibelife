# VibeLife Simulation Engine

This directory contains the high-performance simulation engine for VibeLife, written in Rust and compiled to WebAssembly.

## Features

- Trait-based evolution system
- Behavior-influenced mutations
- Environmental interaction
- Efficient parallel computation
- WebAssembly integration for browser performance

## Architecture

The simulation engine follows an Entity Component System (ECS) pattern, focusing on maximizing performance while maintaining flexibility:

- **Organisms**: The primary entities in the simulation
- **Traits**: Components that define organism capabilities
- **Systems**: Logic for movement, energy, reproduction, and evolution

## Building

To build the WebAssembly module:

```bash
wasm-pack build --target web --out-dir pkg
```

For production builds with optimizations:

```bash
wasm-pack build --target web --out-dir pkg --release
```

## JavaScript Integration

The compiled WebAssembly module is accessed through the TypeScript interface in `src/simulation/core.ts`, which provides a clean interface to the Rust functionality. The simulation engine is exclusively powered by Rust/WebAssembly with no JavaScript fallback.

## Performance Advantages

The Rust implementation provides significant performance improvements over a JavaScript-based approach:

- Multi-threaded processing for organism updates
- Efficient memory usage with Rust's ownership model
- Much faster numerical computation
- Reduced garbage collection overhead
- Ability to handle thousands of organisms with complex trait interactions

## Development Workflow

1. Make changes to the Rust code in this directory
2. Build the WebAssembly module using `npm run build:wasm`
3. The TypeScript interface in `core.ts` will automatically use the updated WebAssembly module

## Requirements

- Rust and Cargo must be installed for development
- wasm-pack is required to build the WebAssembly module
- The WebAssembly module must be built before the application will function 