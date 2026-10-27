import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router';
import { Rotas } from './rotas';

export function App(): ReactNode {
  return (
    <BrowserRouter>
      <Rotas />
    </BrowserRouter>
  );
}
