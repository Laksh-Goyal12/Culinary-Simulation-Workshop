import React, { useMemo } from 'react';
import { Trophy, ChefHat, Star, Activity, Utensils } from 'lucide-react';

const Dashboard = ({ simulationHistory, ingredientVaultSize }) => {
    const stats = useMemo(() => {
        const totalExperiments = simulationHistory.length;
        const recipesIdentified = simulationHistory.filter(s => s.identifiedDish).length;
        // User Level Calculation (100 XP per experiment)
        const totalXP = totalExperiments * 100 + recipesIdentified * 250;
        const level = Math.floor(totalXP / 1000) + 1;
        const nextLevelXP = level * 1000;
        const progress = ((totalXP % 1000) / 1000) * 100;

        return {
            totalExperiments,
            recipesIdentified,
            totalXP,
            level,
            progress,
            nextLevelXP
        };
    }, [simulationHistory, ingredientVaultSize]);

    const recentActivity = simulationHistory.slice(-5).reverse();

    return (
        <div style={{
            padding: '40px',
            height: '100%',
            overflowY: 'auto',
            background: 'transparent'
        }}>
            {/* Header / Profile Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '50px', animation: 'slideUp 0.5s ease' }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    background: 'linear-gradient(135deg, var(--color-molecular-blue), var(--color-neon-cyan))',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2), inset 0 -5px 10px rgba(0,0,0,0.1)',
                    border: '4px solid #fff'
                }}>
                    <ChefHat size={50} color="#fff" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                </div>
                <div style={{ flex: 1 }}>
                    <h1 className="hero-text" style={{
                        fontSize: '3rem',
                        margin: 0,
                        color: 'var(--text-primary)',
                        textShadow: '2px 2px 0px rgba(255,255,255,0.5), 4px 4px 0px rgba(0,0,0,0.05)'
                    }}>HEAD CHEF</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                        <span className="unit-text" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', background: 'var(--color-molecular-blue)', padding: '4px 12px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>Level {stats.level}</span>
                        <div className="xp-bar-container" style={{ maxWidth: '300px', background: 'rgba(255,255,255,0.5)', height: '12px', borderRadius: '6px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
                            <div className="xp-bar-fill" style={{ width: `${stats.progress}%`, background: 'linear-gradient(90deg, #f1c40f, #e67e22)', borderRadius: '6px' }}></div>
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>
                            {Math.round(stats.progress * 10)} / 1000 XP
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '50px',
                animation: 'slideUp 0.6s ease'
            }}>
                <div className="card-3d card-hover" style={{ borderRadius: '24px', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span className="text-muted" style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>Total Dishes</span>
                        <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '12px' }}>
                            <Utensils size={24} style={{ color: '#d97706' }} />
                        </div>
                    </div>
                    <div className="unit-text" style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--text-primary)', textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
                        {stats.totalExperiments}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>experiments cooked</div>
                </div>

                <div className="card-3d card-hover" style={{ borderRadius: '24px', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span className="text-muted" style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>Recipes Mastered</span>
                        <div style={{ background: '#ede9fe', padding: '8px', borderRadius: '12px' }}>
                            <Trophy size={24} style={{ color: '#8b5cf6' }} />
                        </div>
                    </div>
                    <div className="unit-text" style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--text-primary)', textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
                        {stats.recipesIdentified}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>recipes verified</div>
                </div>

                <div className="card-3d card-hover" style={{ borderRadius: '24px', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span className="text-muted" style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>Kitchen Rank</span>
                        <div style={{ background: '#dcfce7', padding: '8px', borderRadius: '12px' }}>
                            <Star size={24} style={{ color: '#16a34a' }} />
                        </div>
                    </div>
                    <div className="unit-text" style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)', marginTop: '8px', lineHeight: '1.2' }}>
                        {stats.level < 5 ? 'Sous Chef' : 'Exec. Chef'}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '4px' }}>Level {stats.level}</div>
                </div>
            </div>

            {/* Recent Activity */}
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '20px', animation: 'slideUp 0.7s ease' }}>
                Recent Culinary Works
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'slideUp 0.8s ease' }}>
                {recentActivity.length === 0 ? (
                    <div className="card-3d" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '16px', borderStyle: 'dashed', borderWidth: '2px', background: 'transparent' }}>
                        Go to the KITCHEN to start cooking your first dish!
                    </div>
                ) : (
                    recentActivity.map((sim, idx) => (
                        <div key={sim.id} className="card-3d card-hover" style={{
                            padding: '20px',
                            borderRadius: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderLeft: sim.identifiedDish ? '6px solid var(--color-neon-green)' : '6px solid var(--border-color)',
                            background: '#fff',
                            marginBottom: '4px'
                        }}>
                            <div>
                                <div className="unit-text" style={{ fontSize: '1.2rem', marginBottom: '4px', fontWeight: '800', color: 'var(--text-primary)' }}>
                                    {sim.identifiedDish || 'Experimental Dish'}
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
                                    {new Date(sim.timestamp).toLocaleDateString()} at {new Date(sim.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    background: 'var(--bg-app)',
                                    padding: '6px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)'
                                }}>
                                    {sim.ingredients.length} Ingredients
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;
