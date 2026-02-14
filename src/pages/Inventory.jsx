import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import IngredientVault from '../components/vault/IngredientVault';
import MixingVessel from '../components/mixing/MixingVessel';
import SimulationHUD from '../components/hud/SimulationHUD';
import { Loader } from 'lucide-react';
import { identifyRecipe, fetchRecipeDetails } from '../api/recipeDB';

const Inventory = ({ onSimulationComplete, onViewRecipe }) => {
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [simulationStatus, setSimulationStatus] = useState('idle'); // idle, processing, complete
    const [simulationData, setSimulationData] = useState(null);
    const [logs, setLogs] = useState([]);

    // Check for pending imports from history or search
    React.useEffect(() => {
        const checkPending = () => {
            try {
                const pendingStr = localStorage.getItem('pending_culinary_import');
                if (pendingStr) {
                    const pending = JSON.parse(pendingStr);
                    // Only import if it's fresh (last 30 seconds)
                    if (Date.now() - pending.timestamp < 30000) {
                        setSelectedIngredients(pending.ingredients || []);
                        setSimulationStatus('idle');
                        addLog(`IMPORTED: ${pending.title || 'Recipe Ingredients'}`);
                        addLog('VESSEL_READY: PROCEED_TO_COOKING');
                    }
                    localStorage.removeItem('pending_culinary_import');
                }
            } catch (e) {
                console.error('Failed to load pending import:', e);
            }
        };
        checkPending();
    }, []);

    const addLog = (message, type = 'info') => {
        const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prev => [...prev, { time, message, type }]);
    };

    const getSmartDefaultQuantity = (ingredient) => {
        const name = ingredient.name.toLowerCase();
        const unit = (ingredient.unit || 'g').toLowerCase();

        if (name.includes('egg')) return { quantity: 2, unit: 'piece' };
        if (name.includes('flour')) return { quantity: 200, unit: 'g' };
        if (name.includes('sugar')) return { quantity: 100, unit: 'g' };
        if (name.includes('butter')) return { quantity: 50, unit: 'g' };
        if (name.includes('milk')) return { quantity: 250, unit: 'ml' };
        if (name.includes('salt')) return { quantity: 5, unit: 'g' };
        if (name.includes('water')) return { quantity: 200, unit: 'ml' };
        if (name.includes('oil')) return { quantity: 50, unit: 'ml' };
        if (name.includes('vanilla')) return { quantity: 5, unit: 'ml' };
        if (name.includes('baking powder') || name.includes('baking soda')) return { quantity: 10, unit: 'g' };

        if (['cup', 'oz', 'tbsp', 'tsp', 'piece', 'slice'].some(u => unit.includes(u))) {
            return { quantity: 1, unit };
        }

        return { quantity: 100, unit: unit || 'g' };
    };

    const handleAddIngredient = (ingredient) => {
        if (simulationStatus === 'processing') return;

        if (simulationStatus === 'complete') {
            setSimulationStatus('idle');
            addLog('VESSEL_MODIFIED: RE-SIMULATION REQUIRED', 'warning');
        }

        if (selectedIngredients.length >= 8) {
            addLog('VESSEL_CAPACITY_REACHED', 'error');
            return;
        }

        const smartDefaults = getSmartDefaultQuantity(ingredient);
        setSelectedIngredients(prev => [...prev, {
            ...ingredient,
            quantity: smartDefaults.quantity,
            unit: smartDefaults.unit
        }]);
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

        let identifiedDish = null;
        let recipeDetails = null;
        try {
            const recipeInfo = await identifyRecipe(selectedIngredients);
            if (recipeInfo) {
                identifiedDish = recipeInfo.title;
                addLog(`MOLECULAR MATCH FOUND: ${recipeInfo.title}`, 'success');

                addLog('FETCHING RECIPE DETAILS...');
                recipeDetails = await fetchRecipeDetails(recipeInfo.id);
            }
        } catch (e) {
            console.warn('Identification failed', e);
        }

        setTimeout(() => {
            setSimulationStatus('complete');

            const simData = {
                id: `sim_${Date.now()}`,
                timestamp: Date.now(),
                ingredients: selectedIngredients,
                identifiedDish: identifiedDish,
                recipeDetails: recipeDetails,
                confidenceScore: recipeDetails ? calculateConfidence(selectedIngredients, recipeDetails) : 0
            };

            setSimulationData(simData);

            // Save to history
            if (onSimulationComplete) {
                onSimulationComplete(simData);
            }

            addLog('SIMULATION_COMPLETE: DATA_GENERATED');
            addLog(`YIELD: ${selectedIngredients.length} active compounds analyzed.`);
        }, 4000);
    };

    const calculateConfidence = (userIngredients, recipeDetails) => {
        if (!recipeDetails || !recipeDetails.normalizedIngredients) return 0;

        const recipeIngs = recipeDetails.normalizedIngredients;
        const matchedCount = recipeIngs.filter(recipeIng =>
            userIngredients.some(userIng => userIng.name.toLowerCase() === recipeIng.name.toLowerCase())
        ).length;

        return Math.round((matchedCount / recipeIngs.length) * 100);
    };

    const handleImportRecipe = (ingredients, title) => {
        if (simulationStatus === 'processing') return;

        setSimulationStatus('idle');
        setSimulationData(null);

        const imported = ingredients.map(ing => {
            let qty = ing.quantity;
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
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div className="card-3d" style={{ padding: '16px', borderRadius: '16px', marginBottom: '16px', textAlign: 'center', background: '#fff' }}>
                        <h2 className="hero-text" style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>PANTRY</h2>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <IngredientVault onAddIngredient={handleAddIngredient} />
                    </div>
                </div>
            }
            centerColumn={
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div className="card-3d" style={{ padding: '16px', textAlign: 'center', borderRadius: '16px', marginBottom: '16px', background: '#fff' }}>
                        <h2 className="hero-text" style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>COOKING STATION</h2>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <MixingVessel
                            selectedIngredients={selectedIngredients}
                            onRemove={handleRemoveIngredient}
                            onUpdate={handleUpdateIngredient}
                            onProcess={handleProcess}
                            onReset={handleReset}
                            status={simulationStatus}
                            logs={logs}
                        />
                    </div>
                </div>
            }
            rightColumn={
                simulationData ? (
                    <SimulationHUD
                        selectedIngredients={simulationData}
                        onImport={handleImportRecipe}
                        onViewRecipe={onViewRecipe}
                    />
                ) : (
                    <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        {simulationStatus === 'processing' ? (
                            <>
                                <div className="loader-ring"></div>
                                <div style={{ marginTop: '16px', letterSpacing: '2px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>COOKING...</div>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '3rem', opacity: 0.5 }}>🔥</div>
                                <div style={{ marginTop: '16px', letterSpacing: '1px', color: 'var(--text-primary)' }}>STATION READY</div>
                                <div style={{ fontSize: '0.8rem', marginTop: '8px', opacity: 0.7 }}>Add ingredients to start cooking</div>
                            </>
                        )}
                    </div>
                )
            }
        />
    );
};

export default Inventory;
