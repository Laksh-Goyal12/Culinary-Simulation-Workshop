import React from 'react';
import { Plus } from 'lucide-react';

const IngredientCard = ({ ingredient, onAdd }) => {
    return (
        <div
            className="card-3d card-hover"
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                marginBottom: '12px',
                cursor: 'pointer',
                borderRadius: '16px',
                border: 'none',
                background: '#fff',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'visible' /* Changed to visible for shadow to pop */
            }}
            onClick={() => onAdd(ingredient)}
        >
            {/* Icon */}
            <div style={{
                fontSize: '2rem',
                marginRight: '16px',
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
            }}>
                {ingredient.icon}
            </div>

            {/* Info */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <div className="unit-text" style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: 'var(--text-primary)'
                }}>
                    {ingredient.name}
                </div>
            </div>

            {/* Action */}
            <button
                style={{
                    background: 'var(--color-neon-green)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 0 #1e8449, 0 5px 10px rgba(0,0,0,0.2)',
                    transition: 'transform 0.1s',
                    cursor: 'pointer'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'translateY(4px)'}
                onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <Plus size={20} strokeWidth={3} />
            </button>
        </div>
    );
};

export default IngredientCard;
