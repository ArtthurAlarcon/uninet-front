// ----------------------------------------------------------------------

const ROOTS = {
  DASHBOARD: '/dashboard',
  CONTACTS: '/contacts',
};

// ----------------------------------------------------------------------

export const paths = {
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    one: `${ROOTS.DASHBOARD}/one`,
    two: `${ROOTS.DASHBOARD}/two`,
    three: `${ROOTS.DASHBOARD}/three`,
    group: {
      root: `${ROOTS.DASHBOARD}/group`,
      five: `${ROOTS.DASHBOARD}/group/five`,
      six: `${ROOTS.DASHBOARD}/group/six`,
    },
  },
  contact: {
    root: ROOTS.CONTACTS,
    create: `${ROOTS.CONTACTS}/create`,
    delete: `${ROOTS.CONTACTS}/delete`,
    upload: `${ROOTS.CONTACTS}/upload`,
  },
};
