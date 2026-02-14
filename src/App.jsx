import React, { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import IngredientVault from './components/vault/IngredientVault';
import MixingVessel from './components/mixing/MixingVessel';
import SimulationHUD from './components/hud/SimulationHUD';
import { Loader } from 'lucide-react';
import { identifyRecipe } from './api/recipeDB';

const App = () => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [simulationStatus, setSimulationStatus] = useState('idle'); // idle, processing, complete
  const [simulationData, setSimulationData] = useState(null); // Stores the "result" specific data
  const [logs, setLogs] = useState([]);

  // --- Handlers ---

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { time, message, type }]);
  };

  const handleAddIngredient = (ingredient) => {
    if (simulationStatus === 'processing') return;

    // If we already have results, adding a new ingredient resets the "Simulation" state (but keeps ingredients and OLD results until new process)
    if (simulationStatus === 'complete') {
      setSimulationStatus('idle');
      // setSimulationData(null); // REMOVED: Keep data visible until next process
      addLog('VESSEL_MODIFIED: RE-SIMULATION REQUIRED', 'warning');
    }

    if (selectedIngredients.length >= 8) {
      addLog('VESSEL_CAPACITY_REACHED', 'error');
      return;
    }

    // Smart default quantity based on unit
    let defaultQty = 10;
    const u = (ingredient.unit || 'g').toLowerCase();
    if (['cup', 'oz', 'tbsp', 'tsp', 'piece', 'slice'].some(unit => u.includes(unit))) {
      defaultQty = 1;
    }

    setSelectedIngredients(prev => [...prev, { ...ingredient, quantity: defaultQty }]);
    addLog(`ADDED: ${ingredient.name} (${ingredient.tags[0]})`);
  };

  const handleUpdateIngredient = (index, key, value) => {
    if (simulationStatus === 'processing') return;

    setSelectedIngredients(prev => prev.map((ing, i) => {
      if (i === index) {
        return { ...ing, [key]: value };
      }
      return ing;
    }));
  };

  const handleRemoveIngredient = (index) => {
    if (simulationStatus === 'processing') return;

    if (simulationStatus === 'complete') {
      setSimulationStatus('idle');
      // setSimulationData(null); // REMOVED: Keep data visible until next process
      addLog('VESSEL_MODIFIED: RE-SIMULATION REQUIRED', 'warning');
    }

    const removed = selectedIngredients[index];
    setSelectedIngredients(prev => prev.filter((_, i) => i !== index));
    addLog(`REMOVED: ${removed.name}`);
  };

  const handleReset = () => {
    setSelectedIngredients([]);
    setSimulationStatus('idle');
    setSimulationData(null);
    setLogs([]);
    addLog('SYSTEM_RESET: VESSEL_CLEARED');
  };

  const handleProcess = async () => {
    if (selectedIngredients.length === 0) {
      addLog('ERROR: VESSEL_EMPTY', 'error');
      return;
    }

    if (simulationStatus === 'processing') return;

    setSimulationStatus('processing');
    setSimulationData(null);
    addLog('INITIATING_MOLECULAR_SIMULATION...');

    // Attempt identification (in parallel with "processing" time)
    let identifiedDish = null;
    try {
      identifiedDish = await identifyRecipe(selectedIngredients);
      if (identifiedDish) {
        addLog(`MOLECULAR MATCH FOUND: ${identifiedDish}`, 'success');
      }
    } catch (e) {
      console.warn('Identification failed', e);
    }

    // Simulate processing time
    setTimeout(() => {
      setSimulationStatus('complete');

      setSimulationData({
        ingredients: selectedIngredients,
        identifiedDish: identifiedDish
      });

      addLog('SIMULATION_COMPLETE: DATA_GENERATED');
      addLog(`YIELD: ${selectedIngredients.length} active compounds analyzed.`);
    }, 4000);
  };

  const handleImportRecipe = (ingredients, title) => {
    if (simulationStatus === 'processing') return;

    setSimulationStatus('idle');
    setSimulationData(null);

    // Map ingredients to ensure valid defaults
    const imported = ingredients.map(ing => {
      let qty = ing.quantity;
      // Apply smart default if quantity is missing or 0
      if (!qty) {
        const u = (ing.unit || 'piece').toLowerCase();
        qty = ['cup', 'oz', 'tbsp', 'tsp', 'piece', 'slice'].some(unit => u.includes(unit)) ? 1 : 10;
      }

      return {
        ...ing,
        quantity: qty
      };
    });

    setSelectedIngredients(imported);
    addLog(`RECIPE_IMPORTED: ${title}`);
    addLog(`VESSEL_LOADED: ${imported.length} components ready.`);
  };

  return (
    <MainLayout
      leftColumn={
        <IngredientVault onAddIngredient={handleAddIngredient} />
      }
      centerColumn={
        <MixingVessel
          selectedIngredients={selectedIngredients}
          onRemove={handleRemoveIngredient}
          onUpdate={handleUpdateIngredient}
          onProcess={handleProcess}
          onReset={handleReset}
          status={simulationStatus}
          logs={logs}
        />
      }
      rightColumn={
        simulationData ? (
          <SimulationHUD selectedIngredients={simulationData} onImport={handleImportRecipe} />
        ) : (
          <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            {simulationStatus === 'processing' ? (
              <>
                <Loader className="spin" size={48} color="var(--color-neon-cyan)" />
                <div style={{ marginTop: '16px', letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}>PROCESSING...</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', opacity: 0.1 }}>🧬</div>
                <div style={{ marginTop: '16px', letterSpacing: '1px' }}>AWAITING SIMULATION DATA</div>
                <div style={{ fontSize: '0.7rem', marginTop: '8px', opacity: 0.5 }}>ADD INGREDIENTS -&gt; INITIATE SIMULATION</div>
              </>
            )}
          </div>
        )
      }
    />
  );
};

export default App;
