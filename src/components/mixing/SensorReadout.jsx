import React from 'react';

const SensorReadout = ({ label, value, unit, color = 'var(--color-neon-cyan)' }) => {
    return (
        <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: `1px solid ${color}`,
            padding: '8px 12px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: `0 0 5px ${color}33`,
            minWidth: '120px'
        }}>
            <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: color,
                boxShadow: `0 0 4px ${color}`
            }} />
            <div>
                <div style={{
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {label}
                </div>
                <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: color,
                    fontFamily: 'var(--font-mono)'
                }}>
                    {value} <span style={{ fontSize: '0.7rem' }}>{unit}</span>
                </div>
            </div>
        </div>
    );
};

export default SensorReadout;
