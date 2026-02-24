import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import './styles/App.css';
import { MealList } from './components/MealList';
import { MealForm } from './components/MealForm';
import { apiService } from './services/apiService';
import { Meal } from './types';

function App() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const loadMeals = async () => {
    try {
      const data = await apiService.getMeals();
      setMeals(data);
    } catch (error) {
      console.error("Error loading meals:", error);
    }
  };

  useEffect(() => {
    loadMeals();
  }, []);

  return (
    <Router>
      <div className="App">
        <Authenticator>
          {({ signOut, user }) => (
            <>
              <header className="App-header">
                <h1>Il Mio Piano Alimentare</h1>
                <div className="user-controls">
                  <span>Welcome, {user?.username}</span>
                  <button onClick={signOut} style={{ marginLeft: '10px' }}>Sign out</button>
                </div>
              </header>
              <main>
                <MealForm onMealAdded={loadMeals} />
                <MealList meals={meals} onDelete={loadMeals} />
              </main>
            </>
          )}
        </Authenticator>
      </div>
    </Router>
  );
}

export default App;