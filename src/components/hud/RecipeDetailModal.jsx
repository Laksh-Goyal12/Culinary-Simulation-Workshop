import React, { useEffect, useState } from 'react';
import { X, Check, Flame, List, Play, ChefHat, Clock, Utensils } from 'lucide-react';
import { fetchRecipeDetails } from '../../api/recipeDB';

const RecipeDetailModal = ({ recipeId, onClose, onImport, initialTitle, initialCategory, initialCalories }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!recipeId) {
            setError('Recipe ID is invalid or missing.');
            setLoading(false);
            return;
        }
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
            onImport(details.ingredients || [], details.title || details.Recipe_title || initialTitle);
        }
        onClose();
    };

    if (!recipeId) return null;

    // Helper to get safe values (prefer API details, fallback to initial props)
    const getSafeTitle = () => details?.title || details?.Recipe_title || initialTitle || 'Untitled Recipe';
    const getSafeCategory = () => details?.category || initialCategory || 'Culinary Archive';
    const getSafeCalories = () => {
        const detailCals = details?.nutrition?.calories;
        if (detailCals !== undefined && detailCals !== null) return detailCals;
        if (initialCalories !== undefined && initialCalories !== null && initialCalories !== 0) return initialCalories;
        return '---';
    };

    // Deterministic gradient for header if no image
    const getHeaderGradient = (title) => {
        const colors = [
            'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
            'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        ];
        const index = (title || 'Dish').length % colors.length;
        return colors[index];
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999, /* Ensure it's above everything */
            animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
            onClick={(e) => {
                // Close on backdrop click
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="card-3d"
                style={{
                    width: '90%',
                    maxWidth: '900px',
                    height: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0,
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.8)',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.5)',
                    background: '#fff',
                    borderRadius: '24px'
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        color: '#333',
                        cursor: 'pointer',
                        zIndex: 20,
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transition: 'transform 0.1s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <X size={20} fontWeight="bold" />
                </button>

                {loading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                        <div className="" style={{
                            padding: '12px',
                            background: 'rgba(41, 128, 185, 0.05)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div className="loader-ring"></div>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {initialTitle ? `Opening "${initialTitle}"...` : 'Opening Recipe...'}
                        </div>
                    </div>
                ) : error ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-alert-red)' }}>{error}</div>
                ) : (
                    <>
                        {/* Header Section - Adaptive */}
                        {details.image ? (
                            // IMAGE HEADER
                            <div style={{ height: '350px', position: 'relative', flexShrink: 0 }}>
                                <img
                                    src={details.image}
                                    alt={getSafeTitle()}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    padding: '32px'
                                }}>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                        <span style={{
                                            background: 'var(--color-neon-cyan)', color: '#fff',
                                            padding: '4px 12px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold',
                                            textTransform: 'uppercase', letterSpacing: '0.5px'
                                        }}>
                                            {getSafeCategory()}
                                        </span>
                                    </div>
                                    <h2 style={{
                                        fontSize: '3rem',
                                        margin: '0 0 8px 0',
                                        color: '#fff',
                                        textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                                        lineHeight: 1.1,
                                        fontFamily: 'var(--font-header)'
                                    }}>
                                        {getSafeTitle()}
                                    </h2>
                                </div>
                            </div>
                        ) : (
                            // NO IMAGE HEADER - Clean & Typographic
                            <div style={{
                                background: '#fff',
                                padding: '40px 32px 24px 32px',
                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                position: 'relative'
                            }}>
                                {/* Decorative Top Line */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: '8px',
                                    background: getHeaderGradient(getSafeTitle())
                                }} />

                                <span style={{
                                    color: 'var(--text-secondary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1.5px',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    marginBottom: '16px',
                                    display: 'block'
                                }}>
                                    {getSafeCategory()}
                                </span>

                                <h2 style={{
                                    fontSize: '3rem',
                                    margin: 0,
                                    color: 'var(--text-primary)',
                                    lineHeight: 1.1,
                                    fontFamily: 'var(--font-header)'
                                }}>
                                    {getSafeTitle()}
                                </h2>
                            </div>
                        )}

                        {/* Content Body */}
                        <div style={{ padding: '0', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {/* Metadata Bar */}
                            <div style={{
                                display: 'flex',
                                gap: '24px',
                                padding: '20px 32px',
                                background: '#f9f9f9',
                                borderBottom: '1px solid rgba(0,0,0,0.05)',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
                                    <Flame size={18} color="var(--color-neon-orange)" />
                                    {getSafeCalories()} kcal
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
                                    <Utensils size={18} color="var(--color-neon-blue)" />
                                    {details.ingredients ? details.ingredients.length : 0} Ingredients
                                </div>
                                {/* Add more functional icons here if data exists, e.g. time */}
                            </div>

                            <div style={{ display: 'flex', padding: '32px', gap: '48px', flexWrap: 'wrap' }}>
                                {/* Left Col: Ingredients */}
                                <div style={{ flex: '1 1 300px' }}>
                                    <h3 style={{
                                        fontSize: '1.2rem',
                                        color: 'var(--text-primary)',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <div style={{ width: '4px', height: '24px', background: 'var(--color-neon-cyan)', borderRadius: '2px' }} />
                                        Ingredients
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {details.ingredients && details.ingredients.map((ing, idx) => (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '12px 16px',
                                                background: '#fff',
                                                borderRadius: '12px',
                                                border: '1px solid #eee',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '8px', height: '8px', borderRadius: '50%',
                                                        background: 'var(--color-neon-cyan)', opacity: 0.5
                                                    }} />
                                                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{ing.name}</span>
                                                </div>
                                                <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', background: '#f5f5f5', padding: '2px 8px', borderRadius: '4px' }}>
                                                    {ing.quantity} {ing.unit}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Col: Instructions */}
                                <div style={{ flex: '1.5 1 400px' }}>
                                    <h3 style={{
                                        fontSize: '1.2rem',
                                        color: 'var(--text-primary)',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <div style={{ width: '4px', height: '24px', background: 'var(--color-neon-green)', borderRadius: '2px' }} />
                                        Preparation
                                    </h3>

                                    <div style={{
                                        lineHeight: '1.8',
                                        color: 'var(--text-secondary)',
                                        background: '#fcfcfc',
                                        padding: '24px',
                                        borderRadius: '16px',
                                        border: '1px solid #eee',
                                        fontSize: '1rem',
                                        whiteSpace: 'pre-line' // Respect newlines
                                    }}>
                                        {details.instructions || "No specific instructions provided for this recipe procedure."}
                                    </div>

                                    <div style={{ marginTop: '32px' }}>
                                        <button
                                            className="btn-gamified"
                                            onClick={handleImport}
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                fontSize: '1.1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '12px',
                                                background: 'var(--color-neon-cyan)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '16px',
                                                fontWeight: '800',
                                                boxShadow: '0 8px 32px rgba(41, 128, 185, 0.3)'
                                            }}
                                        >
                                            <Utensils size={24} />
                                            <span>MOVE TO MIXING TABLE</span>
                                        </button>
                                        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                                            Imports selected ingredients to the active kitchen station
                                        </div>
                                    </div>
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
