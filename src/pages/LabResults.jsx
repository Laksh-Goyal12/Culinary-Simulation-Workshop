import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

const LabResults = ({ simulationHistory }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const filteredHistory = simulationHistory
        .filter(sim => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
                sim.identifiedDish?.toLowerCase().includes(search) ||
                sim.ingredients.some(ing => ing.name.toLowerCase().includes(search))
            );
        })
        .reverse(); // Most recent first

    return (
        <div style={{
            padding: 'var(--spacing-lg)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>


            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: 'var(--spacing-lg)' }}>
                <Search
                    size={18}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                    type="text"
                    placeholder="SEARCH EXPERIMENTS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        backgroundColor: '#f0f0f0',
                        border: 'none',
                        borderRadius: '50px',
                        padding: '12px 12px 12px 42px',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontFamily: 'var(--font-mono)',
                        outline: 'none',
                        boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.8)'
                    }}
                />
            </div>

            {/* Results List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', paddingBottom: '20px' }}>
                {filteredHistory.length === 0 ? (
                    <div className="card-3d" style={{
                        padding: 'var(--spacing-xl)',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        background: 'transparent',
                        boxShadow: 'none',
                        border: '2px dashed var(--border-color)'
                    }}>
                        {searchTerm ? 'No experiments match your search.' : 'No experiments recorded yet.'}
                    </div>
                ) : (
                    filteredHistory.map((sim, idx) => {
                        const isExpanded = expandedId === sim.id;
                        const expNumber = simulationHistory.length - idx;

                        return (
                            <div
                                key={sim.id}
                                className="card-3d"
                                style={{
                                    padding: 'var(--spacing-md)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    background: '#fff'
                                }}
                                onClick={() => setExpandedId(isExpanded ? null : sim.id)}
                            >
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                            <span style={{ color: 'var(--color-neon-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                                                EXPERIMENT_{String(expNumber).padStart(3, '0')}
                                            </span>
                                            {' - '}
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                                {new Date(sim.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            Ingredients: {sim.ingredients.map(i => i.name).join(', ')}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {sim.identifiedDish && (
                                            <div style={{
                                                fontSize: '0.85rem',
                                                color: 'var(--color-neon-green)',
                                                fontWeight: 'bold'
                                            }}>
                                                {sim.identifiedDish} ({sim.confidenceScore}%)
                                            </div>
                                        )}
                                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div style={{
                                        marginTop: 'var(--spacing-md)',
                                        paddingTop: 'var(--spacing-md)',
                                        borderTop: '1px solid var(--border-color)'
                                    }}>
                                        <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                            INGREDIENT_DETAILS:
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: 'var(--spacing-md)' }}>
                                            {sim.ingredients.map((ing, i) => (
                                                <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                                                    • {ing.name}: {ing.quantity} {ing.unit}
                                                </div>
                                            ))}
                                        </div>

                                        {sim.recipeDetails && (
                                            <>
                                                <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                                    RECIPE_COMPARISON:
                                                </h3>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    Confidence Score: <span style={{ color: 'var(--color-neon-green)' }}>{sim.confidenceScore}%</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default LabResults;
