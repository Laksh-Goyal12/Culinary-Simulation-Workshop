import React, { useMemo } from 'react';
import FlavorRadar from './FlavorRadar';
import NutrientGauge from './NutrientGauge';
import InteractionAlert from './InteractionAlert';
import RecipeInspiration from './RecipeInspiration';

const SimulationHUD = ({ selectedIngredients: data, onImport }) => {
    // data can be an array (legacy) or object { ingredients, identifiedDish }
    const selectedIngredients = Array.isArray(data) ? data : (data?.ingredients || []);
    const identifiedDish = !Array.isArray(data) ? data?.identifiedDish : null;

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
            <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', overflowY: 'auto', minHeight: 0 }}>
                <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                    SIMULATION_DATA
                </h2>

                {identifiedDish && (
                    <div style={{
                        padding: '12px',
                        background: 'rgba(57, 255, 20, 0.1)',
                        border: '1px solid var(--color-neon-green)',
                        borderRadius: '4px',
                        marginBottom: '8px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-neon-green)', marginBottom: '4px' }}>
                            MOLECULAR MATCH IDENTIFIED
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', textShadow: '0 0 10px rgba(57,255,20,0.5)' }}>
                            {identifiedDish}
                        </div>
                    </div>
                )}

                {selectedIngredients.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontStyle: 'italic' }}>
                        No active simulation data.
                    </div>
                ) : (
                    <>
                        <FlavorRadar data={flavorData} />
                        <div style={{ borderTop: '1px solid #333', padding: '16px 0', margin: '8px 0' }} />
                        <NutrientGauge nutrition={nutrition} />
                        <div style={{ borderTop: '1px solid #333', padding: '16px 0', margin: '8px 0' }} />
                        <RecipeInspiration onImport={onImport} />
                        <div style={{ borderTop: '1px solid #333', padding: '16px 0', margin: '8px 0' }} />
                        <InteractionAlert activeAlerts={alerts} />
                    </>
                )}
            </div>
        </div>
    );
};

export default SimulationHUD;
