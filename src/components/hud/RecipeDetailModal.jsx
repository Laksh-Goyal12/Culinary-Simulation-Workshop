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
        // Use details.ingredients as returned by recipeDB
        if (onImport) {
            onImport(details.ingredients || [], details.title || details.Recipe_title);
        }
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
            alignItems: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div
                className="card-3d"
                style={{
                    width: '90%',
                    maxWidth: '800px',
                    height: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0, // Reset padding for hero image
                    position: 'relative',
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)', /* Deep Floating Shadow */
                    background: 'var(--bg-panel)',
                    borderRadius: '32px'
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: '#fff',
                        border: 'none',
                        color: '#000',
                        cursor: 'pointer',
                        zIndex: 10,
                        padding: '10px',
                        borderRadius: '50%',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        transition: 'transform 0.1s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <X size={24} />
                </button>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading Recipe Data...</div>
                ) : error ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-alert-red)' }}>{error}</div>
                ) : (
                    <>
                        {/* Hero Header */}
                        <div style={{ height: '300px', position: 'relative', flexShrink: 0 }}>
                            <img
                                src={details.image || 'https://placehold.co/800x400/161b22/333?text=No+Image'}
                                alt={details.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(0deg, var(--bg-panel) 0%, rgba(255,255,255,0.8) 50%, rgba(0,0,0,0) 100%)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                padding: '24px'
                            }}>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                                    <span style={{
                                        background: 'var(--color-neon-cyan)', color: '#fff',
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                                    }}>
                                        {details.category}
                                    </span>
                                    <span style={{
                                        background: 'rgba(0,0,0,0.6)', color: '#fff',
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px'
                                    }}>
                                        <Flame size={14} /> {details.nutrition?.calories || 0} kcal
                                    </span>
                                </div>
                                <h2 style={{
                                    fontSize: '2.5rem',
                                    margin: 0,
                                    color: '#fff',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    lineHeight: 1.2
                                }}>
                                    {details.title || details.Recipe_title || 'Untitled Recipe'}
                                </h2>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', gap: '32px', flexDirection: 'row' }}>

                            {/* Left Col: Ingredients */}
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h3 className="neon-text-cyan" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
                                    <List size={18} style={{ display: 'inline', marginRight: '8px' }} />
                                    Ingredients ({details.ingredients ? details.ingredients.length : 0})
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {details.ingredients && details.ingredients.map((ing, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '12px',
                                            background: 'rgba(0,0,0,0.03)',
                                            borderRadius: '8px',
                                            border: '1px solid transparent',
                                            transition: 'border-color 0.2s'
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text-muted)'}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                                        >
                                            <span style={{ color: 'var(--text-primary)' }}>{ing.name}</span>
                                            <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                                                {ing.quantity} {ing.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Col: Instructions & Actions */}
                            <div style={{ flex: 1.5 }}>
                                <h3 className="neon-text-green" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
                                    Instruction Protocol
                                </h3>
                                <div style={{
                                    lineHeight: '1.6',
                                    color: 'var(--text-secondary)',
                                    whiteSpace: 'pre-wrap',
                                    fontSize: '0.95rem'
                                }}>
                                    {details.instructions || "No instructions provided for this recipe procedure."}
                                </div>

                                <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
                                    <button
                                        className="btn-gamified"
                                        onClick={handleImport}
                                        style={{ flex: 1 }}
                                    >
                                        <Play size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                                        COOK THIS DISH
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RecipeDetailModal;
