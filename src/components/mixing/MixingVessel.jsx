import React from 'react';
import { RotateCcw, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MixingVessel = ({ selectedIngredients, onRemove, onUpdate, onProcess, onReset, status, logs }) => {

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingBottom: '24px', overflow: 'hidden' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Cook Controls / Sensors - REMOVED per user request */}

                {/* Central Cooking Pot - 3D BOWL */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    margin: '0 0 24px 0',
                    background: 'radial-gradient(circle at 30% 30%, #f5f5f5 0%, #e0e0e0 40%, #d6d6d6 100%)', /* Metallic Ceramic */
                    borderRadius: '50%',
                    aspectRatio: '1/1',
                    maxHeight: '400px',
                    width: '100%',
                    maxWidth: '400px',
                    alignSelf: 'center',
                    boxShadow: 'inset 10px 10px 30px rgba(0,0,0,0.05), inset -5px -5px 15px rgba(255,255,255,0.5), 20px 20px 60px rgba(0,0,0,0.1), -20px -20px 60px rgba(255,255,255,0.3)', /* Deep 3D - Softened */
                    border: '8px solid #f0f0f0'
                }}>

                    <AnimatePresence>
                        {status === 'processing' && (
                            <>
                                {/* Cooking Fire/Glow */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 0.95 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                                    style={{
                                        position: 'absolute',
                                        width: '90%',
                                        height: '90%',
                                        borderRadius: '50%',
                                        background: 'radial-gradient(circle, rgba(230, 126, 34, 0.6) 0%, transparent 70%)',
                                        zIndex: 0,
                                        mixBlendMode: 'multiply'
                                    }}
                                />
                            </>
                        )}
                    </AnimatePresence>

                    {/* Inner Bowl Shadow/Depth */}
                    <div style={{
                        position: 'absolute', inset: '20px', borderRadius: '50%',
                        boxShadow: 'inset 10px 10px 20px rgba(0,0,0,0.1), inset -5px -5px 15px rgba(255,255,255,0.5)',
                        background: 'radial-gradient(circle at 70% 70%, #f0f0f0 0%, #ddd 100%)',
                        zIndex: 1
                    }}></div>

                    <div style={{ zIndex: 2, textAlign: 'center', width: '88%', height: '88%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {selectedIngredients.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                                <Flame size={64} style={{ opacity: 0.2, marginBottom: '16px', color: '#000' }} />
                                <p style={{ letterSpacing: '2px', fontWeight: '800', opacity: 0.4 }}>ADD INGREDIENTS</p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '4px',
                                justifyContent: 'center',
                                alignContent: 'center',
                                padding: '4px',
                                height: '100%',
                                overflowY: 'scroll', // Force scrollbar to prevent flashing
                                // scrollbarGutter is redundant if we force scroll, but harmless.
                            }}
                                className="thin-scrollbar"
                            >
                                {selectedIngredients.map((ing, idx) => (
                                    <motion.div
                                        key={`${ing.id}-${idx}`}
                                        initial={{ scale: 0, y: -50, rotateX: 45 }}
                                        animate={{
                                            scale: 1,
                                            y: status === 'processing' ? [0, -5, 0] : 0,
                                            rotateX: 0
                                        }}
                                        className="ingredient-pill"
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: '50px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: '#333',
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1), 0 1px 0 rgba(0,0,0,0.05)',
                                            border: '1px solid rgba(0,0,0,0.05)',
                                            transform: 'translateZ(10px)',
                                            whiteSpace: 'nowrap',
                                            flexShrink: 0 // Prevent shrinking too much
                                        }}
                                    >
                                        <span style={{ fontSize: '1rem' }}>{ing.icon}</span>
                                        <span>{ing.name}</span>
                                        <div style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 4px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', color: '#666' }}>
                                            {ing.quantity}{ing.unit || 'g'}
                                        </div>
                                        <button
                                            onClick={() => onRemove(idx)}
                                            disabled={status === 'processing'}
                                            style={{
                                                background: '#ff6b6b',
                                                border: 'none',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                marginLeft: '4px',
                                                borderRadius: '50%',
                                                width: '14px',
                                                height: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '10px',
                                                lineHeight: 1
                                            }}
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
                <div style={{ display: 'flex', gap: '16px', marginTop: 'auto', marginBottom: '8px' }}>
                    <button
                        onClick={onReset}
                        disabled={status === 'processing'}
                        style={{
                            padding: '16px 24px',
                            background: '#fff',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                            borderRadius: '50px',
                            cursor: status === 'processing' ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '800',
                            boxShadow: '0 5px 0 #ddd, 0 10px 15px rgba(0,0,0,0.1)',
                            transition: 'all 0.1s'
                        }}
                        onMouseDown={e => e.currentTarget.style.transform = 'translateY(5px) scale(0.98)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
                    >
                        <RotateCcw size={18} /> CLEAR
                    </button>

                    <button
                        onClick={onProcess}
                        disabled={status === 'processing' || selectedIngredients.length === 0}
                        className="btn-gamified"
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            fontSize: '1.2rem',
                            cursor: (status === 'processing' || selectedIngredients.length === 0) ? 'not-allowed' : 'pointer',
                            opacity: (status === 'processing' || selectedIngredients.length === 0) ? 0.6 : 1,
                            filter: (status === 'processing') ? 'grayscale(100%)' : 'none'
                        }}
                    >
                        <Flame size={24} fill={status === 'processing' ? 'none' : '#fff'} />
                        {status === 'processing' ? 'COOKING...' : 'COOK DISH'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MixingVessel;
