import React, { useState, useEffect } from 'react';
import { RotateCcw, Play, FlaskConical, Thermometer, Droplets } from 'lucide-react';
import SimulationLog from './SimulationLog';
import { motion, AnimatePresence } from 'framer-motion';

const MixingVessel = ({ selectedIngredients, onRemove, onUpdate, onProcess, onReset, status, logs }) => {
    // Local state for sensor overrides
    const [tempOverride, setTempOverride] = useState(62);
    const [viscOverride, setViscOverride] = useState(1.2);

    // Update overrides when ingredients change (if not processing)
    useEffect(() => {
        if (status !== 'processing') {
            if (selectedIngredients.length > 0) {
                setTempOverride(62 + (selectedIngredients.length * 1.5));
                setViscOverride(parseFloat((1.2 + (selectedIngredients.length * 0.1)).toFixed(2)));
            } else {
                setTempOverride(62);
                setViscOverride(1.2);
            }
        }
    }, [selectedIngredients, status]);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>

                {/* Interactive Sensors */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)', gap: '16px' }}>

                    {/* Temperature Control */}
                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255, 42, 42, 0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-alert-red)', fontSize: '0.8rem' }}>
                                <Thermometer size={14} /> VESSEL_TEMP
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-alert-red)' }}>{Math.round(tempOverride)}°C</div>
                        </div>
                        <input
                            type="range"
                            min="0" max="100"
                            value={tempOverride}
                            onChange={(e) => setTempOverride(Number(e.target.value))}
                            disabled={status === 'processing'}
                            style={{ width: '100%', accentColor: 'var(--color-alert-red)' }}
                        />
                    </div>

                    {/* Viscosity Control */}
                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(42, 157, 244, 0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-molecular-blue)', fontSize: '0.8rem' }}>
                                <Droplets size={14} /> VISCOSITY
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-molecular-blue)' }}>{Number(viscOverride).toFixed(1)} Pa·s</div>
                        </div>
                        <input
                            type="range"
                            min="0.1" max="10.0" step="0.1"
                            value={viscOverride}
                            onChange={(e) => setViscOverride(Number(e.target.value))}
                            disabled={status === 'processing'}
                            style={{ width: '100%', accentColor: 'var(--color-molecular-blue)' }}
                        />
                    </div>

                </div>

                {/* Central Vessel Area */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '16px',
                    margin: '0 0 var(--spacing-md) 0',
                    background: 'radial-gradient(circle, rgba(20,20,20,0.8) 0%, rgba(0,0,0,0.8) 100%)',
                    overflow: 'hidden'
                }}>

                    <AnimatePresence>
                        {status === 'processing' && (
                            <>
                                {/* Outer Glow Ring */}
                                <motion.div
                                    initial={{ opacity: 0, rotate: 0 }}
                                    animate={{ opacity: 1, rotate: 360 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    style={{
                                        position: 'absolute',
                                        width: '280px',
                                        height: '280px',
                                        borderRadius: '50%',
                                        border: '2px solid transparent',
                                        borderTopColor: 'var(--color-neon-cyan)',
                                        borderBottomColor: 'var(--color-neon-green)',
                                        boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)',
                                        zIndex: 0
                                    }}
                                />

                                {/* Inner Spinning Core */}
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: [1, 1.2, 1], opacity: 1, rotate: -360 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    style={{
                                        position: 'absolute',
                                        width: '180px',
                                        height: '180px',
                                        borderRadius: '40%',
                                        background: 'conic-gradient(from 180deg at 50% 50%, var(--color-neon-green), transparent, var(--color-neon-cyan), transparent)',
                                        filter: 'blur(20px)',
                                        zIndex: 0,
                                        mixBlendMode: 'screen'
                                    }}
                                />

                                {/* Bubbles Simulation */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: -100, opacity: [0, 1, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                    style={{
                                        position: 'absolute',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        boxShadow: '0 0 10px white',
                                        zIndex: 1
                                    }}
                                />
                            </>
                        )}
                    </AnimatePresence>

                    <div style={{ zIndex: 2, textAlign: 'center', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedIngredients.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)' }}>
                                <FlaskConical size={48} style={{ opacity: 0.3, marginBottom: '8px' }} />
                                <p>ADD COMPOUNDS FROM VAULT</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '80%', alignContent: 'center' }}>
                                {selectedIngredients.map((ing, idx) => (
                                    <motion.div
                                        key={`${ing.id}-${idx}`}
                                        initial={{ scale: 0, y: 20 }}
                                        animate={{
                                            scale: 1,
                                            y: status === 'processing' ? [0, -10, 0] : 0,
                                            rotate: status === 'processing' ? [0, 5, -5, 0] : 0
                                        }}
                                        transition={{
                                            type: 'spring',
                                            duration: 0.5,
                                            // Staggered float effect during processing
                                            repeat: status === 'processing' ? Infinity : 0,
                                            repeatDelay: Math.random()
                                        }}
                                        className="glass-panel"
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '0.8rem',
                                            color: ing.color,
                                            border: `1px solid ${ing.color}44`,
                                            background: `rgba(0,0,0,0.6)`
                                        }}
                                    >
                                        <span>{ing.icon}</span>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <span>{ing.name}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.6rem', marginTop: '2px' }}>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="9999"
                                                    value={ing.quantity || 10}
                                                    onChange={(e) => onUpdate(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 0))}
                                                    disabled={status === 'processing'}
                                                    style={{
                                                        width: '32px',
                                                        background: 'rgba(255,255,255,0.1)',
                                                        border: 'none',
                                                        color: 'var(--text-primary)',
                                                        textAlign: 'center',
                                                        borderRadius: '2px',
                                                        fontSize: '0.6rem',
                                                        padding: '1px'
                                                    }}
                                                />
                                                <span style={{ opacity: 0.5 }}>{ing.unit || 'g'}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onRemove(idx)}
                                            disabled={status === 'processing'}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '4px' }}
                                        >
                                            ×
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                    <button
                        onClick={onReset}
                        className="mono"
                        disabled={status === 'processing'}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: 'transparent',
                            border: '1px solid var(--color-alert-red)',
                            color: 'var(--color-alert-red)',
                            borderRadius: '4px',
                            cursor: status === 'processing' ? 'not-allowed' : 'pointer',
                            opacity: status === 'processing' ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <RotateCcw size={16} /> RESET
                    </button>

                    <button
                        onClick={onProcess}
                        className="mono"
                        disabled={status === 'processing'}
                        style={{
                            flex: 2,
                            padding: '12px',
                            background: 'rgba(57, 255, 20, 0.1)',
                            border: '1px solid var(--color-neon-green)',
                            color: 'var(--color-neon-green)',
                            borderRadius: '4px',
                            cursor: status === 'processing' ? 'not-allowed' : 'pointer',
                            opacity: status === 'processing' ? 0.8 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: status === 'processing' ? 'none' : 'var(--glow-green)'
                        }}
                    >
                        <Play size={16} /> {status === 'processing' ? 'PROCESSING...' : 'INITIATE SIMULATION'}
                    </button>
                </div>

                {/* Log */}
                <SimulationLog logs={logs} />
            </div>
        </div>
    );
};

export default MixingVessel;
