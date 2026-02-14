import React from 'react';
import { Home, Search, UtensilsCrossed, BookOpen } from 'lucide-react';

const Navigation = ({ currentPage, setCurrentPage }) => {
    const pages = [
        { id: 'dashboard', name: 'HOME', icon: Home },
        { id: 'inventory', name: 'KITCHEN', icon: UtensilsCrossed },
        { id: 'search-dish', name: 'RECIPES', icon: Search },
        { id: 'lab-results', name: 'JOURNAL', icon: BookOpen }
    ];

    return (
        <nav className="glass-nav" style={{
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            zIndex: 100,
            position: 'relative'
        }}>
            {/* Logo Area */}
            <div style={{
                fontSize: '1.4rem',
                fontWeight: '800',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <span className="hero-text">CULINARY</span>
                <span style={{
                    color: '#fff',
                    background: 'var(--color-molecular-blue)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    verticalAlign: 'middle'
                }}>ARCADE</span>
            </div>

            {/* Navigation Links */}
            <div style={{ display: 'flex', gap: '8px' }}>
                {pages.map(page => {
                    const Icon = page.icon;
                    const isActive = currentPage === page.id;

                    return (
                        <button
                            key={page.id}
                            onClick={() => setCurrentPage(page.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px 24px',
                                background: isActive ? 'linear-gradient(135deg, #fff, #f0f0f0)' : 'transparent',
                                border: isActive ? 'none' : '2px solid transparent',
                                borderRadius: '16px',
                                color: isActive ? 'var(--color-molecular-blue)' : 'var(--text-secondary)',
                                fontSize: '0.9rem',
                                fontWeight: isActive ? '800' : '600',
                                cursor: 'pointer',
                                transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                                outline: 'none',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: isActive ?
                                    '0 6px 0 #d1d5db, 0 10px 10px rgba(0,0,0,0.1)' : /* 3D Active State */
                                    'none',
                                transform: isActive ? 'translateY(-4px)' : 'none',
                                top: isActive ? 0 : 0
                            }}
                            className="nav-item"
                            onMouseDown={(e) => {
                                if (isActive) {
                                    e.currentTarget.style.transform = 'translateY(0px)';
                                    e.currentTarget.style.boxShadow = '0 2px 0 #d1d5db, 0 2px 5px rgba(0,0,0,0.1)';
                                }
                            }}
                            onMouseUp={(e) => {
                                if (isActive) {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 6px 0 #d1d5db, 0 10px 10px rgba(0,0,0,0.1)';
                                }
                            }}
                        >
                            <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                            <span style={{ letterSpacing: '0.5px' }}>{page.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Empty right side for spacing balance or future user profile */}
            <div style={{ width: '120px', textAlign: 'right', fontSize: '0.8rem', opacity: 0.5 }}>
                v1.2.0 BETA
            </div>
        </nav>
    );
};

export default Navigation;
