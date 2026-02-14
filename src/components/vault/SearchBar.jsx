import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
    return (
        <div style={{ position: 'relative', marginBottom: 'var(--spacing-md)' }}>
            <Search
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
                type="text"
                placeholder="SEARCH COMPOUND_DB..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    width: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '10px 10px 10px 38px',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-mono)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-neon-cyan)';
                    e.target.style.boxShadow = 'var(--glow-cyan)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-color)';
                    e.target.style.boxShadow = 'none';
                }}
            />
        </div>
    );
};

export default SearchBar;
