import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes';
//import Inicio from './paginas/inicial';
import './index.css';

//AppRoutes mostra o sistema de rotas na tela
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
   <AppRoutes/>
  </React.StrictMode>
);
