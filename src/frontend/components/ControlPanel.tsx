import React, { useState } from 'react';
import { useSimulationStore } from '../stores/simulationStore';

const ControlPanel: React.FC = () => {
  const { 
    isRunning, 
    simulationSpeed, 
    startSimulation, 
    pauseSimulation, 
    setSimulationSpeed,
    fastForward,
    currentGeneration,
    organismCount,
    startNewSimulation
  } = useSimulationStore(state => ({
    isRunning: state.isRunning,
    simulationSpeed: state.simulationSpeed,
    startSimulation: state.startSimulation,
    pauseSimulation: state.pauseSimulation,
    setSimulationSpeed: state.setSimulationSpeed,
    fastForward: state.fastForward,
    currentGeneration: state.currentGeneration,
    organismCount: state.organisms.length,
    startNewSimulation: state.startNewSimulation
  }));
  
  const [initialOrganismSettings, setInitialOrganismSettings] = useState({
    motility: 0.1,
    photosynthesis: 0.5,
    size: 1.0
  });
  
  const [fastForwardGenerations, setFastForwardGenerations] = useState(100);
  
  const handleSettingChange = (setting: string, value: number) => {
    setInitialOrganismSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  const handleNewSimulation = () => {
    startNewSimulation(initialOrganismSettings);
  };
  
  return (
    <div className="control-panel">
      <h2>VibeLife Controls</h2>
      
      <div className="stats-section">
        <div>Generation: {currentGeneration}</div>
        <div>Organisms: {organismCount}</div>
      </div>
      
      <div className="control-section">
        <h3>Simulation Control</h3>
        <div className="button-group">
          {isRunning ? (
            <button onClick={pauseSimulation}>Pause</button>
          ) : (
            <button onClick={startSimulation}>Start</button>
          )}
          <button onClick={() => fastForward(fastForwardGenerations)}>
            Fast Forward
          </button>
        </div>
        
        <div className="slider-control">
          <label>
            Fast Forward Generations:
            <input 
              type="range" 
              min="10" 
              max="1000" 
              step="10"
              value={fastForwardGenerations}
              onChange={e => setFastForwardGenerations(Number(e.target.value))}
            />
            <span>{fastForwardGenerations}</span>
          </label>
        </div>
        
        <div className="slider-control">
          <label>
            Simulation Speed:
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={simulationSpeed}
              onChange={e => setSimulationSpeed(Number(e.target.value))}
            />
            <span>{simulationSpeed}x</span>
          </label>
        </div>
      </div>
      
      <div className="control-section">
        <h3>New Simulation</h3>
        <div className="slider-control">
          <label>
            Initial Motility:
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={initialOrganismSettings.motility}
              onChange={e => handleSettingChange('motility', Number(e.target.value))}
            />
            <span>{initialOrganismSettings.motility}</span>
          </label>
        </div>
        
        <div className="slider-control">
          <label>
            Initial Photosynthesis:
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={initialOrganismSettings.photosynthesis}
              onChange={e => handleSettingChange('photosynthesis', Number(e.target.value))}
            />
            <span>{initialOrganismSettings.photosynthesis}</span>
          </label>
        </div>
        
        <div className="slider-control">
          <label>
            Initial Size:
            <input 
              type="range" 
              min="0.5" 
              max="3" 
              step="0.1"
              value={initialOrganismSettings.size}
              onChange={e => handleSettingChange('size', Number(e.target.value))}
            />
            <span>{initialOrganismSettings.size}</span>
          </label>
        </div>
        
        <button 
          onClick={handleNewSimulation}
          className="primary-button"
        >
          Start New Simulation
        </button>
      </div>
    </div>
  );
};

export default ControlPanel; 