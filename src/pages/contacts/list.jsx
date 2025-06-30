import { Helmet } from 'react-helmet-async';

import { ListView } from 'src/sections/contacts/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title>Contactos</title>
      </Helmet>

      <ListView />
    </>
  );
}
