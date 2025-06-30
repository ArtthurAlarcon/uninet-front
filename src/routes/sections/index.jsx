import { Navigate, useRoutes } from 'react-router-dom';

import { mainRoutes } from './main';
import { contactRoutes } from './contact';
import { dashboardRoutes } from './dashboard';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <Navigate to="/contacts" replace />,
    },

    // Dashboard routes
    ...dashboardRoutes,

    // Contacts
    ...contactRoutes,

    // Main routes
    ...mainRoutes,

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
