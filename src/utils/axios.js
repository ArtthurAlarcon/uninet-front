import axios from 'axios';

import { HOST_API, BACK_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });
const axiosService = axios.create({ baseURL: BACK_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

const instance = axios.create({ baseURL: BACK_API });
instance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);
export { instance };

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

export const fetchier = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosService.get(url, { ...config });

  return res.data;
};

export const fetcherPost = async (args, dataValue) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const accessToken = localStorage.getItem('accessToken');

  const res = await instance.post(
    url,
    { dataValue },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Token: accessToken,
      },
      ...config,
    }
  );

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    register: '/api/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  contact: {
    list: '/api/contactos/relaciones',
    create: '/api/contactos',
    update: (id) => `/api/contactos/${id}`,
    getById: (id) => `/api/contactos/${id}`,
  },
};
