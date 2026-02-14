import React, { useEffect, useRef } from 'react';

const SimulationLog = ({ logs }) => {
    const logEndRef = useRef(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div style={{
            background: '#0a0a0a',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            height: '150px',
            overflowY: 'auto',
            padding: 'var(--spacing-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        }}>
            <div style={{
                color: 'var(--color-neon-green)',
                borderBottom: '1px solid #333',
                paddingBottom: '4px',
                marginBottom: '4px',
                fontSize: '0.7rem'
            }}>
                &gt; SYSTEM_LOG_ACTIVE
            </div>
            {logs.length === 0 && (
                <div style={{ color: '#444', fontStyle: 'italic' }}>Waiting for input...</div>
            )}
            {logs.map((log, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#555' }}>{log.time}</span>
                    <span style={{ color: log.type === 'error' ? 'var(--color-alert-red)' : 'var(--text-primary)' }}>
                        {log.message}
                    </span>
                </div>
            ))}
            <div ref={logEndRef} />
        </div>
    );
};

export default SimulationLog;
