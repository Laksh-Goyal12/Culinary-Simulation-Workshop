import React from 'react';
import Header from './Header';

const MainLayout = ({ leftColumn, centerColumn, rightColumn }) => {
    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{
                flex: 1,
                padding: 'var(--spacing-md)',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'minmax(300px, 3fr) minmax(500px, 6fr) minmax(300px, 3fr)',
                gap: 'var(--spacing-md)'
            }}>
                {/* Left Column - Ingredient Vault */}
                <section style={{ height: '100%', overflow: 'hidden' }}>
                    {leftColumn}
                </section>

                {/* Center Column - Mixing Zone */}
                <section style={{ height: '100%', overflow: 'hidden' }}>
                    {centerColumn}
                </section>

                {/* Right Column - Simulation HUD */}
                <section style={{ height: '100%', overflow: 'hidden' }}>
                    {rightColumn}
                </section>
            </main>
        </div>
    );
};

export default MainLayout;
