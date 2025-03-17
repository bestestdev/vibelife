# Changelog

## [Unreleased]

### Changed
- **Core Architecture**: Removed JavaScript fallback implementation in favor of a pure Rust/WebAssembly approach
- **Performance**: Significant performance improvements by using Rust's type system and memory management
- **Simulation Engine**: Complete rewrite in Rust with WASM bindings for browser integration

### Added
- **WebAssembly Module**: Created comprehensive Rust implementation of the simulation engine
- **Type Definitions**: Added TypeScript definitions for WebAssembly module interface
- **Error Handling**: Improved initialization error handling with user-friendly messages
- **Loading States**: Added loading and error states during WebAssembly initialization
- **Documentation**: Updated README and added documentation for Rust components
- **Environment Config**: Added dotenv support for configurable server port and environment variables

### Technical
- **Webpack**: Updated configuration to handle WebAssembly modules
- **Build Process**: Added build scripts for compiling the Rust code to WebAssembly
- **Dev Command**: Added `yarn dev` command that builds WebAssembly module and starts the dev server in one step
- **TypeScript Interface**: Created a clean TypeScript interface for interacting with the Rust code
- **Simulation Core**: Implemented trait-based evolution in Rust for maximum performance
- **Environment Variables**: Added support for .env files to configure application settings

### Requirements
- Added Rust and wasm-pack as required dependencies for development and building
- Added dotenv for environment variable management

## [0.1.0] - Initial Implementation
- Basic simulation engine in TypeScript/JavaScript
- Three.js-based visualization
- React user interface components
- Initial implementation of trait-based evolution mechanics 