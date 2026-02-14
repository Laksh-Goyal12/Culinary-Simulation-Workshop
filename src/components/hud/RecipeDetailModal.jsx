import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { fetchRecipeDetails } from '../../api/recipeDB';

const RecipeDetailModal = ({ recipeId, onClose, onImport }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Fetch full details (including normalized ingredients)
                const data = await fetchRecipeDetails(recipeId);
                if (data) {
                    setDetails(data);
                } else {
                    setError('Failed to load recipe details');
                }
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };
        load();
    }, [recipeId]);

    const handleImport = () => {
        if (!details) return;
        onImport(details.normalizedIngredients, details.Recipe_title);
        onClose();
    };

    if (!recipeId) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div className="panel" style={{
                width: '600px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: '1px solid var(--color-neon-cyan)',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading Recipe Data...</div>
                ) : error ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-alert-red)' }}>{error}</div>
                ) : (
                    <>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--color-neon-cyan)' }}>
                            {details.Recipe_title}
                        </h2>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            {details.Region} | {parseFloat(details.Calories || 0).toFixed(0)} kcal
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px' }}>
                            {/* Ingredients List */}
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                                MOLECULAR COMPONENTS ({details.normalizedIngredients.length})
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {details.normalizedIngredients.map((ing, i) => (
                                    <div key={i} style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span>{ing.name}</span>
                                        <span style={{ opacity: 0.7 }}>
                                            {ing.quantity} {ing.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Instructions (if any) */}
                            {details.Process && (
                                <>
                                    <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '24px', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                                        SYNTHESIS PROTOCOL
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                        {details.Process}
                                    </p>
                                </>
                            )}
                        </div>

                        <button
                            onClick={handleImport}
                            style={{
                                background: 'var(--color-neon-cyan)',
                                color: '#000',
                                border: 'none',
                                padding: '12px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                        >
                            <Check size={18} />
                            Import to Mixing Vessel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default RecipeDetailModal;
