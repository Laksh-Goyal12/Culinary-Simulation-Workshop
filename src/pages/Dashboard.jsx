import React, { useState } from 'react';
import { Trophy, ChefHat, Star, Activity, Utensils, Zap, Scroll, X, Info, Edit2, Check, BookOpen, Trash2 } from 'lucide-react';
import useUserProgress from '../hooks/useUserProgress';

const InfoModal = ({ title, content, onClose }) => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
        <div style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }} onClick={e => e.stopPropagation()}>
            <button onClick={onClose} style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
            }}>
                <X size={24} />
            </button>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Info size={28} color="var(--color-neon-cyan)" />
                {title}
            </h3>
            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '1rem' }}>
                {content}
            </div>
        </div>
    </div>
);

const Dashboard = ({ simulationHistory, ingredientVaultSize, setCurrentPage, onRenameSimulation, onDeleteSimulation, onViewRecipe, onImport }) => {
    const {
        totalXP,
        level,
        rank,
        progressPercent,
        xpInCurrentLevel,
        xpNeededForNextLevel,
        stats
    } = useUserProgress(simulationHistory, ingredientVaultSize);

    const [activeInfo, setActiveInfo] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [tempName, setTempName] = useState('');

    const handleStartEdit = (e, sim) => {
        e.stopPropagation();
        setEditingId(sim.id);
        setTempName(sim.identifiedDish || 'Experimental Mixture');
    };

    const handleSaveEdit = (e, id) => {
        e.stopPropagation();
        if (tempName.trim()) {
            onRenameSimulation(id, tempName.trim());
        }
        setEditingId(null);
    };

    const recentActivity = simulationHistory.slice(-5).reverse();

    return (
        <div style={{
            padding: '32px',
            height: '100%',
            overflowY: 'auto',
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
        }}>
            {activeInfo && (
                <InfoModal
                    title={activeInfo.title}
                    content={activeInfo.content}
                    onClose={() => setActiveInfo(null)}
                />
            )}
            {/* Header / Profile Section */}
            <div className="card-3d" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fffaf0 100%)',
                padding: '32px',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '32px',
                position: 'relative',
                overflow: 'visible'
            }}>
                {/* Rank Badge */}
                <div style={{
                    width: '120px',
                    height: '120px',
                    background: `linear-gradient(135deg, ${rank.color}, #2c3e50)`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.2)',
                    border: '4px solid #fff',
                    flexShrink: 0,
                    position: 'relative'
                }}>
                    <ChefHat size={60} color="#fff" strokeWidth={2} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '-10px',
                        background: 'var(--color-neon-cyan)',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '800',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        whiteSpace: 'nowrap'
                    }}>
                        LVL {level}
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ textTransform: 'uppercase', letterSpacing: '2px', color: rank.color, fontWeight: '800', fontSize: '0.9rem', marginBottom: '8px' }}>
                        Current Rank
                    </div>
                    <h1 className="hero-text" style={{
                        fontSize: '3rem',
                        margin: 0,
                        color: 'var(--text-primary)',
                        lineHeight: '1',
                        marginBottom: '16px'
                    }}>
                        {rank.title}
                    </h1>

                    {/* XP Progress Bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                            <span>XP Progress</span>
                            <span>{Math.floor(xpInCurrentLevel)} / {xpNeededForNextLevel} XP</span>
                        </div>
                        <div className="xp-bar-container" style={{ height: '16px', background: 'rgba(0,0,0,0.05)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div className="xp-bar-fill" style={{
                                width: `${progressPercent}%`,
                                background: `linear-gradient(90deg, ${rank.color}, var(--color-neon-cyan))`,
                                borderRadius: '8px'
                            }}></div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                            Collect ingredients and master recipes to earn prestige.
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
            }}>
                {/* Total Dishes */}
                <div
                    className="card-3d card-hover"
                    style={{ background: '#fff', padding: '24px', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => setActiveInfo({
                        title: 'Experiments Cooked',
                        content: (
                            <>
                                <p>This tracks every single cooking session you initialize in the kitchen, whether it results in a masterpiece or a disaster.</p>
                                <p><strong>How to increase:</strong> Simply mix ingredients and hit "COOK".</p>
                                <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '12px', marginTop: '16px', color: '#ea580c', fontWeight: 'bold' }}>
                                    Reward: +50 XP per experiment
                                </div>
                            </>
                        )
                    })}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{
                            background: '#fff7ed',
                            padding: '12px',
                            borderRadius: '16px',
                            color: '#ea580c'
                        }}>
                            <Utensils size={28} />
                        </div>
                        <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: '1' }}>
                            {stats.totalExperiments}
                        </span>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Experiments</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total cooking sessions identified</div>
                    </div>
                </div>

                {/* Recipes Mastered */}
                <div
                    className="card-3d card-hover"
                    style={{ background: '#fff', padding: '24px', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => setActiveInfo({
                        title: 'Recipes Mastered',
                        content: (
                            <>
                                <p>A measurement of your culinary expertise. This count increases only when you successfully discover a valid recipe from the database.</p>
                                <p><strong>How to increase:</strong> Match ingredients correctly to discover known dishes (e.g., Pasta Carbonara, Sushi).</p>
                                <div style={{ background: '#f5f3ff', padding: '12px', borderRadius: '12px', marginTop: '16px', color: '#7c3aed', fontWeight: 'bold' }}>
                                    Reward: +200 XP per discovery
                                </div>
                            </>
                        )
                    })}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{
                            background: '#f5f3ff',
                            padding: '12px',
                            borderRadius: '16px',
                            color: '#7c3aed'
                        }}>
                            <Trophy size={28} />
                        </div>
                        <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: '1' }}>
                            {stats.recipesMastered}
                        </span>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Mastered Recipes</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Unique dishes verified</div>
                    </div>
                </div>

                {/* Total XP */}
                <div
                    className="card-3d card-hover"
                    style={{ background: '#fff', padding: '24px', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => setActiveInfo({
                        title: 'Experience Points (XP)',
                        content: (
                            <>
                                <p>Your overall progress indicator. Earn XP to level up and achieve higher kitchen ranks.</p>
                                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                                    <li><strong>Cooking:</strong> 50 XP</li>
                                    <li><strong>Recipe Discovery:</strong> 200 XP</li>
                                    <li><strong>Ingredient Collection:</strong> 5 XP per item</li>
                                </ul>
                                <div style={{ background: '#ecfccb', padding: '12px', borderRadius: '12px', marginTop: '16px', color: '#65a30d', fontWeight: 'bold' }}>
                                    Next Level: {Math.floor(xpInCurrentLevel)} / {xpNeededForNextLevel} XP
                                </div>
                            </>
                        )
                    })}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{
                            background: '#ecfccb',
                            padding: '12px',
                            borderRadius: '16px',
                            color: '#65a30d'
                        }}>
                            <Zap size={28} />
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: '1' }}>
                            {new Intl.NumberFormat().format(totalXP)}
                        </span>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Total XP</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Cumulative experience</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{
                        fontSize: '1.2rem',
                        color: 'var(--text-primary)',
                        fontWeight: '800',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <Activity size={20} color="var(--color-neon-cyan)" />
                        RECENT CULINARY LOGS
                    </h2>
                    <button
                        onClick={() => setCurrentPage('lab-results')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-neon-cyan)',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(41, 128, 185, 0.05)'}
                        onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                        SEE ALL →
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recentActivity.length === 0 ? (
                        <div className="panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No cooking history yet. Start exploring the kitchen!
                        </div>
                    ) : (
                        recentActivity.map((sim, idx) => (
                            <div
                                key={sim.id}
                                className="card-hover"
                                style={{
                                    padding: '20px',
                                    background: '#f8fafc',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: sim.recipeDetails ? 'pointer' : 'default',
                                    border: '1px solid #e2e8f0',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => {
                                    if (sim.recipeDetails && sim.recipeDetails.ingredients) {
                                        onImport(sim.recipeDetails.ingredients, sim.identifiedDish);
                                    } else {
                                        // Fallback to view if ingredients aren't cached, or if simulation had no ingredients
                                        const rId = sim.recipeDetails?.id || sim.recipeDetails?.Recipe_id;
                                        if (rId) onViewRecipe(rId, { title: sim.identifiedDish });
                                    }
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: sim.identifiedDish ? 'var(--color-neon-green)' : 'var(--color-neon-cyan)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}>
                                        {sim.identifiedDish ? <ChefHat size={24} /> : <Zap size={24} />}
                                    </div>
                                    <div>
                                        {editingId === sim.id ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={e => e.stopPropagation()}>
                                                <input
                                                    autoFocus
                                                    value={tempName}
                                                    onChange={e => setTempName(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleSaveEdit(e, sim.id)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '8px',
                                                        border: '2px solid var(--color-neon-cyan)',
                                                        outline: 'none',
                                                        fontSize: '1rem',
                                                        fontWeight: '700',
                                                        width: '180px'
                                                    }}
                                                />
                                                <button
                                                    onClick={(e) => handleSaveEdit(e, sim.id)}
                                                    style={{ background: 'var(--color-neon-green)', border: 'none', borderRadius: '8px', padding: '4px', cursor: 'pointer', color: '#fff' }}
                                                >
                                                    <Check size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem' }}>
                                                        {sim.identifiedDish || 'Experimental Mixture'}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStartEdit(e, sim);
                                                        }}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', opacity: 0.6 }}
                                                        title="Rename"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteSimulation(sim.id);
                                                        }}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-alert-red)', display: 'flex', alignItems: 'center', opacity: 0.6 }}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 'normal' }}>
                                                    • {new Date(sim.timestamp).toLocaleDateString()} {new Date(sim.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        )}
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                            {sim.ingredients.map(i => i.name).join(', ')}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {sim.recipeDetails && (
                                        <div style={{ color: 'var(--color-neon-cyan)', opacity: 0.6 }}>
                                            <BookOpen size={20} />
                                        </div>
                                    )}
                                    <div style={{
                                        fontSize: '0.9rem',
                                        fontWeight: '800',
                                        color: sim.identifiedDish ? 'var(--color-neon-green)' : 'var(--text-muted)',
                                        background: sim.identifiedDish ? 'rgba(39, 174, 96, 0.1)' : 'rgba(0,0,0,0.05)',
                                        padding: '4px 12px',
                                        borderRadius: '8px'
                                    }}>
                                        {sim.confidenceScore}%
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
