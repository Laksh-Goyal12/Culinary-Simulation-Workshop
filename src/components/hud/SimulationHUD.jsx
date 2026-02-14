import React, { useMemo } from 'react';
import FlavorRadar from './FlavorRadar';
import NutrientGauge from './NutrientGauge';
import InteractionAlert from './InteractionAlert';
import RecipeInspiration from './RecipeInspiration';

const SimulationHUD = ({ selectedIngredients: data, onImport }) => {
    // data can be an array (legacy) or object { ingredients, identifiedDish, recipeDetails }
    const selectedIngredients = Array.isArray(data) ? data : (data?.ingredients || []);
    const identifiedDish = !Array.isArray(data) ? data?.identifiedDish : null;
    const recipeDetails = !Array.isArray(data) ? data?.recipeDetails : null;

    // Calculate confidence score if we have recipe details
    const confidenceScore = useMemo(() => {
        if (!recipeDetails || !recipeDetails.normalizedIngredients) return null;

        const recipeIngredients = recipeDetails.normalizedIngredients;
        const userIngredients = selectedIngredients;

        // Count matching ingredients
        const matches = userIngredients.filter(userIng =>
            recipeIngredients.some(recipeIng =>
                recipeIng.name.toLowerCase() === userIng.name.toLowerCase()
            )
        ).length;

        // Base score on ingredient match percentage
        const ingredientScore = (matches / recipeIngredients.length) * 100;

        return Math.round(ingredientScore);
    }, [recipeDetails, selectedIngredients]);

    // -- Compute Aggregates --
    // 1. Flavor Data for Radar
    const flavorData = useMemo(() => {
        if (selectedIngredients.length === 0) return [];

        // Sum up profiles
        const totals = { bitter: 0, sweet: 0, sour: 0, salty: 0, spicy: 0, savory: 0 };
        let count = 0;

        selectedIngredients.forEach((ing) => {
            Object.keys(ing.flavorProfile).forEach((key) => {
                if (totals[key] !== undefined) {
                    totals[key] += ing.flavorProfile[key];
                } else {
                    // Normalizing keys if needed, for MVP we map custom keys to 'savory' or ignore
                    totals.savory = (totals.savory || 0) + ing.flavorProfile[key];
                }
            });
            count++;
        });

        // Average
        return [
            { subject: 'Sweet', A: Math.min(100, totals.sweet / count), fullMark: 100 },
            { subject: 'Sour', A: Math.min(100, totals.sour / count) || 0, fullMark: 100 },
            { subject: 'Spicy', A: Math.min(100, totals.spicy / count), fullMark: 100 },
            { subject: 'Bitter', A: Math.min(100, totals.bitter / count), fullMark: 100 },
            { subject: 'Savory', A: Math.min(100, totals.savory / count), fullMark: 100 },
        ];
    }, [selectedIngredients]);

    // 2. Nutrition
    const nutrition = useMemo(() => {
        return selectedIngredients.reduce((acc, ing) => {
            const qty = ing.quantity || 10; // Default 10g if missing
            const ratio = qty / 100; // Assume base data is per 100g

            return {
                calories: acc.calories + ((ing.nutrition.calories || 0) * ratio),
                protein: acc.protein + ((ing.nutrition.protein || 0) * ratio),
                fat: acc.fat + ((ing.nutrition.fat || 0) * ratio),
                carbs: acc.carbs + ((ing.nutrition.carbs || 0) * ratio),
            };
        }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
    }, [selectedIngredients]);

    // 3. Alerts
    const alerts = useMemo(() => {
        const allAlerts = [];
        selectedIngredients.forEach(ing => {
            if (ing.interactionAlerts) {
                allAlerts.push(...ing.interactionAlerts);
            }
        });
        // Remove duplicates
        return [...new Set(allAlerts)];
    }, [selectedIngredients]);


    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-3d" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', overflowY: 'auto', minHeight: 0, background: '#fff', padding: '16px' }}>
                <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', letterSpacing: '1px', fontWeight: '800' }}>
                    SIMULATION DATA
                </h2>

                {identifiedDish && (
                    <div style={{
                        padding: '16px',
                        background: 'radial-gradient(circle, rgba(57, 255, 20, 0.1) 0%, rgba(255,255,255,0) 100%)',
                        border: '2px solid var(--color-neon-green)',
                        borderRadius: '16px',
                        marginBottom: '8px',
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(57, 255, 20, 0.2)'
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-neon-green)', marginBottom: '4px', fontWeight: 'bold' }}>
                            MOLECULAR MATCH IDENTIFIED
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-primary)', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            {identifiedDish}
                        </div>
                        {confidenceScore !== null && (
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-neon-green)', marginTop: '4px', fontWeight: 'bold' }}>
                                Match Confidence: {confidenceScore}%
                            </div>
                        )}
                    </div>
                )}

                {recipeDetails && recipeDetails.normalizedIngredients && (
                    <div style={{
                        padding: '16px',
                        background: '#f8f9fa',
                        borderRadius: '16px',
                        marginBottom: '8px',
                        boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.05), inset -2px -2px 6px rgba(255,255,255,0.5)' /* Inset Readout - Softened */
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-neon-blue)', marginBottom: '12px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '1px' }}>
                            RECIPE COMPARISON
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {recipeDetails.normalizedIngredients.map((recipeIng, idx) => {
                                const userIng = selectedIngredients.find(u =>
                                    u.name.toLowerCase() === recipeIng.name.toLowerCase()
                                );

                                const isMatch = !!userIng;
                                const qtyMatch = userIng && Math.abs(userIng.quantity - recipeIng.quantity) < (recipeIng.quantity * 0.2);

                                return (
                                    <div key={idx} style={{
                                        marginBottom: '8px',
                                        paddingBottom: '8px',
                                        borderBottom: idx < recipeDetails.normalizedIngredients.length - 1 ? '1px dashed #e0e0e0' : 'none',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ color: isMatch ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: isMatch ? '600' : '400' }}>
                                            {recipeIng.name}
                                        </span>
                                        <span style={{
                                            color: isMatch ? (qtyMatch ? 'var(--color-neon-green)' : '#e67e22') : '#e74c3c',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {userIng ? `${userIng.quantity}${userIng.unit}` : '—'} → {recipeIng.quantity}{recipeIng.unit} {isMatch ? (qtyMatch ? '✓' : '⚠') : '✗'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {selectedIngredients.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No active simulation data.
                    </div>
                ) : (
                    <>
                        <FlavorRadar data={flavorData} />
                        <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 0', margin: '8px 0' }} />
                        <NutrientGauge nutrition={nutrition} />
                        <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 0', margin: '8px 0' }} />
                        <RecipeInspiration onImport={onImport} currentIngredients={selectedIngredients} />
                        <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 0', margin: '8px 0' }} />
                        <InteractionAlert activeAlerts={alerts} />
                    </>
                )}
            </div>
        </div>
    );
};

export default SimulationHUD;
