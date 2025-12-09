import React, { useState, useEffect } from 'react';
import './App.css';
// CORRECT IMPORTS FOR REST API
import { get, post, del } from 'aws-amplify/api';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import awsconfig from './aws-exports'; // OR './amplifyconfiguration.json'

Amplify.configure(awsconfig);

function App() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- API FUNCTIONS ---

  // 1. Fetch Meals (GET)
  const fetchMeals = async () => {
    try {
      const restOperation = get({
        apiName: 'cookingapi',
        path: '/meals'
      });

      const response = await restOperation.response;
      const data = await response.body.json();

      console.log("Fetched meals:", data);

      if (Array.isArray(data)) {
        setMeals(data);
      } else {
        setMeals([]);
      }
    } catch (e) {
      console.error("Error fetching meals:", e);
    }
  };

  // 2. Add Meal (POST)
  const addMeal = async () => {
    setLoading(true);
    try {
      const restOperation = post({
        apiName: 'cookingapi',
        path: '/meals',
        options: {
          body: {
            name: "Secret Family Recipe",
            weekDay: "Friday",
            mealType: "Dinner",
            ingredients: ["Mystery", "Magic"]
          }
        }
      });

      await restOperation.response;

      // Refresh list after adding
      await fetchMeals();
    } catch (e) {
      console.error("Error adding meal:", e);
    }
    setLoading(false);
  };

  // 3. Delete Meal (DELETE)
  const deleteMeal = async (id) => {
    if (!window.confirm("Delete this meal?")) return;

    try {
      const restOperation = del({
        apiName: 'cookingapi',
        path: '/meals',
        options: {
          queryParams: { id: id }
        }
      });

      await restOperation.response;

      // Refresh list after deleting
      await fetchMeals();
    } catch (e) {
      console.error("Error deleting meal:", e);
    }
  };

  // Load data on startup
  useEffect(() => {
    // We only try to fetch if the user is logged in.
    // The Authenticator component handles this logic for us visually,
    // but the API call might run once before auth is ready if not careful.
    // However, Amplify's REST client usually handles pending auth states gracefully.
    fetchMeals();
  }, []);

  // --- UI RENDER ---
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="App">
          <header className="App-header">
            <h1>Hello, {user.username}</h1>
            <button onClick={signOut} style={{ marginBottom: '20px' }}>Sign Out</button>

            <div style={{ border: '1px solid white', padding: '20px', borderRadius: '10px' }}>
              <button onClick={addMeal} disabled={loading} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
                {loading ? "Saving..." : "Add Meal"}
              </button>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px', width: '100%', maxWidth: '600px' }}>
              {meals.map((meal) => (
                <li key={meal.id} style={{ border: '1px solid #444', margin: '10px 0', padding: '15px', borderRadius: '8px', textAlign: 'left', background: '#333' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0' }}>{meal.name}</h3>
                      <small style={{ color: '#ccc' }}>{meal.weekDay} - {meal.mealType}</small>
                      <br />
                      <small style={{ color: '#aaa' }}>{meal.ingredients ? meal.ingredients.join(', ') : ''}</small>
                    </div>
                    <button onClick={() => deleteMeal(meal.id)} style={{ color: 'white', background: 'red', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '5px' }}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </header>
        </div>
      )}
    </Authenticator>
  );
}

export default App;