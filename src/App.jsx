import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import SearchDish from './pages/SearchDish';
import Inventory from './pages/Inventory';
import LabResults from './pages/LabResults';
import { INGREDIENTS } from './data/ingredients';

const App = () => {
  const [currentPage, setCurrentPage] = useState('inventory');
  const [simulationHistory, setSimulationHistory] = useState(() => {
    // Load history from localStorage
    try {
      const saved = localStorage.getItem('culinary_sim_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('[App] Failed to load simulation history:', error);
    }
    return [];
  });

  // Get ingredient vault size
  const ingredientVaultSize = (() => {
    try {
      const saved = localStorage.getItem('culinary_sim_ingredients_vault');
      if (saved) {
        return JSON.parse(saved).length;
      }
    } catch (error) {
      return INGREDIENTS.length;
    }
    return INGREDIENTS.length;
  })();

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('culinary_sim_history', JSON.stringify(simulationHistory));
    } catch (error) {
      console.warn('[App] Failed to save simulation history:', error);
    }
  }, [simulationHistory]);

  const handleSimulationComplete = (simulationData) => {
    setSimulationHistory(prev => [...prev, simulationData]);
    console.log('[App] Simulation saved to history:', simulationData);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {currentPage === 'dashboard' && (
          <Dashboard
            simulationHistory={simulationHistory}
            ingredientVaultSize={ingredientVaultSize}
          />
        )}
        {currentPage === 'search-dish' && (
          <SearchDish />
        )}
        {currentPage === 'inventory' && (
          <Inventory onSimulationComplete={handleSimulationComplete} />
        )}
        {currentPage === 'lab-results' && (
          <LabResults simulationHistory={simulationHistory} />
        )}
      </div>
    </div>
  );
};

export default App;
