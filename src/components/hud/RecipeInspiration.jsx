import React, { useEffect, useState } from 'react';
import { getTopRecipeMatches, fetchRecipeDetails } from '../../api/recipeDB';
import { Loader, Utensils } from 'lucide-react';

// RecipeInspiration updated to use global modal system
const RecipeInspiration = ({ style, onImport, currentIngredients = [] }) => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [importingId, setImportingId] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);

            // Fetch top matches based on current ingredients
            const data = await getTopRecipeMatches(currentIngredients);

            if (data && data.payload && data.payload.data) {
                setRecipes(data.payload.data);
            } else {
                setError('Failed to load recipe data.');
            }
            setLoading(false);
        };

        loadData();
    }, [currentIngredients]); // Re-fetch when ingredients change

    const handleMoveToStation = async (recipe) => {
        if (importingId) return;

        setImportingId(recipe.Recipe_id);
        try {
            const details = await fetchRecipeDetails(recipe.Recipe_id);
            if (details && details.ingredients) {
                onImport(details.ingredients, details.title);
            }
        } catch (error) {
            console.error('[RecipeInspiration] Import failed:', error);
        } finally {
            setImportingId(null);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Loader className="spin" size={24} style={{ marginBottom: '8px' }} />
                <div>Analyzing Matches...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-alert-red)' }}>
                {error}
            </div>
        );
    }

    return (
        <div style={{ ...style }}>
            <h3 style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                letterSpacing: '1.5px',
                fontWeight: '700',
                marginBottom: '16px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                {currentIngredients.length > 0 ? 'TOP REGIONAL MATCHES' : 'CULINARY INSPIRATION'}
                <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.05)' }}></div>
            </h3>

            {currentIngredients.length === 0 ? (
                < div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px 0' }}>
                    Add ingredients to discover matching recipes...
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                    {recipes.map((recipe, index) => (
                        <div
                            key={recipe._id}
                            onClick={() => handleMoveToStation(recipe)}
                            className="card-hover"
                            style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #fffaf0 100%)',
                                border: '1px solid rgba(0,0,0,0.05)',
                                borderRadius: '12px',
                                padding: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                            }}
                        >
                            {/* Decorative accent bar */}
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '4px',
                                background: index === 0 ? 'var(--color-neon-cyan)' :
                                    index === 1 ? 'var(--color-neon-green)' :
                                        'var(--color-gold)'
                            }} />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px' }}>
                                <div style={{
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    color: 'var(--text-primary)',
                                    lineHeight: '1.2'
                                }}>
                                    {recipe.Recipe_title}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-secondary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    fontWeight: '600',
                                    opacity: 0.7
                                }}>
                                    {recipe.Region || 'International'}
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                gap: '4px'
                            }}>
                                <span style={{
                                    background: 'rgba(0,0,0,0.03)',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-mono)'
                                }}>
                                    {parseFloat(recipe['Energy (kcal)'] || recipe.Calories || 0).toFixed(0)} kcal
                                </span>
                                <span style={{
                                    fontSize: '0.7rem',
                                    color: '#fff',
                                    background: importingId === recipe.Recipe_id ? 'var(--color-neon-blue)' : 'var(--color-neon-cyan)',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    {importingId === recipe.Recipe_id ? (
                                        <><Loader size={10} className="spin" /> MOVING...</>
                                    ) : (
                                        <><Utensils size={10} /> MOVE TO STATION</>
                                    )}
                                </span>
                                {index === 0 && !importingId && (
                                    <span style={{
                                        fontSize: '0.65rem',
                                        color: 'var(--color-neon-cyan)',
                                        fontWeight: 'bold',
                                        marginTop: '4px'
                                    }}>
                                        MATCH SCORE: 98%
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Local modal removed to use global one from App.jsx */}
        </div>
    );
};

export default RecipeInspiration;
