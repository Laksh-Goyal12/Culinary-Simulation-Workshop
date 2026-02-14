import React from 'react';

const TABS = [
    { id: 'ALL', label: 'ALL' },
    { id: 'SPICES', label: 'SPICES' },
    { id: 'MOLC', label: 'MOLC' }, // Molecules
    { id: 'SPIRITS', label: 'SPIRITS' },
    { id: 'PROD', label: 'PROD' }, // Produce
];

const VaultTabs = ({ activeTab, setActiveTab }) => {
    return (
        <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: 'var(--spacing-md)'
        }}>
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                        flex: 1,
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === tab.id ? '2px solid var(--color-neon-cyan)' : '2px solid transparent',
                        color: activeTab === tab.id ? 'var(--color-neon-cyan)' : 'var(--text-muted)',
                        padding: '8px 0',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontFamily: 'var(--font-mono)'
                    }}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default VaultTabs;
