import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
// Cadeia: tokens.css → base.css → formas.css → componentes.css → composicao.css (base importa tokens).
import './estilos/base.css';
import './estilos/formas.css';
import './estilos/componentes.css';
import './estilos/composicao.css';
import { App } from './App';

const raiz = document.getElementById('root');

if (!raiz) {
  throw new Error('Elemento raiz #root não foi encontrado.');
}

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
