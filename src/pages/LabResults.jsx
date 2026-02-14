import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Edit2, Check, BookOpen, Trash2, Utensils } from 'lucide-react';

const LabResults = ({ simulationHistory, onRenameSimulation, onDeleteSimulation, onViewRecipe, onImport }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [tempName, setTempName] = useState('');

    const handleStartEdit = (e, sim) => {
        e.stopPropagation();
        setEditingId(sim.id);
        setTempName(sim.identifiedDish || `Experiment_${String(simulationHistory.indexOf(sim) + 1).padStart(3, '0')}`);
    };

    const handleSaveEdit = (e, id) => {
        e.stopPropagation();
        if (tempName.trim()) {
            onRenameSimulation(id, tempName.trim());
        }
        setEditingId(null);
    };

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


            {/* Header Area */}
            <div style={{ marginBottom: '32px' }}>
                <h1 className="hero-text" style={{ fontSize: '2.5rem', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                    CULINARY JOURNAL
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                    Archive of your experimental mixtures and mastered discoveries.
                </p>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: '32px' }}>
                <Search
                    size={20}
                    color="var(--color-neon-cyan)"
                    style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.8 }}
                />
                <input
                    type="text"
                    placeholder="SEARCH YOUR CULINARY HISTORY..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        backgroundColor: '#fff',
                        border: '2px solid rgba(0,0,0,0.05)',
                        borderRadius: '20px',
                        padding: '16px 16px 16px 54px',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        fontWeight: '600',
                        outline: 'none',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                        transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--color-neon-cyan)';
                        e.target.style.boxShadow = '0 10px 30px rgba(41, 128, 185, 0.1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0,0,0,0.05)';
                        e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)';
                    }}
                />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px', scrollbarWidth: 'thin' }}>
                {filteredHistory.length === 0 ? (
                    <div style={{
                        padding: '60px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        background: '#fff',
                        borderRadius: '24px',
                        border: '2px dashed #e0e0e0'
                    }}>
                        <div style={{ opacity: 0.5, marginBottom: '16px' }}>
                            <Search size={48} />
                        </div>
                        {searchTerm ? 'No experiments match your search criteria.' : 'Your journal is empty. Time to start cooking!'}
                    </div>
                ) : (
                    filteredHistory.map((sim, idx) => {
                        const isExpanded = expandedId === sim.id;
                        const expNumber = simulationHistory.length - idx;
                        const hasDish = !!sim.identifiedDish;

                        return (
                            <div
                                key={sim.id}
                                className="card-hover"
                                style={{
                                    background: '#fff',
                                    borderRadius: '20px',
                                    padding: '24px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: isExpanded ? '0 15px 40px rgba(0,0,0,0.08)' : '0 4px 12px rgba(0,0,0,0.03)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    borderLeft: hasDish ? '6px solid var(--color-neon-green)' : '6px solid var(--color-neon-cyan)',
                                    position: 'relative'
                                }}
                                onClick={() => setExpandedId(isExpanded ? null : sim.id)}
                            >
                                {/* Header Section */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        {editingId === sim.id ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }} onClick={e => e.stopPropagation()}>
                                                <input
                                                    autoFocus
                                                    value={tempName}
                                                    onChange={e => setTempName(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleSaveEdit(e, sim.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        border: '2px solid var(--color-neon-cyan)',
                                                        outline: 'none',
                                                        fontSize: '1.2rem',
                                                        fontWeight: '800',
                                                        color: 'var(--text-primary)',
                                                        width: '250px'
                                                    }}
                                                />
                                                <button
                                                    onClick={(e) => handleSaveEdit(e, sim.id)}
                                                    style={{ background: 'var(--color-neon-green)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#fff', display: 'flex' }}
                                                >
                                                    <Check size={20} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                                                    {sim.identifiedDish || `Exp #${String(expNumber).padStart(3, '0')}`}
                                                </h3>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStartEdit(e, sim);
                                                    }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', opacity: 0.4 }}
                                                    className="hover-opacity-1"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteSimulation(sim.id);
                                                    }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-alert-red)', display: 'flex', alignItems: 'center', opacity: 0.4 }}
                                                    className="hover-opacity-1"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                            <span style={{
                                                background: 'rgba(0,0,0,0.05)',
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                fontFamily: 'var(--font-mono)',
                                                color: 'var(--text-muted)'
                                            }}>
                                                LOG_{sim.id.substring(0, 6)}
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(sim.timestamp).toLocaleDateString()}</span>
                                            <span>{new Date(sim.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        {hasDish && (
                                            <div style={{
                                                textAlign: 'right',
                                                background: 'rgba(39, 174, 96, 0.05)',
                                                padding: '6px 12px',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(39, 174, 96, 0.1)'
                                            }}>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--color-neon-green)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>MATCH SCORE</div>
                                                <div style={{ fontSize: '1.2rem', color: 'var(--color-neon-green)', fontWeight: '900' }}>{sim.confidenceScore}%</div>
                                            </div>
                                        )}
                                        <div style={{ color: 'var(--text-muted)', background: 'rgba(0,0,0,0.03)', padding: '8px', borderRadius: '50%' }}>
                                            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Ingredient Tags */}
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    marginTop: '20px',
                                    borderTop: '1px solid rgba(0,0,0,0.05)',
                                    paddingTop: '16px'
                                }}>
                                    {sim.ingredients.map((ing, i) => (
                                        <div key={i} style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            color: 'var(--text-secondary)',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <span style={{ color: 'var(--color-neon-cyan)' }}>•</span>
                                            {ing.name}
                                        </div>
                                    ))}
                                </div>

                                {/* Expanded Details Section */}
                                {isExpanded && (
                                    <div style={{
                                        marginTop: '24px',
                                        padding: '24px',
                                        background: 'linear-gradient(to bottom, #f9fafb, #fff)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(0,0,0,0.03)',
                                        animation: 'fadeIn 0.3s ease'
                                    }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                            {/* Quantity Details */}
                                            <div>
                                                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: '800' }}>
                                                    Detailed Measurements
                                                </h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {sim.ingredients.map((ing, i) => (
                                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                                            <span style={{ fontWeight: '600' }}>{ing.name}</span>
                                                            <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{ing.quantity} {ing.unit}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Nutrient Snapshot */}
                                            <div>
                                                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: '800' }}>
                                                    Nutritional Profile
                                                </h4>
                                                <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                                        <span style={{ fontWeight: '600' }}>Total Energy</span>
                                                        <span style={{ color: 'var(--color-neon-green)', fontWeight: '800' }}>{sim.nutrients?.calories || '---'} KCAL</span>
                                                    </div>
                                                    <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                                        <div style={{ width: '65%', height: '100%', background: 'var(--color-neon-green)' }}></div>
                                                    </div>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px', fontStyle: 'italic' }}>
                                                        Based on standard molecular weights for listed ingredients.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {sim.recipeDetails && (
                                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed #e0e0e0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, fontWeight: '800' }}>
                                                        Discovery Notes
                                                    </h4>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (sim.recipeDetails && sim.recipeDetails.ingredients) {
                                                                onImport(sim.recipeDetails.ingredients, sim.identifiedDish);
                                                            } else {
                                                                const rId = sim.recipeDetails?.id || sim.recipeDetails?.Recipe_id;
                                                                if (rId) onViewRecipe(rId, { title: sim.identifiedDish });
                                                            }
                                                        }}
                                                        style={{
                                                            background: 'var(--color-neon-cyan)',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '6px 12px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '800',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            boxShadow: '0 4px 12px rgba(41, 128, 185, 0.2)'
                                                        }}
                                                    >
                                                        <Utensils size={14} />
                                                        MOVE TO MIXING TABLE
                                                    </button>
                                                </div>
                                                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                                                    A high-confidence match for <strong>{sim.identifiedDish}</strong>. This combination successfully balanced primary flavor profiles to achieve a {sim.confidenceScore}% structural alignment with the reference database.
                                                </p>
                                            </div>
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
