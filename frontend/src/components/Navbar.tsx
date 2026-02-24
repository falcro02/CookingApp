import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <nav style={{ padding: '1rem', background: '#f0f0f0', marginBottom: '1rem' }}>
            <ul style={{ listStyle: 'none', display: 'flex', gap: '1rem', margin: 0, padding: 0 }}>
                <li><Link to="/">Dashboard</Link></li>
                <li><Link to="/pantry">Pantry</Link></li>
                <li><Link to="/recipes">AI Recipes</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
