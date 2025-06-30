import Container from '@mui/material/Container';

import { _userCards } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';

import UserCardList from '../user-card-list';

// ----------------------------------------------------------------------

export default function UserCardsView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <UserCardList users={_userCards} />
    </Container>
  );
}
