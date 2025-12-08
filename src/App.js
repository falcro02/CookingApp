import React, { useState, useEffect } from 'react';
import { post, get } from 'aws-amplify/api';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

Amplify.configure(awsExports);
// --------------------------------

function App() {
  const [meals, setMeals] = useState([]); // State to hold the list of meals

  // Function to fetch meals from the database
  const fetchMeals = async () => {
    try {
      const restOperation = get({
        apiName: 'cookingapi', // Ensure this matches your Amplify API name
        path: '/meals'
      });
      const response = await restOperation.response;
      const json = await response.body.json();

      console.log('Meals retrieved:', json);
      setMeals(json); // Update state with the data from DynamoDB
    } catch (e) {
      console.log('Get call failed: ', e);
    }
  };

  // Load meals when the app starts
  useEffect(() => {
    fetchMeals();
  }, []);

  // Your existing Add Function
  const addMeal = async () => {
    const mealData = {
      weekDay: "Monday",
      mealType: "Dinner",
      ingredients: ["Chicken", "Rice"]
    };

    try {
      const restOperation = post({
        apiName: 'cookingApi',
        path: '/meals',
        options: { body: mealData }
      });
      await restOperation.response;

      // After adding, refresh the list automatically!
      fetchMeals();
      alert("Meal added!");
    } catch (e) {
      console.log('Add call failed: ', e);
    }
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div style={{ padding: 20 }}>
          <h1>Cooking App for {user.username}</h1>
          <button onClick={signOut}>Sign out</button>
          <hr />

          <button onClick={addMeal} style={{ fontSize: '16px', padding: '10px' }}>
            Add "Chicken & Rice" (Monday)
          </button>

          <h2>My Meal Plan</h2>
          {meals.length === 0 ? <p>No meals planned yet.</p> : (
            <ul>
              {/* Map through the data to display it */}
              {meals.map((meal, index) => (
                <li key={index}>
                  <strong>{meal.weekDay} - {meal.mealType}:</strong> {meal.ingredients}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Authenticator>
  );
}

export default App;