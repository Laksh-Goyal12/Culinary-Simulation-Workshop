import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import VaultTabs from './VaultTabs';
import IngredientCard from './IngredientCard';
import { INGREDIENTS } from '../../data/ingredients';
import { searchIngredientsInRecipes } from '../../api/recipeDB';
import { Loader, Plus } from 'lucide-react';

// Debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

const IngredientVault = ({ onAddIngredient }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');

    // Live Search State
    const [apiResults, setApiResults] = useState([]); // Changed to Array
    const [isSearching, setIsSearching] = useState(false);
    const [apiError, setApiError] = useState(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 1000); // 1000ms debounce

    // Local Filtering
    const filteredIngredients = INGREDIENTS.filter((ing) => {
        const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ing.scientific.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'ALL' || ing.category === activeTab;
        return matchesSearch && matchesTab;
    });

    // Clear API results immediately on typing to prevent "lag" / stale data
    useEffect(() => {
        if (searchTerm !== debouncedSearchTerm) {
            setApiResults([]);
            setApiError(null);
        }
    }, [searchTerm, debouncedSearchTerm]);

    // Auto-Search Effect
    useEffect(() => {
        let isCancelled = false; // Race condition guard

        // SEARCH API IF: Query is long enough (3+ chars)
        // We do this in parallel with local results now
        if (debouncedSearchTerm.length > 2) {
            // Trigger API Search
            const performApiSearch = async () => {
                setIsSearching(true);
                setApiError(null);
                setApiResults([]);

                const results = await searchIngredientsInRecipes(debouncedSearchTerm);

                if (!isCancelled) {
                    if (results && results.length > 0) {
                        setApiResults(results);
                    } else {
                        // Only show error if NO local results either? 
                        // Or just show "No global results" silently?
                        // For now, let's just leave apiResults empty if none found
                        // setApiError(true); 
                    }
                    setIsSearching(false);
                }
            };
            performApiSearch();
        } else {
            // Reset if search term is short or we have local results
            if (!isCancelled) {
                setApiResults([]);
                setApiError(null);
                setIsSearching(false);
            }
        }

        return () => {
            isCancelled = true;
        };
    }, [debouncedSearchTerm, filteredIngredients.length]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', minHeight: 0 }}>
                <h2 style={{
                    fontSize: '1rem',
                    marginBottom: 'var(--spacing-md)',
                    letterSpacing: '1px',
                    color: 'var(--text-secondary)'
                }}>
                    INGREDIENT_VAULT
                </h2>

                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <VaultTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                <div style={{
                    flex: 1,
                    minHeight: 0, /* Crucial for nested flex scrolling */
                    overflowY: 'auto',
                    paddingRight: '4px',
                }}>
                    {filteredIngredients.length > 0 ? (
                        filteredIngredients.map((ing) => (
                            <IngredientCard
                                key={ing.id}
                                ingredient={ing}
                                onAdd={onAddIngredient}
                            />
                        ))
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            marginTop: 'var(--spacing-lg)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            {/* LIVE API SEARCH RESULTS */}
                            {(isSearching || (searchTerm.length > 2 && apiResults.length === 0 && !apiError)) && (
                                <div style={{ color: 'var(--color-neon-cyan)' }}>
                                    <Loader className="spin" size={20} /> Searching...
                                </div>
                            )}

                            {!isSearching && apiResults.length > 0 && (
                                <div style={{ width: '100%' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-neon-green)', marginBottom: '4px', textAlign: 'left' }}>
                                        GLOBAL_NETWORK_RESULTS ({apiResults.length}):
                                    </div>
                                    {apiResults.map((res) => (
                                        <IngredientCard
                                            key={res.id}
                                            ingredient={res}
                                            onAdd={onAddIngredient}
                                        />
                                    ))}
                                </div>
                            )}

                            {!isSearching && apiError && debouncedSearchTerm.length > 2 && (
                                <div style={{ color: 'var(--color-alert-red)', fontSize: '0.8rem' }}>
                                    Compound not found in global network.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{
                    marginTop: 'var(--spacing-md)',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)'
                }}>
                    DB_STATUS: CONNECTED ({filteredIngredients.length} / {INGREDIENTS.length})
                </div>
            </div>
        </div>
    );
};

export default IngredientVault;
