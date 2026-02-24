import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import { Dashboard } from './pages/Dashboard';
import { ManagePlan } from './pages/ManagePlan';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Authenticator>
          {({ signOut, user }) => (
            <>
              <header className="App-header">
                <div>
                  <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h1>Il Mio Piano Alimentare</h1>
                  </Link>
                </div>
                <div className="user-controls">
                  Welcome, {user?.username}
                  <button
                    onClick={signOut}
                    className="signout-btn"
                  >
                    Sign out
                  </button>
                </div>
              </header>

              {/* NEW: Global Navigation Bar */}
              <nav className="main-nav">
                <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                  Today's Menu
                </NavLink>
                <NavLink to="/manage" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                  Weekly Planner
                </NavLink>
              </nav>

              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/manage" element={<ManagePlan />} />
                </Routes>
              </main>
            </>
          )}
        </Authenticator>
      </div>
    </Router>
  );
}

export default App;