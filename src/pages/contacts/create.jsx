import { Helmet } from 'react-helmet-async';

import { UserCreateView } from 'src/sections/contacts/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Crear contacto</title>
      </Helmet>

      <UserCreateView />
    </>
  );
}
