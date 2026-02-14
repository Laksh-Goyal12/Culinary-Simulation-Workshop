import React from 'react';
import { AlertTriangle, Zap, Dna } from 'lucide-react';

const InteractionAlert = ({ activeAlerts = [] }) => {
    return (
        <div style={{ flex: '0 0 auto', maxHeight: '150px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '1px' }}>
                BIO_SYNERGY
            </h3>

            {activeAlerts.length === 0 ? (
                <div style={{
                    fontSize: '0.75rem',
                    color: '#444',
                    border: '1px dashed #333',
                    padding: '8px',
                    borderRadius: '4px',
                    fontStyle: 'italic'
                }}>
                    No active interactions detected.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeAlerts.map((alert, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            gap: '8px',
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderLeft: '2px solid var(--color-neon-cyan)',
                            borderRadius: '0 4px 4px 0'
                        }}>
                            <Zap size={14} color="var(--color-neon-cyan)" style={{ marginTop: '2px' }} />
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{alert}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InteractionAlert;
