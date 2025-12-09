//Meaning: This is your Main Component.

//Function: It serves as the root of your component tree. Every other UI part of your application (like buttons, forms, or headers) will eventually be nested inside this component. Currently, it just displays your "Welcome" message.

import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Cooking Web App</h1>
        <p>
          Welcome to your new project.
        </p>
      </header>
    </div>
  );
}

export default App;