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

    // Dynamic ingredients list (starts with predefined or localStorage, grows with API results)
    const [allIngredients, setAllIngredients] = useState(() => {
        try {
            const saved = localStorage.getItem('culinary_sim_ingredients_vault');
            if (saved) {
                const parsed = JSON.parse(saved);
                console.log(`[Vault] Loaded ${parsed.length} ingredients from storage`);
                return parsed;
            }
        } catch (error) {
            console.warn('[Vault] Failed to load from storage:', error);
        }
        return INGREDIENTS;
    });
    const [isSearching, setIsSearching] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 1000); // 1000ms debounce

    // Save to localStorage whenever allIngredients changes
    useEffect(() => {
        try {
            localStorage.setItem('culinary_sim_ingredients_vault', JSON.stringify(allIngredients));
            console.log(`[Vault] Saved ${allIngredients.length} ingredients to storage`);
        } catch (error) {
            console.warn('[Vault] Failed to save to storage:', error);
        }
    }, [allIngredients]);

    // Local Filtering (now uses dynamic list)
    const filteredIngredients = allIngredients.filter((ing) => {
        const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ing.scientific.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'ALL' || ing.category === activeTab;
        return matchesSearch && matchesTab;
    });



    // Auto-Search Effect - Always search API for comprehensive results
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        let isCancelled = false;

        // SEARCH API IF: Query is long enough (3+ chars)
        // Search API regardless of local matches to get all possible results
        if (debouncedSearchTerm.length > 2) {
            const performApiSearch = async () => {
                setIsSearching(true);

                const results = await searchIngredientsInRecipes(debouncedSearchTerm);

                if (!isCancelled && results && results.length > 0) {
                    // Merge API results into allIngredients (avoid duplicates)
                    setAllIngredients(prev => {
                        const existingIds = new Set(prev.map(i => i.id));
                        const newIngredients = results.filter(r => !existingIds.has(r.id));

                        if (newIngredients.length > 0) {
                            console.log(`[Vault] Added ${newIngredients.length} new ingredients to vault`);
                        }

                        return [...prev, ...newIngredients];
                    });
                }

                if (!isCancelled) {
                    setIsSearching(false);
                }
            };
            performApiSearch();
        } else {
            if (!isCancelled) {
                setIsSearching(false);
            }
        }

        return () => {
            isCancelled = true;
        };
    }, [debouncedSearchTerm]); // Removed filteredIngredients.length dependency

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', minHeight: 0, overflow: 'hidden' }}>
                {/* Header removed to save space (Parent Inventory.jsx already has "PANTRY" header) */}

                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} isSearching={isSearching} />
                <VaultTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                <div style={{
                    flex: 1,
                    minHeight: 0, /* Crucial for nested flex scrolling */
                    overflowY: 'auto',
                    padding: '4px',
                    scrollbarWidth: 'thin'
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
                            {isSearching && (
                                <div style={{
                                    color: 'var(--color-neon-cyan)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.9rem'
                                }}>
                                    <div className="loader-ring" style={{ width: '24px', height: '24px' }}></div>
                                    <span>Searching global database...</span>
                                </div>
                            )}

                            {!isSearching && (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    No ingredients found.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Minimalist Footer Stats */}
                <div style={{
                    marginTop: '8px',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    textAlign: 'right',
                    opacity: 0.7
                }}>
                    {filteredIngredients.length} items available
                </div>
            </div>
        </div>
    );
};

export default IngredientVault;
