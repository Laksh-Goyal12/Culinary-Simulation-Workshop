import React from 'react';


const MainLayout = ({ leftColumn, centerColumn, rightColumn }) => {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

            <main className="main-layout-grid">
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
