import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Estilos globais antes dos CSS Modules: a cascata precisa repetir a ordem do css/styles.css legado.
import './theme/fonts';
import './theme/global.css';
import { App } from './app/App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento raiz do App_Web não foi encontrado.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
