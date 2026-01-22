import React, { useState, useEffect } from 'react';
import './App.css';

// Define the Meal interface to match our DynamoDB structure
interface Meal {
  PK: string;
  SK: string;
  mealName: string;
  ingredients?: string[];
}

function App() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Replace this with your AWS Production URL after 'sam deploy'
  const API_BASE_URL = 'https://0v6qxoabjc.execute-api.eu-south-1.amazonaws.com/Prod/meals';

  // FETCH: Get all meals from the backend
  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      const data = await response.json();
      setMeals(data);
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
    }
  };

  // CREATE: Add a new meal
  const addMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, date }),
      });

      if (response.ok) {
        setName('');
        setDate('');
        fetchMeals(); // Refresh list after adding
      }
    } catch (error) {
      console.error("Error adding meal:", error);
    }
  };

  // DELETE: Remove a meal
  const deleteMeal = async (mealDate: string) => {
    const formattedDate = mealDate.replace('MEAL#', '');
    try {
      const response = await fetch(`${API_BASE_URL}?date=${formattedDate}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMeals();
      }
    } catch (error) {
      console.error("Error deleting meal:", error);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Cooking App Planner 🍳</h1>

      <form onSubmit={addMeal} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Meal name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type="submit">Add Meal</button>
      </form>

      <div className="meal-list">
        {loading ? (
          <p>Loading...</p>
        ) : (
          meals.map((meal) => (
            <div key={meal.SK} style={{ borderBottom: '1px solid #ccc', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span>
                <strong>{meal.SK.replace('MEAL#', '')}</strong>: {meal.mealName}
              </span>
              <button onClick={() => deleteMeal(meal.SK)} style={{ color: 'red' }}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;