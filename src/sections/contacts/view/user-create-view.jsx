import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';

import UserNewEditForm from '../user-new-edit-form';

// ----------------------------------------------------------------------

export default function UserCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xlg'}>
      <UserNewEditForm />
    </Container>
  );
}
