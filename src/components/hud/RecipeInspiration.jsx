import React, { useEffect, useState } from 'react';
import { getTopRecipeMatches } from '../../api/recipeDB';
import { Loader } from 'lucide-react';
import RecipeDetailModal from './RecipeDetailModal';

const RecipeInspiration = ({ style, onImport, currentIngredients = [] }) => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);

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
        <div style={{ paddingRight: '4px', ...style }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '1px' }}>
                {currentIngredients.length > 0 ? 'TOP_MATCHES' : 'MOLECULAR_INSPIRATION'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recipes.map((recipe) => (
                    <div
                        key={recipe._id}
                        onClick={() => setSelectedRecipeId(recipe.Recipe_id)}
                        style={{
                            background: 'rgba(0, 0, 0, 0.03)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            padding: '8px',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
                            e.currentTarget.style.borderColor = 'var(--color-neon-cyan)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.03)';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                    >
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {recipe.Recipe_title}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span>{recipe.Region}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-cyan)' }}>
                                {parseFloat(recipe['Energy (kcal)'] || recipe.Calories || 0).toFixed(0)} kcal
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {selectedRecipeId && (
                <RecipeDetailModal
                    recipeId={selectedRecipeId}
                    onClose={() => setSelectedRecipeId(null)}
                    onImport={onImport}
                />
            )}
        </div>
    );
};

export default RecipeInspiration;
