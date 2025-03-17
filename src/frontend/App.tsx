import React, { useEffect, useState } from 'react';
import { initSimulation } from '../simulation/core';
import SimulationRenderer from './components/SimulationRenderer';
import ControlPanel from './components/ControlPanel';
import './App.css';

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize the simulation when the component mounts
  useEffect(() => {
    const initAsync = async () => {
      try {
        await initSimulation();
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize simulation:', err);
        setError(err instanceof Error ? err.message : 'Unknown error initializing simulation');
      }
    };
    
    initAsync();
  }, []);
  
  if (error) {
    return (
      <div className="initialization-error">
        <h2>Simulation Initialization Error</h2>
        <p>{error}</p>
        <p>
          Make sure you have built the WebAssembly module by running:
          <pre>npm run build:wasm</pre>
          And that your browser supports WebAssembly.
        </p>
      </div>
    );
  }
  
  if (!isInitialized) {
    return (
      <div className="loading-container">
        <h2>Initializing Simulation Engine...</h2>
        <p>Loading WebAssembly module</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <SimulationRenderer />
      <ControlPanel />
    </div>
  );
};

export default App; 