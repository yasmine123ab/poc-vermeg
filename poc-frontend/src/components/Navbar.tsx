import React from 'react';
import { NavLink } from 'react-router-dom';

const navStyle: React.CSSProperties = {
  backgroundColor: '#1F4E79',
  padding: '0 32px',
  display: 'flex',
  alignItems: 'center',
  height: '60px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const logoStyle: React.CSSProperties = {
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '20px',
  letterSpacing: '1px',
  marginRight: '40px',
  textDecoration: 'none',
};

const navLinksStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  flex: 1,
};

const linkStyle: React.CSSProperties = {
  color: '#cce4f7',
  textDecoration: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 500,
  transition: 'background 0.2s, color 0.2s',
};

const activeLinkStyle: React.CSSProperties = {
  ...linkStyle,
  backgroundColor: '#2E75B6',
  color: '#ffffff',
};

const Navbar: React.FC = () => {
  return (
    <nav style={navStyle}>
      <span style={logoStyle}>POC Vermeg</span>
      <div style={navLinksStyle}>
        <NavLink
          to="/"
          end
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/flux"
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          Flux
        </NavLink>
        <NavLink
          to="/executions"
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          Exécutions
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
