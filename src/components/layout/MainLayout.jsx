import React from 'react';


const MainLayout = ({ leftColumn, centerColumn, rightColumn }) => {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

            <main style={{
                flex: 1,
                minHeight: 0, // Ensure flex item shrinks
                padding: 'var(--spacing-md) var(--spacing-md) 60px var(--spacing-md)', // Increased to 60px for definitive visibility
                overflow: 'hidden', // Restored to prevent expansion
                display: 'grid',
                gridTemplateColumns: 'minmax(300px, 3fr) minmax(500px, 6fr) minmax(300px, 3fr)',
                gridTemplateRows: 'minmax(0, 1fr)', // Force grid to stay within container
                gap: 'var(--spacing-md)'
            }}>
                {/* Left Column - Ingredient Vault */}
                <section style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
                    {leftColumn}
                </section>

                {/* Center Column - Mixing Zone */}
                <section style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
                    {centerColumn}
                </section>

                {/* Right Column - Simulation HUD */}
                <section style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'visible' }}>
                    {rightColumn}
                </section>
            </main>
        </div>
    );
};

export default MainLayout;
