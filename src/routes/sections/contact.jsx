import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import CompactLayout from 'src/layouts/compact';

import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const PageContacts = lazy(() => import('src/pages/contacts/list'));
const ContactCreatePage = lazy(() => import('src/pages/contacts/create'));

// ----------------------------------------------------------------------
export const contactRoutes = [
  {
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [
      {
        path: 'contacts',
        element: (
          <CompactLayout>
            <PageContacts />
          </CompactLayout>
        ),
      },
      // Ruta para crear nuevo contacto
      {
        path: 'contacts/create',
        element: (
          <CompactLayout>
            <ContactCreatePage />
          </CompactLayout>
        ),
      },
      // Ruta para subida masiva
      // {
      //   path: 'contacts/upload',
      //   element: (
      //     <CompactLayout>
      //       <ContactUploadPage />
      //     </CompactLayout>
      //   ),
      // },
      // // Ruta para edición (si es necesaria)
      // {
      //   path: 'contacts/:id/edit',
      //   element: (
      //     <CompactLayout>
      //       <ContactEditPage />
      //     </CompactLayout>
      //   ),
      // },
    ],
  },
];
