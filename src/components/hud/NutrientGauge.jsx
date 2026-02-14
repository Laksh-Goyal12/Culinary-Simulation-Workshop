import React from 'react';

const NutrientGauge = ({ nutrition }) => {
    const total = nutrition.protein + nutrition.fat + nutrition.carbs;
    const pPct = total ? (nutrition.protein / total) * 100 : 0;
    const fPct = total ? (nutrition.fat / total) * 100 : 0;
    const cPct = total ? (nutrition.carbs / total) * 100 : 0;

    return (
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MACRO_BALANCE</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-neon-green)', fontFamily: 'var(--font-mono)' }}>
                    {nutrition.calories} kCal
                </span>
            </div>

            <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', background: '#333' }}>
                <div style={{ width: `${pPct}%`, background: '#fbbf24' }} title="Protein" /> {/* Amber */}
                <div style={{ width: `${fPct}%`, background: '#f87171' }} title="Fat" />     {/* Red */}
                <div style={{ width: `${cPct}%`, background: '#60a5fa' }} title="Carbs" />   {/* Blue */}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.7rem', color: '#888' }}>
                <span style={{ color: '#fbbf24' }}>● PROT</span>
                <span style={{ color: '#f87171' }}>● FAT</span>
                <span style={{ color: '#60a5fa' }}>● CARB</span>
            </div>
        </div>
    );
};

export default NutrientGauge;
