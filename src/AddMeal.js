import React, { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { post, get } from 'aws-amplify/api';
import '@aws-amplify/ui-react/styles.css'; // This imports the default styling

// We configure Amplify to use the resources we just downloaded
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports'; // This file is created by 'amplify push'
Amplify.configure(awsExports);

export default function App() {
    const [meals, setMeals] = useState([]);

    // --- API FUNCTIONS (Same as before) ---
    const fetchMeals = async () => {
        try {
            const restOperation = get({ apiName: 'cookingApi', path: '/meals' });
            const response = await restOperation.response;
            const json = await response.body.json();
            setMeals(json);
        } catch (e) {
            console.log('Get call failed: ', e);
        }
    };

    const addMeal = async () => {
        try {
            const restOperation = post({
                apiName: 'cookingApi',
                path: '/meals',
                options: {
                    body: { weekDay: "Monday", mealType: "Dinner", ingredients: ["Chicken", "Rice"] }
                }
            });
            await restOperation.response;
            fetchMeals();
        } catch (e) {
            console.log('Add call failed: ', e);
        }
    };

    // Fetch data only after the component loads
    useEffect(() => {
        fetchMeals();
    }, []);

    // --- THE UI ---
    return (
        // This component forces the user to login/signup before seeing anything inside
        <Authenticator>
            {({ signOut, user }) => (
                <main style={{ padding: '20px' }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1>Welcome, {user?.username}</h1>
                        <button onClick={signOut}>Sign out</button>
                    </header>

                    <hr />

                    <section>
                        <h2>Meal Planner</h2>
                        <button onClick={addMeal} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                            + Add Test Meal
                        </button>

                        <h3>My List:</h3>
                        <ul>
                            {meals.map((meal, i) => (
                                <li key={i}>{meal.weekDay}: {meal.ingredients}</li>
                            ))}
                        </ul>
                    </section>
                </main>
            )}
        </Authenticator>
    );
}