import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'eu-south-1_0DPU0R4y7',
      userPoolClientId: '31ipjdctvb00rdodtk1p2qi3e8',
      loginWith: {
        oauth: {
          // ATTENZIONE: Devi configurare questo dominio nella console AWS Cognito
          domain: 'IL-TUO-DOMINIO-COGNITO.auth.eu-south-1.amazoncognito.com',
          scopes: ['phone', 'email', 'profile', 'openid'],
          // Assicurati che l'URL qui sotto corrisponda a dove gira il tuo frontend locale
          redirectSignIn: ['http://localhost:3001/'], 
          redirectSignOut: ['http://localhost:3001/'],
          responseType: 'code'
        }
      }
    }
  }
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();