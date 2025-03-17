import React, { useEffect, useState } from 'react';
import { initSimulation } from '../simulation/core';
import SimulationRenderer from './components/SimulationRenderer';
import ControlPanel from './components/ControlPanel';
import './App.css';

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize the simulation when the component mounts
  useEffect(() => {
    const initAsync = async () => {
      await initSimulation();
      setIsInitialized(true);
    };
    
    initAsync();
  }, []);
  
  if (!isInitialized) {
    return (
      <div className="loading-container">
        <h2>Initializing Simulation Engine...</h2>
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