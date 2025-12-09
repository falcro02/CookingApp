//Meaning: This is the entry point of your React application.

//Function: It is the bridge between React and the web browser. It finds the HTML element with id="root" (located in public/index.html) and "renders" your main <App /> component inside it.


import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);