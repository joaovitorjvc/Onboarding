import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import type { PageSlug } from '@nuagehub/contracts';
import { resolveRoute } from './route-table';
import { NotFoundPage } from '../features/pages/NotFoundPage';
import { useFocusHeadingOnRouteChange } from '../features/pages/useFocusHeadingOnRouteChange';

export interface AppRoutesProps {
  renderPage: (slug: PageSlug) => ReactNode;
}

function RouteEntry({ renderPage }: AppRoutesProps): ReactNode {
  const location = useLocation();
  useFocusHeadingOnRouteChange();
  const resolution = resolveRoute(location.pathname);

  if (resolution.kind === 'redirect') return <Navigate replace to={resolution.to} />;
  if (resolution.kind === 'not-found') return <NotFoundPage />;
  return <>{renderPage(resolution.slug)}</>;
}

export function AppRoutes({ renderPage }: AppRoutesProps): ReactNode {
  return (
    <Routes>
      <Route path="*" element={<RouteEntry renderPage={renderPage} />} />
    </Routes>
  );
}
