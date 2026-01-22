import React, { useEffect, useState } from 'react';
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
      console.error("Error loanding meals:", error);
    }
  };

  useEffect(() => {
    loadMeals();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Il Mio Piano Alimentare</h1>
      </header>
      <main>
        <MealForm onMealAdded={loadMeals} />
        <MealList meals={meals} onDelete={loadMeals} />
      </main>
    </div>
  );
}

export default App;