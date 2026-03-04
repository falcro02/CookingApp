import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import { Dashboard } from './pages/Dashboard';
import { ManagePlan } from './pages/ManagePlan';
import './styles/App.css';

// Assicurati che API_BASE_URL punti al tuo backend locale o su AWS
const API_BASE_URL = process.env.REACT_APP_API_URL; 

function App() {
  
  // --- FUNZIONE DI TEST PER SIGNIN APPLE/GOOGLE ---
  const testSocialSignIn = async (provider: 'google' | 'apple') => {
    try {
      // 1. Simula l'idToken ricevuto dall'SDK del provider (es. popup Google)
      const mockIdToken = `fake-id-token-from-${provider}`;
      const url = `${API_BASE_URL}/signin/${provider}`;
      
      console.log(`Chiamando POST ${url} con idToken: ${mockIdToken}`);
      
      // 2. Invia la richiesta POST secondo le tue specifiche
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: mockIdToken })
      });
      
      if (!response.ok) {
         const errorText = await response.text();
         alert(`Errore ${response.status}: ${errorText}`);
         return;
      }

      // 3. Leggi la risposta (che dovrà contenere il jwtToken)
      const data = await response.json();
      alert(`Login con ${provider} riuscito!\n\nJWT Token ricevuto:\n` + data.jwtToken);
      
    } catch (error) {
      alert(`Errore di rete con ${provider}: ` + error);
    }
  };
  // ------------------------------------------------

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
                  <button onClick={signOut} className="signout-btn">Sign out</button>
                </div>
              </header>

              {/* --- BOTTONI DI TEST AGGIUNTI QUI --- */}
              <div style={{ padding: '15px', background: '#e9ecef', textAlign: 'center', marginBottom: '10px' }}>
                <strong style={{ marginRight: '15px' }}>Test API (Social Sign In): </strong>
                <button onClick={() => testSocialSignIn('google')} style={{ margin: '0 5px', padding: '8px 15px', background: '#DB4437', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Simula Google Sign In
                </button>
                <button onClick={() => testSocialSignIn('apple')} style={{ margin: '0 5px', padding: '8px 15px', background: '#000000', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Simula Apple Sign In
                </button>
              </div>
              {/* ------------------------------------ */}

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