import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import SearchDish from './pages/SearchDish';
import Inventory from './pages/Inventory';
import LabResults from './pages/LabResults';
import RecipeDetailModal from './components/hud/RecipeDetailModal';
import { INGREDIENTS } from './data/ingredients';

const App = () => {
  const [currentPage, setCurrentPage] = useState('inventory');
  const [recipeModal, setRecipeModal] = useState(null);
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

  const updateSimulationName = (id, newName) => {
    setSimulationHistory(prev => prev.map(sim =>
      sim.id === id ? { ...sim, identifiedDish: newName } : sim
    ));
    console.log(`[App] Simulation ${id} renamed to:`, newName);
  };

  const deleteSimulation = (id) => {
    if (window.confirm('Are you sure you want to delete this culinary record? This action cannot be undone.')) {
      setSimulationHistory(prev => prev.filter(sim => sim.id !== id));
      console.log(`[App] Simulation ${id} deleted.`);
    }
  };

  const handleViewRecipe = (recipeId, overrides = {}) => {
    // Sanitize ID: sometimes it comes in as { id: ... } or other formats
    const sanitizedId = typeof recipeId === 'object' ? (recipeId.id || recipeId.Recipe_id) : recipeId;

    console.log(`[App] Triggering modal for ID: ${sanitizedId}`, overrides);
    if (!sanitizedId) {
      console.warn('[App] Cannot view recipe: ID is missing or invalid');
      return;
    }
    setRecipeModal({
      recipeId: sanitizedId,
      initialTitle: overrides.title,
      initialCategory: overrides.category,
      initialCalories: overrides.calories
    });
  };

  const handleImportToKitchen = (ingredients, title) => {
    try {
      localStorage.setItem('pending_culinary_import', JSON.stringify({
        ingredients,
        title,
        timestamp: Date.now()
      }));
      setRecipeModal(null);
      setCurrentPage('inventory');
    } catch (e) {
      console.error('Failed to prepare import:', e);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {currentPage === 'dashboard' && (
          <Dashboard
            simulationHistory={simulationHistory}
            ingredientVaultSize={ingredientVaultSize}
            setCurrentPage={setCurrentPage}
            onRenameSimulation={updateSimulationName}
            onDeleteSimulation={deleteSimulation}
            onViewRecipe={handleViewRecipe}
            onImport={handleImportToKitchen}
          />
        )}
        {currentPage === 'search-dish' && (
          <SearchDish
            onImport={handleImportToKitchen}
            onViewRecipe={handleViewRecipe}
          />
        )}
        {currentPage === 'inventory' && (
          <Inventory
            onSimulationComplete={handleSimulationComplete}
            onViewRecipe={handleViewRecipe}
          />
        )}
        {currentPage === 'lab-results' && (
          <LabResults
            simulationHistory={simulationHistory}
            onRenameSimulation={updateSimulationName}
            onDeleteSimulation={deleteSimulation}
            onViewRecipe={handleViewRecipe}
            onImport={handleImportToKitchen}
          />
        )}
      </div>

      {recipeModal && (
        <RecipeDetailModal
          recipeId={recipeModal.recipeId}
          initialTitle={recipeModal.initialTitle}
          initialCategory={recipeModal.initialCategory}
          initialCalories={recipeModal.initialCalories}
          onClose={() => setRecipeModal(null)}
          onImport={handleImportToKitchen}
        />
      )}
    </div>
  );
};

export default App;
