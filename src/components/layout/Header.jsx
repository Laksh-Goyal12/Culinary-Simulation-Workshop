import React from 'react';
import { Activity, User, FlaskConical, Database, LayoutDashboard, FileText } from 'lucide-react';

const Header = () => {
  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--spacing-lg)',
      justifyContent: 'space-between',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Brand & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <FlaskConical size={24} color="var(--color-neon-green)" />
          <h1 style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '1px' }}>
            CULINARY_SIM <span style={{ color: 'var(--color-neon-cyan)' }}>WORKSHOP</span>
          </h1>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--spacing-xs)', 
          background: 'rgba(57, 255, 20, 0.1)', 
          padding: '4px 8px', 
          borderRadius: '4px',
          border: '1px solid rgba(57, 255, 20, 0.2)' 
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-neon-green)', boxShadow: '0 0 5px var(--color-neon-green)' }}></div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)' }}>SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', gap: 'var(--spacing-xl)' }}>
        <NavLink icon={LayoutDashboard} label="DASHBOARD" />
        <NavLink icon={Database} label="INVENTORY" />
        <NavLink icon={FlaskConical} label="SIMULATION" active />
        <NavLink icon={FileText} label="LAB RESULTS" />
      </nav>

      {/* User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Chef Alchemist</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-molecular-blue)', fontFamily: 'var(--font-mono)' }}>LVL 42 MOLECULAR</div>
        </div>
        <div style={{ 
          width: 40, 
          height: 40, 
          borderRadius: '50%', 
          background: 'var(--bg-app)', 
          border: '2px solid var(--color-molecular-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <User size={20} color="var(--text-primary)" />
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ icon: Icon, label, active }) => (
  <a href="#" style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: 'var(--spacing-sm)', 
    textDecoration: 'none',
    color: active ? 'var(--color-neon-cyan)' : 'var(--text-secondary)',
    borderBottom: active ? '2px solid var(--color-neon-cyan)' : '2px solid transparent',
    paddingBottom: '4px',
    transition: 'all 0.2s ease'
  }}>
    <Icon size={18} />
    <span style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.5px' }}>{label}</span>
  </a>
);

export default Header;
