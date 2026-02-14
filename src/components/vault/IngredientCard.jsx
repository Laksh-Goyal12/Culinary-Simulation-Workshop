import React from 'react';
import { GripVertical, Plus } from 'lucide-react';

const IngredientCard = ({ ingredient, onAdd }) => {
    return (
        <div
            className="panel"
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                marginBottom: '8px',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-neon-cyan)';
                e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.backgroundColor = 'var(--bg-panel)';
            }}
        >
            {/* Icon */}
            <div style={{
                fontSize: '1.5rem',
                marginRight: 'var(--spacing-sm)',
                filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.2))'
            }}>
                {ingredient.icon}
            </div>

            {/* Info */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {ingredient.name}
                </div>
                <div style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    fontFamily: 'var(--font-mono)'
                }}>
                    {ingredient.scientific}
                </div>

                {/* Chips */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {ingredient.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} style={{
                            fontSize: '0.6rem',
                            padding: '2px 4px',
                            borderRadius: '2px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'var(--text-secondary)'
                        }}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Action */}
            <button
                onClick={() => onAdd(ingredient)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-neon-cyan)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                }}
                title="Add to Mixing Vessel"
            >
                <Plus size={20} />
            </button>
        </div>
    );
};

export default IngredientCard;
